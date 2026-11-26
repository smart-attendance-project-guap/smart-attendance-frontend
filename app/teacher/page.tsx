
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTeacherLogout } from "./_components/teacher-session";

function Icon({
  type,
  size = 24,
}: {
  type: "arrow" | "lessons" | "statistics" | "logout";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );

    case "lessons":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18M8 14h3M8 17h6" />
        </svg>
      );

    case "statistics":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h17" />
          <path d="m7 15 4-4 3 2 6-7" />
          <path d="M16 6h4v4" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
      );
  }
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[176px] items-center justify-between gap-5 overflow-hidden rounded-xl border border-[#343238] bg-[#343238] px-5 py-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4B4550] hover:bg-[#29272D] hover:shadow-[0_10px_24px_rgba(30,25,35,0.13)] sm:min-h-[194px] sm:px-8 sm:py-7 lg:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-24 h-60 w-60 rounded-full border-[18px] border-white/[0.055] transition-transform duration-300 group-hover:scale-110"
      />

      <div className="relative z-10 flex min-w-0 items-center gap-4 sm:gap-6">
        <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl bg-[#E9DDF2] text-[#895BB2] sm:h-[82px] sm:w-[82px]">
          {icon}
        </span>

        <div className="min-w-0">
          <h3 className="text-[20px] font-bold leading-tight text-white sm:text-[25px]">
            {title}
          </h3>

          <p className="mt-2 text-[13px] leading-5 text-[#D0CBD4] sm:text-[15px]">
            {description}
          </p>
        </div>
      </div>

      <span className="relative z-10 shrink-0 text-[#D8B9F1] transition-transform duration-200 group-hover:translate-x-1">
        <Icon type="arrow" size={34} />
      </span>
    </Link>
  );
}

export default function TeacherPage() {
  const logout = useTeacherLogout();

  return (
    <main className="min-h-screen bg-[#F7F5F8] px-3 py-2 text-[#171717] sm:px-5 sm:py-3">
      <div className="mx-auto w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-4 shadow-[0_2px_12px_rgba(30,25,35,0.025)] sm:p-5 lg:p-6">
        {/* Верхняя композиция */}
        <header className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Логотип */}
          <div className="relative flex min-h-[160px] flex-col justify-center overflow-hidden sm:min-h-[175px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-12 h-[170px] w-[170px] rounded-full border-[14px] border-[#F0EDF2]"
            />

            <div className="relative z-10">
              <h1 className="text-[clamp(44px,5vw,68px)] font-black leading-[0.87] tracking-[-0.075em] text-[#171717]">
                SMART
                <br />
                ATTENDANCE
              </h1>

              <div className="mt-3 h-[3px] w-[54px] rounded-full bg-[#B58AD5]" />

              <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#68636E] sm:text-[11px]">
                STUDENT ATTENDANCE SYSTEM
              </p>
            </div>
          </div>

          {/* Карточка профиля преподавателя */}
          <div className="relative flex min-h-[160px] items-center overflow-hidden rounded-xl border border-[#D8D2DD] bg-[#F3F0F4] px-5 py-5 sm:min-h-[175px] sm:px-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-36 h-[290px] w-[290px] rounded-full border-[17px] border-[#E9E5EC]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -bottom-48 h-[320px] w-[320px] rounded-full border-[17px] border-[#E7D9F0]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[29%] top-[-35%] h-[180%] w-px rotate-[-38deg] bg-white"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[17%] top-[-35%] h-[180%] w-px rotate-[-38deg] bg-white"
            />

            <div className="relative z-10 min-w-0 pr-32">
              <p className="text-[13px] font-bold tracking-[0.12em] text-[#68636E] sm:text-[14px]">
                ЛИЧНЫЙ ПРОФИЛЬ
              </p>

              <h2 className="mt-2 text-[23px] font-bold leading-tight tracking-tight text-[#171717] sm:text-[27px]">
                Кабинет преподавателя
              </h2>

              <p className="mt-3 text-[13px] font-medium text-[#68636E]">
                SMART ATTENDANCE
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="absolute right-3 top-3 z-20 inline-flex h-10 items-center gap-2 rounded-lg border border-[#D8D2DD] bg-white px-4 text-[13px] font-semibold text-[#37323B] shadow-sm transition hover:border-[#B58AD5] hover:text-[#895EB0] sm:right-5 sm:top-5 sm:h-11 sm:px-5 sm:text-[14px]"
            >
              Выйти
              <Icon type="logout" size={17} />
            </button>
          </div>
        </header>

        <div className="mb-4 h-px w-full bg-[#E5DFE9]" />

        {/* Рабочее пространство */}
        <section>
          <div className="mb-4">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#A16FC5]">
              РАБОЧЕЕ ПРОСТРАНСТВО
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.5px] text-[#171717] sm:text-[24px]">
              Кабинет преподавателя
            </h2>

            <p className="mt-1 text-[13px] text-[#68636E] sm:text-[14px]">
              Управление занятиями и просмотр статистики посещаемости.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <ActionCard
              href="/teacher/lessons"
              title="Мои занятия"
              description="Просмотр и управление занятиями"
              icon={<Icon type="lessons" size={44} />}
            />

            <ActionCard
              href="/teacher/statistics"
              title="Статистика"
              description="Посещаемость и результаты студентов"
              icon={<Icon type="statistics" size={44} />}
            />
          </div>
          <Link href="/teacher/schedule/import" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#895BB2] hover:underline">
            Загрузить расписание
          </Link>
        </section>
      </div>
    </main>
  );
}
