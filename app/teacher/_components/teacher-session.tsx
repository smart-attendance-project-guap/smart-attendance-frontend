
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearTeacherToken, verifyTeacher } from "../_lib/auth";

const TeacherLogoutContext = createContext<(() => void) | null>(null);

export function useTeacherLogout() {
  const logout = useContext(TeacherLogoutContext);

  if (!logout) {
    throw new Error("useTeacherLogout должен использоваться внутри TeacherSession");
  }

  return logout;
}

export default function TeacherSession({
  children,
}: {
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [attempt, setAttempt] = useState(0);

  function logout() {
    clearTeacherToken();
    window.location.replace("/teacher-login");
  }

  useEffect(() => {
    let active = true;
    let current: AbortController | undefined;

    async function check() {
      current?.abort();

      const controller = new AbortController();
      current = controller;

      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const valid = await verifyTeacher(controller.signal);

        if (!active || current !== controller) return;

        if (!valid) {
          clearTeacherToken();
          window.location.replace("/teacher-login");
          return;
        }

        setStatus("ready");
      } catch {
        if (active && current === controller) {
          setStatus("error");
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    void check();

    function onStorage(event: StorageEvent) {
      if (event.storageArea !== localStorage) return;
      if ((event.key === "smart-attendance.teacher.token" && event.newValue === null) || event.key === null) {
        clearTeacherToken();
        window.location.replace("/teacher-login");
      } else if (event.key === "smart-attendance.teacher.token") {
        // A different remembered account was selected in another tab.
        window.location.reload();
      }
    }

    window.addEventListener("focus", check);
    window.addEventListener("storage", onStorage);

    return () => {
      active = false;
      current?.abort();
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", onStorage);
    };
  }, [attempt]);

  if (status !== "ready") {
    return (
      <main
        lang="ru"
        className="min-h-screen bg-[#F7F5F8] p-6 text-[#171717]"
      >
        <p role="status">
          {status === "loading"
            ? "Проверяем вход…"
            : "Не удалось связаться с Backend. Проверьте, что сервер запущен."}
        </p>

        {status === "error" && (
          <button
            type="button"
            className="mt-4 min-h-11 rounded-lg bg-[#9B6BC0] px-5 py-2 font-semibold text-white transition hover:bg-[#8756AD]"
            onClick={() => {
              setStatus("loading");
              setAttempt((previous) => previous + 1);
            }}
          >
            Повторить
          </button>
        )}
      </main>
    );
  }

  return (
    <TeacherLogoutContext.Provider value={logout}>
      {children}
    </TeacherLogoutContext.Provider>
  );
}
