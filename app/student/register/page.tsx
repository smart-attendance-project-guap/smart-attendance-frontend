
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "../_lib/auth";

type Group = {
  id: number;
  name: string;
};

const fieldClass =
  "h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className="h-5 w-5">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a9.8 9.8 0 0 1-3.1 4.2" />
      <path d="M6.2 6.2C3.9 7.7 3 10.2 3 12c0 2 4 7 9 7 1 0 2-.2 2.9-.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className="h-5 w-5">
      <path d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function StudentRegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      try {
        const response = await fetch(
          `${API_URL}/api/registration/groups`,
          { signal: AbortSignal.timeout(15000) }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Не удалось загрузить группы.");
        }

        if (!Array.isArray(data.groups)) {
          throw new Error("Некорректный список групп.");
        }

        setGroups(data.groups);
      } catch (cause) {
        setGroupsError(
          cause instanceof Error
            ? cause.message
            : "Ошибка загрузки групп."
        );
      } finally {
        setGroupsLoading(false);
      }
    }

    loadGroups();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!groupId) {
      setError("Выберите учебную группу.");
      return;
    }

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
          groupId: Number(groupId),
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

  const selectedGroup = groups.find(
    (group) => String(group.id) === groupId
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
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

              <h1 className="mt-4 text-3xl font-bold">Регистрация</h1>

              <p className="mt-2 text-slate-500">
                Создайте аккаунт студента
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Имя</label>
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Введите имя"
                    className={fieldClass}
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
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Учебная группа
                  </label>

                  {groupsLoading ? (
                    <div className={`${fieldClass} flex items-center text-slate-500`}>
                      Загружаем список групп…
                    </div>
                  ) : groupsError ? (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      Не удалось загрузить группы: {groupsError}
                    </div>
                  ) : groups.length === 0 ? (
                    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Сейчас нет доступных учебных групп.
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setGroupOpen(!groupOpen)}
                        aria-haspopup="listbox"
                        aria-expanded={groupOpen}
                        className={`${fieldClass} flex items-center justify-between text-left font-normal ${
                          groupOpen
                            ? "border-indigo-500 ring-2 ring-indigo-100"
                            : "hover:border-indigo-400"
                        }`}
                      >
                        <span className={selectedGroup ? "text-slate-900" : "text-slate-500"}>
                          {selectedGroup ? selectedGroup.name : "Выберите учебную группу"}
                        </span>

                        <svg
                          className={`h-5 w-5 shrink-0 text-indigo-600 transition-transform ${groupOpen ? "rotate-180" : ""}`}
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {groupOpen && (
                        <>
                          <button
                            type="button"
                            aria-label="Закрыть список групп"
                            className="fixed inset-0 z-10 cursor-default"
                            onClick={() => setGroupOpen(false)}
                          />

                          <div
                            role="listbox"
                            aria-label="Учебная группа"
                            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                          >
                            {groups.map((group) => (
                              <button
                                key={group.id}
                                type="button"
                                role="option"
                                aria-selected={groupId === String(group.id)}
                                onClick={() => {
                                  setGroupId(String(group.id));
                                  setGroupOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base transition ${
                                  groupId === String(group.id)
                                    ? "bg-indigo-50 font-semibold text-indigo-700"
                                    : "text-slate-800 hover:bg-slate-50"
                                }`}
                              >
                                {group.name}
                                {groupId === String(group.id) && (
                                  <span className="text-indigo-600">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Придумайте пароль"
                      autoComplete="new-password"
                      className={`${fieldClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Повторите пароль
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Повторите пароль"
                      autoComplete="new-password"
                      className={`${fieldClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                      aria-pressed={showConfirmPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || groupsLoading || groups.length === 0 || Boolean(groupsError)}
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Уже есть аккаунт?{" "}
                <Link href="/student/login" className="font-medium text-indigo-600 hover:underline">
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
