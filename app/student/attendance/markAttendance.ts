import { API_URL, getStudentToken } from "../_lib/auth";

export type AttendanceQrPayload = {
  lessonId: number;
  qrToken: string;
};

export type AttendanceMarkResult = {
  message: string;
  attendanceId: number;
};

export function parseAttendanceQr(qrValue: string): AttendanceQrPayload {
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

  return {
    lessonId: Number(lessonId),
    qrToken: qrToken.trim(),
  };
}

export async function markAttendanceByQr(
  qrValue: string,
  expectedLessonId?: number
): Promise<AttendanceMarkResult> {
  const { lessonId, qrToken } = parseAttendanceQr(qrValue);

  if (expectedLessonId !== undefined && lessonId !== expectedLessonId) {
    throw new Error(
      "QR-код относится к другому занятию. Проверь выбранную пару или выбери другую."
    );
  }

  const token = getStudentToken();

  if (!token) {
    throw new Error("Необходимо войти в аккаунт студента.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/attendance/${lessonId}/mark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qrToken }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error("Нет связи с сервером. Попробуй ещё раз.");
  }

  const responseData: unknown = await response.json().catch(() => ({}));
  const data =
    typeof responseData === "object" &&
    responseData !== null &&
    !Array.isArray(responseData)
      ? (responseData as Record<string, unknown>)
      : {};

  if (response.status === 401) {
    throw new Error("Сеанс истёк. Войди в аккаунт заново.");
  }

  if (response.status === 403) {
    throw new Error("Ты не принадлежишь к группе этого занятия.");
  }

  const backendMessage =
    typeof data.message === "string" ? data.message : "";

  if (
    response.status === 409 ||
    (response.status === 400 &&
      backendMessage.toLowerCase().includes("attendance already marked"))
  ) {
    throw new Error("Посещение уже было отмечено.");
  }

  if (response.status === 400) {
    if (backendMessage.toLowerCase().includes("qr code is not active")) {
      throw new Error("Срок действия QR-кода истёк. Попроси преподавателя обновить его.");
    }

    if (backendMessage.toLowerCase().includes("invalid qr token")) {
      throw new Error("QR-код недействителен.");
    }

    throw new Error(backendMessage || "QR-код недействителен, устарел или уже использован.");
  }

  if (!response.ok) {
    throw new Error(backendMessage || "Не удалось сохранить посещение.");
  }

  const attendance =
    typeof data.attendance === "object" && data.attendance !== null
      ? (data.attendance as Record<string, unknown>)
      : null;

  const attendanceId = attendance?.id;

  if (
    response.status !== 201 ||
    attendance?.status !== "PENDING" ||
    typeof attendanceId !== "number" ||
    !Number.isSafeInteger(attendanceId) ||
    attendanceId <= 0
  ) {
    throw new Error(
      "Сервер не вернул корректный идентификатор созданной отметки."
    );
  }

  return {
    message: "Отметка создана и ожидает проверки преподавателя.",
    attendanceId,
  };
}