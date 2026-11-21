"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "../_lib/auth";

type Group = {
  id: number;
  name: string;
};

const fieldClass =
  "h-10 w-full rounded-[6px] border border-[#D8D2DD] bg-[#FCFBFD] px-3 text-sm outline-none transition placeholder:text-[#99939E] focus:border-[#A77BD1] focus:ring-2 focus:ring-[#E2CFF7] disabled:opacity-60";

function Logo() {
  return (
    <div className="text-center text-sm font-bold leading-4">
      <span className="text-[#A77BD1]">[</span> SMART
      <br />
      &nbsp; ATTENDANCE <span className="text-[#A77BD1]">]</span>
    </div>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a9.8 9.8 0 0 1-3.1 4.2" />
      <path d="M6.2 6.2C3.9 7.7 3 10.2 3 12c0 2 4 7 9 7 1 0 2-.2 2.9-.6" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArchitecturalBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#E6E5E8]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#DAD9DD_0%,#E9E8EB_35%,#F0EFF2_65%,#DAD9DE_100%)]" />

      <div
        className="absolute -left-[12%] -top-[20%] h-[90%] w-[60%] opacity-80"
        style={{
          background:
            "linear-gradient(135deg, rgba(150,149,155,0.38), rgba(190,189,195,0.24) 55%, transparent 80%)",
          clipPath: "polygon(0 0, 100% 0, 68% 100%, 0 78%)",
        }}
      />

      <div
        className="absolute left-[28%] -top-[15%] h-[100%] w-[48%] opacity-70"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(190,189,197,0.22) 65%, transparent)",
          clipPath: "polygon(35% 0, 100% 0, 55% 100%, 0 100%)",
        }}
      />

      <div
        className="absolute -right-[15%] -top-[18%] h-[85%] w-[60%] opacity-75"
        style={{
          background:
            "linear-gradient(145deg, rgba(167,165,173,0.38), rgba(218,216,222,0.2))",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 62%)",
        }}
      />

      <div
        className="absolute -bottom-[25%] -left-[10%] h-[65%] w-[72%] opacity-80"
        style={{
          background:
            "linear-gradient(35deg, rgba(151,150,157,0.32), rgba(194,192,200,0.2) 60%, transparent)",
          clipPath: "polygon(0 25%, 75% 0, 100% 100%, 0 100%)",
        }}
      />

      <div
        className="absolute -bottom-[20%] -right-[12%] h-[70%] w-[65%] opacity-70"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(166,164,173,0.28))",
          clipPath: "polygon(38% 0, 100% 18%, 100% 100%, 0 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 69px, rgba(92,90,99,0.2) 70px, transparent 71px), repeating-linear-gradient(90deg, transparent 0px, transparent 83px, rgba(92,90,99,0.17) 84px, transparent 85px)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-55"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M-100 780L520 -80" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M-80 860L620 -80" stroke="#A7A5AD" strokeWidth="2" />
        <path d="M850 -80L1510 850" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M1020 -80L1510 600" stroke="#A7A5AD" strokeWidth="1.5" />
        <path d="M-100 920L1440 300" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>

      <div
        className="absolute left-[15%] top-[10%] h-[80%] w-[70%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,244,247,0.42) 0%, rgba(190,189,197,0.16) 55%, transparent 78%)",
          filter: "blur(80px)",
        }}
      />

      <div
        className="absolute -right-[10%] top-[5%] h-[45%] w-[35%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(202,180,226,0.2) 0%, transparent 75%)",
          filter: "blur(70px)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-120 280C80 80 260 90 390 260"
          stroke="#DCC2F7"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M1120 980C1190 770 1320 700 1530 750"
          stroke="#DCC2F7"
          strokeWidth="30"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(248,247,249,0.9)_0%,rgba(248,247,249,0.55)_32%,rgba(248,247,249,0.08)_72%)]" />
    </div>
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
        const response = await fetch(`${API_URL}/api/registration/groups`, {
          signal: AbortSignal.timeout(15000),
        });

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
          cause instanceof Error ? cause.message : "Ошибка загрузки групп."
        );
      } finally {
        setGroupsLoading(false);
      }
    }

    loadGroups();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

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
        headers: { "Content-Type": "application/json" },
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 text-[#171717] sm:py-8">
      <ArchitecturalBackground />

      <section className="relative z-10 w-full max-w-[520px] rounded-xl border border-[#D8D2DD] bg-[#FCFBFD]/95 p-5 shadow-[0_18px_60px_rgba(42,36,48,0.08)] backdrop-blur-sm sm:p-7">
        <Link
          href="/"
          className="inline-flex text-sm text-[#68636E] transition hover:text-[#8052AE]"
        >
          ← Назад
        </Link>

        {success ? (
          <div className="py-7 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E2CFF7] text-2xl text-[#8052AE]">
              ✓
            </div>
            <h1 className="mt-5 text-2xl font-bold">
              Регистрация завершена!
            </h1>
            <p className="mt-2 text-sm text-[#68636E]">
              Теперь вы можете войти в свой аккаунт.
            </p>
            <Link
              href="/student/login"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-[6px] bg-[#222222] px-6 text-sm font-semibold text-white transition hover:bg-[#383838]"
            >
              Перейти ко входу
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3">
              <Logo />
            </div>

            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D9BDF5]" />

            <h1 className="mt-3 text-center text-[26px] font-bold">
              Регистрация
            </h1>
            <p className="mt-1 text-center text-sm text-[#68636E]">
              Создайте аккаунт студента
            </p>

            <form
              onSubmit={handleSubmit}
              aria-busy={loading}
              className="mt-5 space-y-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-sm">
                    Имя
                  </label>
                  <input
                    id="firstName"
                    required
                    disabled={loading}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Введите имя"
                    autoComplete="given-name"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-sm">
                    Фамилия
                  </label>
                  <input
                    id="lastName"
                    required
                    disabled={loading}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Введите фамилию"
                    autoComplete="family-name"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="group" className="mb-1.5 block text-sm">
                  Учебная группа
                </label>

                {groupsLoading ? (
                  <div className={`${fieldClass} flex items-center text-[#68636E]`}>
                    Загружаем список групп…
                  </div>
                ) : groupsError ? (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 p-2.5 text-sm text-red-700"
                  >
                    Не удалось загрузить группы: {groupsError}
                  </div>
                ) : groups.length === 0 ? (
                  <div
                    role="alert"
                    className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800"
                  >
                    Сейчас нет доступных учебных групп.
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      id="group"
                      type="button"
                      disabled={loading}
                      onClick={() => setGroupOpen(!groupOpen)}
                      aria-haspopup="listbox"
                      aria-expanded={groupOpen}
                      className={`${fieldClass} flex items-center justify-between text-left ${
                        groupOpen
                          ? "border-[#A77BD1] ring-2 ring-[#E2CFF7]"
                          : "hover:border-[#A77BD1]"
                      }`}
                    >
                      <span
                        className={
                          selectedGroup ? "text-[#171717]" : "text-[#99939E]"
                        }
                      >
                        {selectedGroup
                          ? selectedGroup.name
                          : "Выберите учебную группу"}
                      </span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-[#A77BD1] transition-transform ${
                          groupOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="m5 7 5 5 5-5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
                          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-48 overflow-y-auto rounded-lg border border-[#D8D2DD] bg-[#FCFBFD] p-1.5 shadow-lg"
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
                              className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${
                                groupId === String(group.id)
                                  ? "bg-[#E2CFF7] font-semibold text-[#8052AE]"
                                  : "text-[#171717] hover:bg-[#F0E9F6]"
                              }`}
                            >
                              {group.name}
                              {groupId === String(group.id) && (
                                <span className="text-[#8052AE]">✓</span>
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
                <label htmlFor="email" className="mb-1.5 block text-sm">
                  Электронная почта
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  disabled={loading}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@mail.com"
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      required
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Придумайте пароль"
                      autoComplete="new-password"
                      className={`${fieldClass} pr-10`}
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A77BD1] transition hover:text-[#8052AE] disabled:opacity-50"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm"
                  >
                    Повторите пароль
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Повторите пароль"
                      autoComplete="new-password"
                      className={`${fieldClass} pr-10`}
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Скрыть пароль"
                          : "Показать пароль"
                      }
                      aria-pressed={showConfirmPassword}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A77BD1] transition hover:text-[#8052AE] disabled:opacity-50"
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 p-2.5 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  groupsLoading ||
                  groups.length === 0 ||
                  Boolean(groupsError)
                }
                className="h-10 w-full rounded-[6px] bg-[#222222] px-6 text-sm font-semibold text-white transition hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[#68636E]">
              Уже есть аккаунт?{" "}
              <Link
                href="/student/login"
                className="font-semibold text-[#A77BD1] transition hover:text-[#8052AE] hover:underline"
              >
                Войти
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}