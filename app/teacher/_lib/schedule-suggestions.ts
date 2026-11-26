import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type ScheduleSuggestion = {
  id: number;
  canonicalScheduleId: number;
  discipline: string;
  classroom: string;
  startsAt: string;
  endsAt: string;
  groups: { id: number; name: string }[];
};
export type ScheduleClassroom = { id: number; name: string; building?: { name: string } | null };
export class ScheduleStartError extends Error {
  constructor(message: string, public classrooms: ScheduleClassroom[] = []) {
    super(message); this.name = "ScheduleStartError";
  }
}
function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isSuggestion(value: unknown): value is ScheduleSuggestion {
  return record(value) && positiveId(value.id) && positiveId(value.canonicalScheduleId) &&
    typeof value.discipline === "string" && typeof value.classroom === "string" &&
    typeof value.startsAt === "string" && Number.isFinite(Date.parse(value.startsAt)) &&
    typeof value.endsAt === "string" && Number.isFinite(Date.parse(value.endsAt)) &&
    Date.parse(value.endsAt) > Date.parse(value.startsAt) &&
    Array.isArray(value.groups) && value.groups.length > 0 &&
    value.groups.every((group) => record(group) && positiveId(group.id) && typeof group.name === "string");
}
function isClassroom(value: unknown): value is ScheduleClassroom {
  return record(value) && positiveId(value.id) && typeof value.name === "string" &&
    (value.building == null || (record(value.building) && typeof value.building.name === "string"));
}
function authHeaders() {
  const token = getTeacherToken();
  if (!token) throw new Error("Войдите в кабинет преподавателя заново.");
  return { Authorization: `Bearer ${token}` };
}
function checkAuth(status: number) {
  if (status === 401) {
    clearTeacherToken(); throw new Error("Сессия истекла. Войдите заново.");
  }
  if (status === 403) throw new Error("Нет доступа к этому расписанию.");
}
export async function fetchScheduleSuggestions(signal: AbortSignal): Promise<ScheduleSuggestion[]> {
  const response = await fetch(`${API_URL}/api/schedule/suggestions`, {
    headers: authHeaders(), cache: "no-store", signal,
  });
  checkAuth(response.status);
  if (response.status === 404) throw new Error("Сервер не поддерживает предложения пар. Проверьте версию Backend.");
  if (!response.ok) throw new Error("Не удалось получить ближайшие пары.");
  const data = await response.json();
  if (!Array.isArray(data?.suggestions) || !data.suggestions.every(isSuggestion)) {
    throw new Error("Сервер вернул непонятный список пар. Попробуйте обновить его позже.");
  }
  return data.suggestions.filter((item: ScheduleSuggestion, index: number, items: ScheduleSuggestion[]) =>
    items.findIndex((other) => other.canonicalScheduleId === item.canonicalScheduleId) === index);
}
const errors: Record<string, string> = {
  "Lesson may be started only within its 30-minute suggestion window": "Время запуска этой пары уже изменилось. Обновите список ближайших пар.",
  "Shared schedule entries are inconsistent": "В расписании общей пары есть несоответствия. Обратитесь к ответственному за расписание.",
  "One lesson supports at most four groups": "В одной паре может участвовать не более четырёх групп.",
  "Schedule discipline missing from reference data": "Дисциплина отсутствует в справочнике. Обратитесь к ответственному за расписание.",
  "An overlapping lesson already exists; open it instead": "На это время уже есть пересекающееся занятие. Проверьте раздел «Мои занятия».",
  "Physical education is excluded from attendance tracking": "Физкультура не включается в учёт посещаемости.",
};
export async function startScheduledLesson(id: number, signal: AbortSignal, classroomId?: number): Promise<number> {
  if (!positiveId(id) || (classroomId !== undefined && !positiveId(classroomId))) throw new Error("Некорректный номер пары или аудитории.");
  const response = await fetch(`${API_URL}/api/schedule/${id}/start`, {
    method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(classroomId === undefined ? {} : { classroomId }), signal,
  });
  checkAuth(response.status);
  const data = await response.json().catch(() => null);
  if (response.status === 409) {
    if (Array.isArray(data?.classrooms)) {
      const rooms = data.classrooms.filter(isClassroom);
      throw new ScheduleStartError(rooms.length
        ? "Уточните аудиторию и корпус для этой пары."
        : "Аудитория не найдена в справочнике. Обратитесь к ответственному за расписание.", rooms);
    }
    throw new ScheduleStartError(errors[data?.message] || "Не удалось запустить пару. Обновите список и проверьте расписание.");
  }
  if (response.status === 404) throw new Error("Пара не найдена или версия Backend не поддерживает запуск из расписания.");
  if (!response.ok) throw new Error("Не удалось запустить занятие. Попробуйте ещё раз.");
  if (!positiveId(data?.lessonId) || typeof data?.created !== "boolean") throw new Error("Сервер не вернул номер занятия. Проверьте «Мои занятия» перед повторной попыткой.");
  return data.lessonId;
}
