
"use client";

import { useState } from "react";
import Link from "next/link";
import { API_URL } from "../_lib/auth";

export default function StudentRegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: "STUDENT",
        }),
        signal: AbortSignal.timeout(15000),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось зарегистрироваться.");
      }

      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Ошибка регистрации. Попробуйте ещё раз."
      );
    } finally {
      setLoading(false);
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
          {success ? (
            <div className="py-6 text-center">
              <div className="text-5xl">✓</div>
              <h1 className="mt-5 text-2xl font-bold">
                Регистрация завершена!
              </h1>
              <p className="mt-3 text-slate-500">
                Теперь вы можете войти в свой аккаунт.
              </p>
              <Link
                href="/student/login"
                className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Перейти ко входу
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold tracking-widest text-indigo-600">
                SMART ATTENDANCE
              </p>

              <h1 className="mt-4 text-3xl font-bold">
                Регистрация
              </h1>

              <p className="mt-2 text-slate-500">
                Создайте аккаунт студента
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Имя
                  </label>
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Введите имя"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Фамилия
                  </label>
                  <input
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Введите фамилию"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Электронная почта
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@mail.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Пароль
                  </label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Придумайте пароль"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Повторите пароль
                  </label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Повторите пароль"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
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
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Уже есть аккаунт?{" "}
                <Link
                  href="/student/login"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Войти
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
