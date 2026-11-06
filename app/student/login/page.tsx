
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginStudent } from "../_lib/auth";

export default function StudentLoginPage() {
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
      await loginStudent(
        String(form.get("email") ?? ""),
        String(form.get("password") ?? "")
      );

      window.location.replace("/student");
    } catch (cause) {
      setError(
        cause instanceof TypeError ||
          (cause instanceof DOMException && cause.name === "TimeoutError")
          ? "Нет связи с сервером. Проверьте, что Backend запущен, и повторите вход."
          : cause instanceof Error
            ? cause.message
            : "Не удалось войти."
      );

      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-lg">
        <Link
          href="/student/access"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Назад
        </Link>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold tracking-widest text-indigo-600">
            SMART ATTENDANCE
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Вход студента
          </h1>

          <p className="mt-2 text-slate-500">
            Войдите в свою учётную запись
          </p>

          <form
            onSubmit={submit}
            aria-busy={pending}
            className="mt-8 space-y-5"
          >
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Электронная почта
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={pending}
                placeholder="example@mail.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Пароль
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  placeholder="Введите пароль"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-14 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  disabled={pending}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c5.5 0 9 7 9 7a17.3 17.3 0 0 1-3.1 4.1M6.2 6.2A17.1 17.1 0 0 0 3 12s3.5 7 9 7a10.3 10.3 0 0 0 4.2-.9" />
                      </>
                    ) : (
                      <>
                        <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Входим…" : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ещё нет аккаунта?{" "}
            <Link
              href="/student/register"
              className="font-medium text-indigo-600 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
