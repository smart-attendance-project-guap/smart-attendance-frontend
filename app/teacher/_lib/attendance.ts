import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type Student = { id: number; firstName: string; lastName: string; email: string };
export type Attendance = {
  id: number; studentId: number; status: "PENDING" | "PRESENT" | "LATE" | "REJECTED";
  markedAt: string; reviewed: boolean; faceChecked: boolean; deviceChecked: boolean;
  locationChecked: boolean; rejectionReason: string | null; student: Student;
};
export type AttendanceRow = { student: Student; attendance: Attendance | null };

async function request(path: string, signal: AbortSignal, action?: "approve" | "reject", reason?: string) {
  const token = getTeacherToken();
  if (!token) { window.location.replace("/teacher-login"); throw new Error("Войдите снова."); }
  const response = await fetch(`${API_URL}/api/attendance/${path}`, {
    method: action ? "PATCH" : "GET", signal, cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(action === "reject" ? { "Content-Type": "application/json" } : {}) },
    ...(action === "reject" ? { body: JSON.stringify({ rejectionReason: reason }) } : {}),
  });
  if (response.status === 401) { clearTeacherToken(); window.location.replace("/teacher-login"); throw new Error("Войдите снова."); }
  if (response.status === 403) throw new Error("Нет доступа к посещаемости этого занятия.");
  if (response.status === 404) throw new Error("Занятие или отметка не найдены. Обновите данные.");
  if (response.status === 400) throw new Error("Отметка могла быть уже рассмотрена. Обновите данные и проверьте её статус.");
  if (!response.ok) throw new Error("Сервер не смог выполнить запрос. Обновите данные перед повтором.");
  return response.json();
}

// absentStudents включает PENDING и REJECTED: объединяем по ID без повторных строк.
export function mergeAttendance(attendances: Attendance[], absentStudents: Student[]): AttendanceRow[] {
  const rows = new Map<number, AttendanceRow>();
  for (const student of absentStudents) rows.set(student.id, { student, attendance: null });
  for (const attendance of attendances) rows.set(attendance.studentId, { student: attendance.student, attendance });
  return [...rows.values()].sort((a, b) => `${a.student.lastName} ${a.student.firstName}`.localeCompare(`${b.student.lastName} ${b.student.firstName}`, "ru"));
}

export async function getAttendance(lessonId: number, signal: AbortSignal): Promise<AttendanceRow[]> {
  const data = await request(`lesson/${lessonId}`, signal);
  const studentValid = (s: Student) => s && Number.isInteger(s.id) && typeof s.firstName === "string" && typeof s.lastName === "string" && typeof s.email === "string";
  if (data.lessonId !== lessonId || !Array.isArray(data.attendances) || !Array.isArray(data.absentStudents)
    || !data.absentStudents.every(studentValid) || !data.attendances.every((a: Attendance) => a && Number.isInteger(a.id) && a.studentId === a.student?.id && studentValid(a.student) && ["PENDING", "PRESENT", "LATE", "REJECTED"].includes(a.status) && typeof a.reviewed === "boolean" && [a.faceChecked, a.deviceChecked, a.locationChecked].every(v => typeof v === "boolean") && Number.isFinite(Date.parse(a.markedAt)))) {
    throw new Error("Не удалось прочитать данные посещаемости сервера.");
  }
  return mergeAttendance(data.attendances, data.absentStudents);
}

export async function reviewAttendance(id: number, action: "approve" | "reject", signal: AbortSignal, reason = "") {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Неверный номер отметки.");
  if (action === "reject" && !reason.trim()) throw new Error("Укажите причину отклонения.");
  const data = await request(`${id}/${action}`, signal, action, reason.trim());
  if (data.attendance?.id !== id || data.attendance.reviewed !== true || !(action === "reject" ? data.attendance.status === "REJECTED" : ["PRESENT", "LATE"].includes(data.attendance.status))) throw new Error("Не удалось подтвердить результат. Обновите данные перед повтором.");
}


// Backend принимает решения по одному: сохраняем последовательно и останавливаемся
// при первой ошибке. Уже сохранённые решения не откатываются и не повторяются.
export async function reviewAttendanceBatch(
  ids: number[], action: "approve" | "reject", signal: AbortSignal,
  reason = "", onProgress?: (completed: number) => void,
): Promise<{ completed: number; error: string | null }> {
  const targets = [...new Set(ids)];
  if (!targets.length || targets.some(id => !Number.isInteger(id) || id <= 0)) throw new Error("Выберите заявки для рассмотрения.");
  if (action === "reject" && !reason.trim()) throw new Error("Укажите причину отклонения.");
  let completed = 0;
  for (const id of targets) {
    if (signal.aborted) return { completed, error: "Обработка прервана." };
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, 15000);
    try {
      await reviewAttendance(id, action, controller.signal, reason);
      completed++;
      onProgress?.(completed);
    } catch (cause) {
      return { completed, error: controller.signal.aborted || cause instanceof TypeError
        ? "Не получено подтверждение сервера для следующей заявки; её результат нужно проверить."
        : cause instanceof Error ? cause.message : "Не удалось сохранить решение." };
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
    }
  }
  return { completed, error: null };
}
