import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type AttendanceTotals = {
  totalStudents: number;
  attendedStudents: number;
  attendancePercentage: number;
};
export type TeacherSummary = AttendanceTotals & { totalLessons: number };
export type GroupStatistics = TeacherSummary & { groupId: number; groupName: string };
export type LessonStatistics = AttendanceTotals & {
  lessonId: number; startsAt: string; endsAt: string;
  group: { id: number; name: string };
  classroom: { id: number; name: string };
};
export type TeacherStatistics = {
  summary: TeacherSummary; groups: GroupStatistics[]; lessons: LessonStatistics[];
};

type RecordData = Record<string, unknown>;
function record(value: unknown): value is RecordData {
  return typeof value === "object" && value !== null;
}
function count(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
function totals(value: unknown): value is AttendanceTotals {
  return record(value) && count(value.totalStudents) && count(value.attendedStudents)
    && typeof value.attendancePercentage === "number" && Number.isFinite(value.attendancePercentage)
    && value.attendancePercentage >= 0;
}
function summary(value: unknown): value is TeacherSummary {
  return record(value) && count(value.totalLessons) && totals(value);
}
function reference(value: unknown): value is { id: number; name: string } {
  return record(value) && count(value.id) && value.id > 0 && typeof value.name === "string";
}
function date(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function group(value: unknown): value is GroupStatistics {
  return record(value) && count(value.groupId) && value.groupId > 0 && typeof value.groupName === "string" && summary(value);
}
function lesson(value: unknown): value is LessonStatistics {
  return record(value) && count(value.lessonId) && value.lessonId > 0
    && date(value.startsAt) && date(value.endsAt) && reference(value.group) && reference(value.classroom) && totals(value);
}

async function request(path: string, token: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_URL}/api/attendance/teacher/${path}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal,
  });
  if (response.status === 401) {
    clearTeacherToken(); window.location.replace("/teacher-login"); throw new Error("Войдите снова.");
  }
  if (response.status === 403) throw new Error("Статистика доступна только преподавателю.");
  if (!response.ok) throw new Error("Не удалось загрузить статистику. Попробуйте обновить данные.");
  return response.json();
}

export async function getTeacherStatistics(signal: AbortSignal): Promise<TeacherStatistics> {
  const token = getTeacherToken();
  if (!token) { window.location.replace("/teacher-login"); throw new Error("Войдите снова."); }
  const [overall, byGroup, byLesson] = await Promise.all([
    request("stats", token, signal), request("groups/stats", token, signal), request("lessons/stats", token, signal),
  ]);
  if (!summary(overall) || !record(byGroup) || !Array.isArray(byGroup.stats) || !byGroup.stats.every(group)
    || !record(byLesson) || !Array.isArray(byLesson.stats) || !byLesson.stats.every(lesson)) {
    throw new Error("Сервер вернул неверный формат статистики.");
  }
  return {
    summary: overall,
    groups: [...byGroup.stats].sort((a, b) => a.groupName.localeCompare(b.groupName, "ru")),
    lessons: [...byLesson.stats].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)),
  };
}
