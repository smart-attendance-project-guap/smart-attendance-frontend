"use client";

import { useEffect, useState, type ReactNode } from "react";
import { clearTeacherToken, verifyTeacher } from "../_lib/auth";

export default function TeacherSession({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
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
        if (active && current === controller) setStatus("error");
      } finally {
        clearTimeout(timeout);
      }
    }
    void check();
    window.addEventListener("focus", check);
    return () => {
      active = false;
      current?.abort();
      window.removeEventListener("focus", check);
    };
  }, [attempt]);

  if (status !== "ready") {
    return <main lang="ru" className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <p role="status">{status === "loading" ? "Проверяем вход…" : "Не удалось связаться с Backend. Проверьте, что сервер запущен."}</p>
      {status === "error" && <button className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 py-2 text-white" onClick={() => { setStatus("loading"); setAttempt(attempt + 1); }}>Повторить</button>}
    </main>;
  }

  return <>
    <div lang="ru" className="flex justify-end border-b border-slate-200 bg-white px-6 py-2">
      <button onClick={logout} className="min-h-11 rounded-lg px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-700">Выйти</button>
    </div>
    {children}
  </>;
}
