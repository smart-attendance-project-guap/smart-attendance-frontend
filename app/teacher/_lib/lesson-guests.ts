import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type LessonGuest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  group: { id: number; name: string } | null;
};
function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function isGuest(value: unknown): value is LessonGuest {
  return record(value) && positiveId(value.id) && typeof value.firstName === "string" &&
    typeof value.lastName === "string" && typeof value.email === "string" &&
    (value.group === null || (record(value.group) && positiveId(value.group.id) && typeof value.group.name === "string"));
}
const messages: Record<string, string> = {
  "Student not found": "Студент с такой почтой не найден. Проверьте адрес и регистрацию студента.",
  "Student is already eligible via their group": "Студент уже участвует в этой паре вместе со своей группой. Отдельное разрешение не требуется.",
  "Lesson has ended": "Занятие завершено или его время истекло. Добавить гостя уже нельзя.",
  "studentEmail is required": "Укажите корректную почту студента.",
  "Lesson not found among your lessons": "Занятие не найдено среди ваших занятий.",
};
async function request(lessonId: number, signal: AbortSignal, studentEmail?: string) {
  if (!positiveId(lessonId)) throw new Error("Некорректный номер занятия.");
  const token = getTeacherToken();
  if (!token) throw new Error("Войдите в кабинет преподавателя заново.");
  const response = await fetch(`${API_URL}/api/lessons/${lessonId}/guests`, {
    method: studentEmail === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, ...(studentEmail === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(studentEmail === undefined ? {} : { body: JSON.stringify({ studentEmail }) }),
    cache: "no-store", signal,
  });
  if (response.status === 401) {
    clearTeacherToken(); throw new Error("Сессия истекла. Войдите заново.");
  }
  if (response.status === 403) throw new Error("Управлять гостями может только преподаватель этого занятия.");
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (typeof data?.message === "string" && messages[data.message]) throw new Error(messages[data.message]);
    if (response.status === 404) throw new Error("Занятие или функция гостевого посещения недоступны. Проверьте занятие и версию Backend.");
    throw new Error(studentEmail === undefined ? "Не удалось получить список гостей." : "Не удалось разрешить посещение. Попробуйте позже.");
  }
  return data;
}
export async function getLessonGuests(lessonId: number, signal: AbortSignal): Promise<LessonGuest[]> {
  const data = await request(lessonId, signal);
  if (!Array.isArray(data?.guests) || !data.guests.every(isGuest)) throw new Error("Сервер вернул непонятный список гостей. Повторите загрузку позже.");
  return data.guests;
}
export async function allowLessonGuest(lessonId: number, email: string, signal: AbortSignal): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("Укажите корректную почту студента.");
  const data = await request(lessonId, signal, normalized);
  if (data?.lessonId !== lessonId || !positiveId(data?.studentId) || data?.allowed !== true) {
    throw new Error("Сервер не подтвердил разрешение. Обновите список гостей перед повторной попыткой.");
  }
}
