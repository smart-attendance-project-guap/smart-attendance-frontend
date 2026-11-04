import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type Lesson = {
  id: number;
  discipline: string;
  startsAt: string;
  endsAt: string;
  finishedAt: string | null;
  group: { id: number; name: string };
  classroom: { id: number; name: string };
};

export async function getLessons(signal: AbortSignal): Promise<Lesson[]> {
  const token = getTeacherToken();
  if (!token) {
    window.location.replace("/teacher-login");
    throw new Error("Войдите в кабинет преподавателя.");
  }
  const response = await fetch(`${API_URL}/api/lessons`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal,
  });
  if (response.status === 401 || response.status === 403) {
    clearTeacherToken();
    window.location.replace("/teacher-login");
    throw new Error("Войдите в кабинет преподавателя.");
  }
  if (!response.ok) throw new Error("Не удалось получить занятия с сервера.");
  const data = await response.json();
  if (!Array.isArray(data.lessons)) throw new Error("Сервер вернул неверный формат списка занятий.");
  return data.lessons;
}

// Только finishedAt подтверждает явное завершение занятия на Backend.
export function lessonStatus(lesson: Lesson, now: number) {
  if (lesson.finishedAt) return "Завершено";
  if (new Date(lesson.startsAt).getTime() > now) return "Запланировано";
  if (new Date(lesson.endsAt).getTime() <= now) return "Время занятия истекло";
  return "Идёт занятие";
}
export function formatDate(value: string) { return new Date(value).toLocaleDateString("ru-RU"); }
export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
