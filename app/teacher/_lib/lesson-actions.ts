import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

async function lessonAction(id: number, action: "qr" | "finish", signal: AbortSignal) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Неверный номер занятия.");
  const token = getTeacherToken();
  if (!token) { window.location.replace("/teacher-login"); throw new Error("Войдите снова."); }
  const response = await fetch(`${API_URL}/api/lessons/${id}/${action}`, {
    method: action === "qr" ? "POST" : "PATCH",
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal,
  });
  if (response.status === 401) {
    clearTeacherToken(); window.location.replace("/teacher-login"); throw new Error("Войдите снова.");
  }
  if (response.status === 403) throw new Error("Нет доступа к этому занятию.");
  if (response.status === 404) throw new Error("Занятие не найдено. Обновите страницу.");
  if (response.status === 400) throw new Error("Возможно, занятие уже завершено. Обновите страницу.");
  if (!response.ok) throw new Error("Сервер не смог выполнить действие. Обновите сведения о занятии перед повтором.");
  return response.json();
}

export async function generateQr(id: number, signal: AbortSignal) {
  const requestedAt = Date.now();
  const data = await lessonAction(id, "qr", signal);
  if (typeof data.qrToken !== "string" || !data.qrToken || !Number.isFinite(Date.parse(data.qrExpiresAt))) throw new Error("Не удалось прочитать QR-код сервера.");
  // Не показываем код дольше 15 секунд с момента запроса, даже при разнице часов.
  const deadline = Math.min(Date.parse(data.qrExpiresAt), requestedAt + 15000);
  if (deadline <= Date.now()) throw new Error("Срок QR-кода истёк при загрузке. Повторите запрос.");
  return { payload: JSON.stringify({ lessonId: id, qrToken: data.qrToken }), deadline };
}

export async function finishLesson(id: number, signal: AbortSignal): Promise<string> {
  const data = await lessonAction(id, "finish", signal);
  if (data.lesson?.id !== id || !Number.isFinite(Date.parse(data.lesson?.finishedAt))) throw new Error("Не удалось подтвердить завершение. Обновите страницу.");
  return data.lesson.finishedAt;
}
