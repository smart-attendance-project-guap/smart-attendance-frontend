
export const API_URL = "http://localhost:3000";

const TOKEN_KEY = "smart-attendance.student.token";
const USER_KEY = "smart-attendance.student.user";

export type StudentUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT";
  groupId: number | null;
};

export function getStudentToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStudentUser(): StudentUser | null {
  const storedUser = sessionStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as StudentUser;
  } catch {
    return null;
  }
}

export function clearStudentToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export async function loginStudent(email: string, password: string) {
  clearStudentToken();

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (response.status === 401) {
    throw new Error("Неверная почта или пароль.");
  }

  if (!response.ok) {
    throw new Error("Не удалось войти. Попробуйте ещё раз.");
  }

  const data = await response.json();

  if (data.user?.role !== "STUDENT") {
    throw new Error("Этот кабинет доступен только студентам.");
  }

  if (typeof data.token !== "string" || !data.token) {
    throw new Error("Сервер не вернул токен входа.");
  }

  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export async function verifyStudent(signal: AbortSignal) {
  const token = getStudentToken();

  if (!token) return false;

  const response = await fetch(`${API_URL}/api/protected`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    return false;
  }

  if (!response.ok) {
    throw new Error("Не удалось проверить вход.");
  }

  const data = await response.json();

  return data.user?.role === "STUDENT";
}
