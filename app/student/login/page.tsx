"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginStudent } from "../_lib/auth";

function Logo() {
  return (
    <div className="text-center text-sm font-bold leading-4">
      <span className="text-[#A77BD1]">[</span> SMART
      <br />
      &nbsp; ATTENDANCE <span className="text-[#A77BD1]">]</span>
    </div>
  );
}

function StudentBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#E6E5E8]"
    >
      {/* Основной серый фон */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#DAD9DD_0%,#EAE9EC_38%,#F1F0F2_68%,#DAD9DE_100%)]" />

      {/* Левая верхняя архитектурная плоскость */}
      <div
        className="absolute -left-[14%] -top-[20%] h-[90%] w-[62%] opacity-75"
        style={{
          background:
            "linear-gradient(135deg, rgba(151,150,157,0.38), rgba(190,189,195,0.22) 55%, transparent 80%)",
          clipPath: "polygon(0 0, 100% 0, 68% 100%, 0 78%)",
        }}
      />

      {/* Центральная светлая плоскость */}
      <div
        className="absolute left-[25%] -top-[18%] h-[100%] w-[48%] opacity-70"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.72), rgba(192,190,198,0.2) 65%, transparent)",
          clipPath: "polygon(35% 0, 100% 0, 55% 100%, 0 100%)",
        }}
      />

      {/* Правая верхняя серая плоскость */}
      <div
        className="absolute -right-[16%] -top-[15%] h-[82%] w-[62%] opacity-75"
        style={{
          background:
            "linear-gradient(145deg, rgba(165,163,171,0.36), rgba(218,216,222,0.18))",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 62%)",
        }}
      />

      {/* Нижняя левая поверхность */}
      <div
        className="absolute -bottom-[25%] -left-[12%] h-[65%] w-[72%] opacity-75"
        style={{
          background:
            "linear-gradient(35deg, rgba(151,150,157,0.32), rgba(194,192,200,0.2) 60%, transparent)",
          clipPath: "polygon(0 25%, 75% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Нижняя правая поверхность */}
      <div
        className="absolute -bottom-[22%] -right-[12%] h-[70%] w-[65%] opacity-70"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(166,164,173,0.28))",
          clipPath: "polygon(38% 0, 100% 18%, 100% 100%, 0 100%)",
        }}
      />

      {/* Архитектурная сетка */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 69px, rgba(92,90,99,0.19) 70px, transparent 71px), repeating-linear-gradient(90deg, transparent 0px, transparent 83px, rgba(92,90,99,0.16) 84px, transparent 85px)",
        }}
      />

      {/* Диагональные архитектурные линии */}
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
          stroke="#A7A5AD"
          strokeWidth="1.5"
        />
        <path
          d="M850 -80L1510 850"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M1020 -80L1510 600"
          stroke="#A7A5AD"
          strokeWidth="1.5"
        />
        <path
          d="M-100 920L1440 300"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
      </svg>

      {/* Нейтральное серое свечение */}
      <div
        className="absolute left-[15%] top-[10%] h-[80%] w-[70%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,244,247,0.42) 0%, rgba(190,189,197,0.16) 55%, transparent 78%)",
          filter: "blur(80px)",
        }}
      />

      {/* Небольшой лиловый акцент справа */}
      <div
        className="absolute -right-[10%] top-[5%] h-[45%] w-[35%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(202,180,226,0.2) 0%, transparent 75%)",
          filter: "blur(70px)",
        }}
      />

      {/* Лиловые дуги — другая композиция, чем на регистрации */}
      <svg
        className="absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-140 390C40 110 270 100 470 300"
          stroke="#DCC2F7"
          strokeWidth="26"
          strokeLinecap="round"
        />
        <path
          d="M1050 1030C1140 790 1320 720 1530 820"
          stroke="#DCC2F7"
          strokeWidth="30"
          strokeLinecap="round"
        />
      </svg>

      {/* Светлая область за карточкой */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(248,247,249,0.91)_0%,rgba(248,247,249,0.58)_35%,rgba(248,247,249,0.08)_76%)]" />
    </div>
  );
}

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
      <StudentBackground />

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
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
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

        <p className="mt-6 text-center text-sm text-[#68636E]">
          Ещё нет аккаунта?{" "}
          <Link
            href="/student/register"
            className="font-semibold text-[#A77BD1] transition hover:text-[#8052AE] hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}