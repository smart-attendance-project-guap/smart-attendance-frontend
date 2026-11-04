"use client";

import { useState, type FormEvent } from "react";
import { loginTeacher } from "../teacher/_lib/auth";

export default function TeacherLoginPage() {
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setShowPassword(false);
    setPending(true);
    setError("");
    try {
      await loginTeacher(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      window.location.replace("/teacher");
    } catch (cause) {
      setError(cause instanceof TypeError || (cause instanceof DOMException && cause.name === "TimeoutError")
        ? "Нет связи с сервером. Проверьте, что Backend запущен, и повторите вход."
        : cause instanceof Error ? cause.message : "Не удалось войти.");
      setPending(false);
    }
  }

  return (
    <main lang="ru" className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold text-blue-700">Smart Attendance</p>
        <h1 className="mt-3 text-3xl font-bold">Вход преподавателя</h1>
        <p className="mt-4 leading-7 text-slate-600">Войдите в свою учётную запись преподавателя.</p>
        <form onSubmit={submit} aria-busy={pending} className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold">Электронная почта</label>
            <input id="email" name="email" type="email" autoComplete="username" required disabled={pending} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-blue-700" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold">Пароль</label>
            <div className="relative mt-2">
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={pending} className="min-h-11 w-full rounded-lg border border-slate-300 py-3 pl-3 pr-14 focus:outline-blue-700" />
              <button
                type="button"
                disabled={pending}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                aria-controls="password"
                title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPassword(value => !value)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-50"
              >
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c5.5 0 9 7 9 7a17.3 17.3 0 0 1-3.1 4.1M6.2 6.2A17.1 17.1 0 0 0 3 12s3.5 7 9 7a10.3 10.3 0 0 0 4.2-.9" /></> : <><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" /></>}
                </svg>
              </button>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={pending} className="min-h-11 w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 disabled:opacity-60">
            {pending ? "Входим…" : "Войти"}
          </button>
        </form>
      </div>
    </main>
  );
}
