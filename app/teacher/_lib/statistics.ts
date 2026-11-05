import { getLessons } from "./lessons";
import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type AttendanceTotals = {
  totalStudents: number;
  attendedStudents: number;
  attendancePercentage: number;
};
export type TeacherSummary = AttendanceTotals & { totalLessons: number };
export type GroupStatistics = TeacherSummary & { groupId: number; groupName: string };
export type LessonStatistics = AttendanceTotals & {
  discipline?: string; lessonId: number; startsAt: string; endsAt: string;
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
  const [overall, byGroup, byLesson, lessons] = await Promise.all([
    request("stats", token, signal), request("groups/stats", token, signal), request("lessons/stats", token, signal), getLessons(signal),
  ]);
  if (!summary(overall) || !record(byGroup) || !Array.isArray(byGroup.stats) || !byGroup.stats.every(group)
    || !record(byLesson) || !Array.isArray(byLesson.stats) || !byLesson.stats.every(lesson)) {
    throw new Error("Сервер вернул неверный формат статистики.");
  }
  return {
    summary: overall,
    groups: [...byGroup.stats].sort((a, b) => a.groupName.localeCompare(b.groupName, "ru")),
    lessons: byLesson.stats.map(item => {
      const source = lessons.find(lesson => lesson.id === item.lessonId);
      if (!source) throw new Error("Список занятий изменился. Обновите статистику.");
      return { ...item, discipline: typeof source.discipline === "string" && source.discipline.trim() ? source.discipline : "Без дисциплины" };
    }).sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)),
  };
}


export type StatisticsFilters = { groupId: string; discipline: string; from: string; to: string };
export const EMPTY_STATISTICS_FILTERS: StatisticsFilters = { groupId: "", discipline: "", from: "", to: "" };

// Дата начала занятия в часовом поясе устройства, без сдвига даты через UTC.
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function filterTeacherStatistics(data: TeacherStatistics, filters: StatisticsFilters): TeacherStatistics {
  if (!Object.values(filters).some(Boolean)) return data;
  const lessons = filters.from && filters.to && filters.from > filters.to ? [] : data.lessons.filter(lesson => {
    const day = localDateKey(new Date(lesson.startsAt));
    return (!filters.groupId || String(lesson.group.id) === filters.groupId)
      && (!filters.discipline || lesson.discipline === filters.discipline)
      && (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to);
  });
  const summary: TeacherSummary = { totalLessons: lessons.length, totalStudents: 0, attendedStudents: 0, attendancePercentage: 0 };
  const groups = new Map<number, GroupStatistics>();
  for (const lesson of lessons) {
    summary.totalStudents += lesson.totalStudents;
    summary.attendedStudents += lesson.attendedStudents;
    const group = groups.get(lesson.group.id) ?? { groupId: lesson.group.id, groupName: lesson.group.name, totalLessons: 0, totalStudents: 0, attendedStudents: 0, attendancePercentage: 0 };
    group.totalLessons++;
    group.totalStudents += lesson.totalStudents;
    group.attendedStudents += lesson.attendedStudents;
    groups.set(group.groupId, group);
  }
  const rate = (totals: AttendanceTotals) => totals.totalStudents ? Number((totals.attendedStudents / totals.totalStudents * 100).toFixed(2)) : 0;
  summary.attendancePercentage = rate(summary);
  for (const group of groups.values()) group.attendancePercentage = rate(group);
  return { summary, lessons, groups: [...groups.values()].sort((a, b) => a.groupName.localeCompare(b.groupName, "ru")) };
}


export function academicYearStart(date: Date): number {
  return date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
}

export function semesterDates(year: number, semester: 1 | 2): { from: string; to: string } {
  return semester === 1
    ? { from: `${year}-09-01`, to: `${year + 1}-01-31` }
    : { from: `${year + 1}-02-01`, to: `${year + 1}-08-31` };
}
