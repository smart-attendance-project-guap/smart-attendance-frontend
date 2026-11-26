import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";
import type { StatisticsFilters } from "./statistics";

export function exportValidation(filters: StatisticsFilters): string {
  if (!/^[1-9]\d*$/.test(filters.groupId) || !filters.discipline.trim() || !filters.from || !filters.to) {
    return "Для Excel выберите одну группу, дисциплину и обе даты периода.";
  }
  const dates = [filters.from, filters.to].map(value => new Date(`${value}T00:00:00Z`));
  if (dates.some((date, index) => !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== [filters.from, filters.to][index])) {
    return "Укажите корректные даты периода.";
  }
  const duration = dates[1].getTime() - dates[0].getTime();
  if (duration < 0) return "Окончание периода должно быть не раньше начала.";
  if (duration > 180 * 86400000) return "Для Excel выберите период не более 180 дней.";
  return "";
}

export async function fetchAttendanceWorkbook(filters: StatisticsFilters, signal: AbortSignal): Promise<Blob> {
  const invalid = exportValidation(filters);
  if (invalid) throw new Error(invalid);
  const token = getTeacherToken();
  if (!token) throw new Error("Войдите в кабинет преподавателя заново.");
  const query = new URLSearchParams({ groupId: filters.groupId, discipline: filters.discipline, from: filters.from, to: filters.to });
  const response = await fetch(`${API_URL}/api/attendance/teacher/export?${query}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal,
  });
  if (response.status === 401) {
    clearTeacherToken();
    throw new Error("Сессия истекла. Войдите в кабинет преподавателя заново.");
  }
  if (response.status === 403) throw new Error("Нет доступа к журналу выбранной группы и дисциплины.");
  if (response.status === 404) throw new Error("Выгрузка недоступна: проверьте версию Backend и выбранную группу.");
  if (response.status === 400) throw new Error("Сервер отклонил параметры отчёта. Проверьте группу, дисциплину и период; при необходимости сократите период.");
  if (!response.ok) throw new Error("Не удалось выгрузить журнал. Попробуйте ещё раз.");
  if (!response.headers.get("content-type")?.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
    throw new Error("Сервер вернул ответ вместо файла Excel. Файл не сохранён.");
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error("Сервер вернул пустой файл.");
  return blob;
}
