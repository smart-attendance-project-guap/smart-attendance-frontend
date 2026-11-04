"use client";

import { useState, type FormEvent } from "react";
import { loginTeacher } from "../teacher/_lib/auth";

export default function TeacherLoginPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
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
            <input id="password" name="password" type="password" autoComplete="current-password" required disabled={pending} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-blue-700" />
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
