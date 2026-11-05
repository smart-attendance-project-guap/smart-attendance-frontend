import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export const DISCIPLINES = ["Базы данных", "Программирование", "Алгоритмы и структуры данных"] as const;
export type Reference = { id: number; name: string };
export type LessonInput = { discipline: string; groupId: number; classroomId: number; startsAt: string; endsAt: string };

async function request(path: string, signal: AbortSignal, body?: LessonInput) {
  const token = getTeacherToken();
  if (!token) { window.location.replace("/teacher-login"); throw new Error("Войдите в кабинет преподавателя."); }
  const response = await fetch(`${API_URL}/api/${path}`, {
    method: body ? "POST" : "GET", signal, cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 401 || response.status === 403) {
    clearTeacherToken(); window.location.replace("/teacher-login"); throw new Error("Войдите в кабинет преподавателя.");
  }
  if (!response.ok) {
    if (body && response.status === 404) throw new Error("Группа или аудитория больше не найдена. Обновите страницу и выберите их заново.");
    if (body && response.status === 400) throw new Error("Проверьте дисциплину, группу, аудиторию и время занятия.");
    throw new Error(body ? "Не удалось создать занятие. Проверьте список занятий перед повторной отправкой." : "Не удалось загрузить группы и аудитории.");
  }
  return response.json();
}

export async function getLessonReferences(signal: AbortSignal): Promise<{ groups: Reference[]; classrooms: Reference[] }> {
  const [groupsData, classroomsData] = await Promise.all([request("groups", signal), request("classrooms", signal)]);
  const valid = (value: unknown): value is Reference[] => Array.isArray(value) && value.every(item => item && Number.isInteger(item.id) && item.id > 0 && typeof item.name === "string");
  if (!valid(groupsData.groups) || !valid(classroomsData.classrooms)) throw new Error("Сервер вернул неверный формат групп или аудиторий.");
  return { groups: groupsData.groups, classrooms: classroomsData.classrooms };
}

export async function createLesson(input: LessonInput, signal: AbortSignal): Promise<number> {
  if (!(DISCIPLINES as readonly string[]).includes(input.discipline)) throw new Error("Выберите дисциплину из списка.");
  if (!Number.isInteger(input.groupId) || input.groupId <= 0 || !Number.isInteger(input.classroomId) || input.classroomId <= 0) throw new Error("Выберите группу и аудиторию.");
  const start = new Date(input.startsAt), end = new Date(input.endsAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) throw new Error("Окончание занятия должно быть позже начала.");
  const data = await request("lessons", signal, { ...input, startsAt: start.toISOString(), endsAt: end.toISOString() });
  if (!Number.isInteger(data.lesson?.id) || data.lesson.id <= 0) throw new Error("Не удалось прочитать ответ сервера. Проверьте список занятий перед повторной отправкой.");
  return data.lesson.id;
}
