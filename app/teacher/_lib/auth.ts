export const API_URL = "http://localhost:3000";
const TOKEN_KEY = "smart-attendance.teacher.token";

export function getTeacherToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearTeacherToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function loginTeacher(email: string, password: string) {
  clearTeacherToken();
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 401) throw new Error("Неверная почта или пароль.");
  if (!response.ok) throw new Error("Не удалось войти. Попробуйте ещё раз.");
  const data = await response.json();
  if (data.user?.role !== "TEACHER") {
    clearTeacherToken();
    throw new Error("Этот кабинет доступен только преподавателям.");
  }
  if (typeof data.token !== "string" || !data.token) {
    throw new Error("Сервер не вернул токен входа.");
  }
  sessionStorage.setItem(TOKEN_KEY, data.token);
}

export async function verifyTeacher(signal: AbortSignal) {
  const token = getTeacherToken();
  if (!token) return false;
  const response = await fetch(`${API_URL}/api/protected`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });
  if (response.status === 401 || response.status === 403) return false;
  if (!response.ok) throw new Error("Не удалось проверить вход.");
  const data = await response.json();
  return data.user?.role === "TEACHER";
}
