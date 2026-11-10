
import { API_URL, getStudentToken } from "../_lib/auth";

export async function markAttendanceByQr(qrValue: string) {
  let payload: unknown;

  try {
    payload = JSON.parse(qrValue);
  } catch {
    throw new Error("Неверный формат QR-кода.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Неверный формат QR-кода.");
  }

  const { lessonId, qrToken } = payload as Record<string, unknown>;

  if (
    !Number.isSafeInteger(lessonId) ||
    Number(lessonId) <= 0 ||
    typeof qrToken !== "string" ||
    !qrToken.trim()
  ) {
    throw new Error("QR-код не относится к занятию Smart Attendance.");
  }

  const token = getStudentToken();

  if (!token) {
    throw new Error("Необходимо войти в аккаунт студента.");
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/api/attendance/${lessonId}/mark`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrToken }),
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch {
    throw new Error("Нет связи с сервером. Попробуй ещё раз.");
  }

  if (response.status === 401) {
    throw new Error("Сеанс истёк. Войди в аккаунт заново.");
  }

  if (response.status === 403) {
    throw new Error("Ты не принадлежишь к группе этого занятия.");
  }

  if (response.status === 409) {
    throw new Error("Посещение уже было отмечено.");
  }

  if (response.status === 400) {
    throw new Error("QR-код недействителен, устарел или уже использован.");
  }

  if (!response.ok) {
    throw new Error("Не удалось сохранить посещение.");
  }

  const result = await response.json();

  if (response.status !== 201 || result.attendance?.status !== "PENDING") {
    throw new Error("Не удалось подтвердить результат отметки.");
  }

  return "Отметка отправлена на проверку преподавателю.";
}
