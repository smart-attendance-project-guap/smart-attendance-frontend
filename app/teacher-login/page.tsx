"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginTeacher } from "../teacher/_lib/auth";

function Logo() {
  return (
    <div className="text-center text-sm font-bold leading-4">
      <span className="text-[#A77BD1]">[</span> SMART
      <br />
      &nbsp; ATTENDANCE <span className="text-[#A77BD1]">]</span>
    </div>
  );
}

function TeacherBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#EDECEF]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(125deg,#E5E4E7_0%,#F5F4F6_42%,#E9E7EC_100%)]" />

      {/* Большая левая архитектурная плоскость */}
      <div
        className="absolute -left-[12%] -top-[18%] h-[85%] w-[58%]"
        style={{
          background:
            "linear-gradient(145deg, rgba(181,180,186,0.42) 0%, rgba(213,211,218,0.3) 48%, rgba(241,239,243,0.08) 100%)",
          clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 78%)",
        }}
      />

      {/* Правая светлая плоскость */}
      <div
        className="absolute -right-[12%] -top-[12%] h-[75%] w-[58%]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(207,204,213,0.3))",
          clipPath: "polygon(35% 0, 100% 0, 100% 100%, 0 62%)",
        }}
      />

      {/* Нижняя центральная плоскость */}
      <div
        className="absolute -bottom-[30%] left-[15%] h-[65%] w-[72%]"
        style={{
          background:
            "linear-gradient(25deg, rgba(178,177,184,0.3), rgba(225,223,229,0.15) 65%, transparent)",
          clipPath: "polygon(0 40%, 55% 0, 100% 25%, 85% 100%, 0 100%)",
        }}
      />

      {/* Нижняя правая серая поверхность */}
      <div
        className="absolute -bottom-[20%] -right-[15%] h-[68%] w-[55%]"
        style={{
          background:
            "linear-gradient(145deg, rgba(194,191,201,0.35), rgba(231,229,234,0.12))",
          clipPath: "polygon(40% 0, 100% 12%, 100% 100%, 0 100%)",
        }}
      />

      {/* Архитектурная сетка */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 79px, rgba(103,101,110,0.16) 80px, transparent 81px), repeating-linear-gradient(90deg, transparent 0px, transparent 89px, rgba(103,101,110,0.14) 90px, transparent 91px)",
        }}
      />

      {/* Диагональные линии и границы плоскостей */}
      <svg
        className="absolute inset-0 h-full w-full opacity-50"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-100 780L520 -80"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M-80 860L620 -80"
          stroke="#B8B5BE"
          strokeWidth="1.5"
        />
        <path
          d="M850 -80L1510 850"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M1020 -80L1510 600"
          stroke="#B9B6C0"
          strokeWidth="1.5"
        />
        <path
          d="M-100 920L1440 300"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.7"
        />
      </svg>

      {/* Нейтральное серое свечение */}
      <div
        className="absolute left-[20%] top-[15%] h-[65%] w-[60%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.62) 0%, rgba(235,233,239,0.25) 48%, transparent 75%)",
          filter: "blur(75px)",
        }}
      />

      {/* Лиловый акцент справа */}
      <div
        className="absolute -right-[8%] top-[28%] h-[48%] w-[32%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(205,185,231,0.38) 0%, rgba(220,208,235,0.16) 48%, transparent 75%)",
          filter: "blur(65px)",
        }}
      />

      {/* Тонкая лиловая дуга в верхней левой части */}
      <svg
        className="absolute left-0 top-0 h-[42%] w-[42%] opacity-45"
        viewBox="0 0 600 420"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-80 360C80 60 270 30 480 190"
          stroke="#CDB3E9"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </svg>

      {/* Вторая короткая дуга справа */}
      <svg
        className="absolute bottom-0 right-0 h-[38%] w-[45%] opacity-50"
        viewBox="0 0 650 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M700 350C540 70 350 40 170 220"
          stroke="#D5C3EA"
          strokeWidth="25"
          strokeLinecap="round"
        />
      </svg>

      {/* Светлая зона вокруг карточки */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,249,251,0.94)_0%,rgba(250,249,251,0.68)_38%,rgba(250,249,251,0.08)_82%)]" />
    </div>
  );
}

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
      await loginTeacher(
        String(form.get("email") ?? ""),
        String(form.get("password") ?? ""),
        form.get("remember") === "on"
      );

      window.location.replace("/teacher");
    } catch (cause) {
      setError(
        cause instanceof TypeError ||
          (cause instanceof DOMException &&
            cause.name === "TimeoutError")
          ? "Нет связи с сервером. Проверьте, что Backend запущен, и повторите вход."
          : cause instanceof Error
            ? cause.message
            : "Не удалось войти."
      );

      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFBFD] px-4 py-8 text-[#171717]">
      <TeacherBackground />

      <div className="relative z-10 w-full max-w-[440px] rounded-xl border border-[#D8D2DD] bg-[#FCFBFD]/95 p-6 shadow-[0_18px_60px_rgba(42,36,48,0.08)] backdrop-blur-sm sm:p-9">
        <Link
          href="/role"
          className="text-sm text-[#68636E] transition hover:text-[#8052AE]"
        >
          ← Назад
        </Link>

        <div className="mt-7">
          <Logo />
        </div>

        <div className="mx-auto mt-7 h-1 w-12 rounded-full bg-[#D9BDF5]" />

        <h1 className="mt-5 text-center text-[28px] font-bold">
          Вход в систему
        </h1>

        <p className="mt-2 text-center text-sm text-[#68636E]">
          Для преподавателей
        </p>

        <form
          onSubmit={submit}
          aria-busy={pending}
          className="mt-8 space-y-5"
        >
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              Почта
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={pending}
              placeholder="example@mail.com"
              className="h-11 w-full rounded-[6px] border border-[#D8D2DD] bg-[#FCFBFD] px-3 text-sm outline-none transition placeholder:text-[#99939E] focus:border-[#A77BD1] focus:ring-2 focus:ring-[#E2CFF7] disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
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
                className="h-11 w-full rounded-[6px] border border-[#D8D2DD] bg-[#FCFBFD] px-3 pr-12 text-sm outline-none transition placeholder:text-[#99939E] focus:border-[#A77BD1] focus:ring-2 focus:ring-[#E2CFF7] disabled:opacity-60"
              />

              <button
                type="button"
                disabled={pending}
                aria-label={
                  showPassword ? "Скрыть пароль" : "Показать пароль"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#A77BD1] transition hover:text-[#8052AE] disabled:opacity-50"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c5.5 0 9 7 9 7a17.3 17.3 0 0 1-3.1 4.1M6.2 6.2A17.1 17.1 0 0 0 3 12s3.5 7 9 7a10.3 10.3 0 0 0 4.2-.9" />
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

          <div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" name="remember" disabled={pending}
                className="h-4 w-4 accent-[#9C68BC]" aria-describedby="remember-help" />
              Запомнить меня
            </label>
            <p id="remember-help" className="text-xs leading-5 text-[#68636E]">
              Вход сохранится в этом браузере до выхода из аккаунта или окончания сессии.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-[6px] bg-[#222222] px-5 text-sm font-semibold text-white transition hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Входим…" : "Войти"}
          </button>
        </form>
      </div>
    </main>
  );
}