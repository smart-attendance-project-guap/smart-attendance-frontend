
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

import {
  API_URL,
  getStudentToken,
  getStudentUser,
  verifyStudent,
  clearStudentToken,
  type StudentUser,
} from "./_lib/auth";

type AttendanceStats = {
  totalLessons: number;
  attendedLessons: number;
  missedLessons: number;
  rejectedLessons: number;
  attendancePercentage: number;
};

type Group = {
  id: number;
  name: string;
};

function Icon({
  type,
  size = 20,
}: {
  type:
    | "arrow"
    | "check"
    | "clock"
    | "history"
    | "graduation"
    | "qr"
    | "logout";
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
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "history":
      return <svg {...common}><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>;
    case "graduation":
      return <svg {...common}><path d="m2 10 10-6 10 6-10 6-10-6Z" /><path d="M6 12.5V17c3.5 2.7 8.5 2.7 12 0v-4.5M22 10v6" /></svg>;
    case "qr":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v2M14 20h2M20 19v2M18 20h3" /></svg>;
    case "logout":
      return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></svg>;
  }
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="relative flex h-[132px] w-full flex-col justify-between rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFA5D3] hover:shadow-[0_5px_16px_rgba(40,30,50,0.06)] sm:h-[136px] sm:p-3.5">
      <p className="max-w-full break-words pr-9 text-[13px] font-semibold leading-[1.35] text-[#37323B] sm:text-[14px]">
        {label}
      </p>

      <span className="absolute right-3 top-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEE7F3] text-[#9668BD] sm:right-3.5 sm:top-3.5">
        {icon}
      </span>

      <p className="text-center text-[32px] font-bold leading-none tracking-tight text-[#171717] sm:text-[34px]">
        {value}
      </p>
    </div>
  );
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

export default function StudentPage() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPage() {
      try {
        const authorized = await verifyStudent(controller.signal);

        if (!authorized) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const currentUser = getStudentUser();
        setUser(currentUser);

        if (currentUser?.groupId) {
          try {
            const groupsResponse = await fetch(
              `${API_URL}/api/registration/groups`,
              {
                cache: "no-store",
                signal: controller.signal,
              }
            );

            if (groupsResponse.ok) {
              const groupsData = await groupsResponse.json();
              const groups: Group[] = groupsData.groups || [];
              const studentGroup = groups.find(
                (group) => group.id === currentUser.groupId
              );

              setGroupName(studentGroup?.name || "");
            }
          } catch (cause) {
            if (
              cause instanceof DOMException &&
              cause.name === "AbortError"
            ) {
              return;
            }
          }
        }

        const token = getStudentToken();

        const response = await fetch(`${API_URL}/api/attendance/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          if (data.message === "Student is not assigned to a group") {
            throw new Error(
              "Ваш аккаунт пока не привязан к учебной группе."
            );
          }

          throw new Error(
            data.message ||
              "Не удалось загрузить статистику. Попробуйте позже."
          );
        }

        setStats(data);
      } catch (cause) {
        if (
          cause instanceof DOMException &&
          cause.name === "AbortError"
        ) {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Не удалось загрузить статистику."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => controller.abort();
  }, []);

  function handleLogout() {
    clearStudentToken();
    window.location.replace("/student/login");
  }

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Студент";

  return (
    <main className="min-h-screen bg-[#F7F5F8] px-3 py-2 text-[#171717] sm:px-5 sm:py-3">
      <div className="mx-auto w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-4 shadow-[0_2px_12px_rgba(30,25,35,0.025)] sm:p-5 lg:p-6">

        {/* Верхняя композиция: логотип слева, профиль справа */}
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

          {/* Карточка личного профиля */}
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

            <div className="relative z-10 min-w-0">
              <p className="text-[13px] font-bold tracking-[0.12em] text-[#68636E] sm:text-[14px]">
                ЛИЧНЫЙ ПРОФИЛЬ
              </p>

              <h2 className="mt-2 text-[23px] font-bold leading-tight tracking-tight text-[#171717] sm:text-[27px]">
                {fullName}
              </h2>

              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8DDF0] bg-white text-[#9668BD]">
                  <Icon type="graduation" size={24} />
                </span>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.13em] text-[#68636E] sm:text-[11px]">
                    УЧЕБНАЯ ГРУППА
                  </p>

                  <p className="mt-0.5 text-[17px] font-bold text-[#171717] sm:text-[18px]">
                    {groupName ||
                      (user?.groupId ? "Загрузка…" : "Не указана")}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="absolute right-3 top-3 z-20 inline-flex h-10 items-center gap-2 rounded-lg border border-[#D8D2DD] bg-white px-4 text-[13px] font-semibold text-[#37323B] shadow-sm transition hover:border-[#B58AD5] hover:text-[#895EB0] sm:right-5 sm:top-5 sm:h-11 sm:px-5 sm:text-[14px]"
            >
              Выйти
              <Icon type="logout" size={17} />
            </button>
          </div>
        </header>

        <div className="mb-4 h-px w-full bg-[#E5DFE9]" />

        {/* Статистика посещаемости */}
        <section className="flex flex-col items-start">
          <div className="mb-3 w-full text-left">
            <h2 className="text-[22px] font-bold tracking-[-0.5px] text-[#171717] sm:text-[24px]">
              Посещаемость
            </h2>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] text-[#68636E] sm:text-[14px]">
                Ваша статистика за всё время
              </p>

              {stats && !loading && !error && (
                <p className="text-[12px] font-medium text-[#68636E] sm:text-[13px]">
                  Завершено занятий:{" "}
                  <span className="font-bold text-[#171717]">
                    {stats.totalLessons}
                  </span>
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid w-full grid-cols-2 justify-items-start gap-3 sm:flex sm:flex-wrap sm:justify-start sm:gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[132px] w-full max-w-[176px] animate-pulse rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] sm:h-[136px] sm:w-[176px]"
                />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="w-full rounded-xl border border-red-200 bg-white p-5 text-left text-sm text-red-700"
            >
              {error}
            </div>
          ) : stats ? (
            <div className="grid w-full grid-cols-2 justify-items-start gap-3 sm:flex sm:flex-wrap sm:justify-start sm:gap-3">
              <Link
                href="/student/history"
                aria-label="Открыть историю посещаемости"
                className="group relative flex h-[132px] w-full max-w-[176px] flex-col justify-between rounded-xl border border-[#D5C4E4] bg-[#F0E8F6] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFA5D3] hover:bg-[#EAE0F2] sm:h-[136px] sm:w-[176px] sm:p-3.5"
              >
                <p className="whitespace-nowrap pr-9 text-[13px] font-bold leading-[1.35] text-[#37323B] sm:text-[14px]">
                  Посещаемость
                </p>

                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#9668BD] transition-transform group-hover:translate-x-1 sm:right-3.5 sm:top-3.5">
                  <Icon type="arrow" size={21} />
                </span>

                <p className="text-center text-[32px] font-bold leading-none tracking-tight text-[#171717] sm:text-[34px]">
                  {stats.attendancePercentage}%
                </p>
              </Link>

              <div className="w-full max-w-[176px] sm:w-[176px]">
                <MetricCard
                  label="Отмечено занятий"
                  value={stats.attendedLessons}
                  icon={<Icon type="check" size={20} />}
                />
              </div>

              <div className="w-full max-w-[176px] sm:w-[176px]">
                <MetricCard
                  label="Пропущено занятий"
                  value={stats.missedLessons}
                  icon={<Icon type="clock" size={20} />}
                />
              </div>

              <div className="w-full max-w-[176px] sm:w-[176px]">
                <MetricCard
                  label="Отклонённые отметки"
                  value={stats.rejectedLessons}
                  icon={<Icon type="check" size={20} />}
                />
              </div>
            </div>
          ) : null}
        </section>

        {/* Быстрые действия */}
        {!loading && !error && stats && (
          <section className="mt-4 grid w-full grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            <ActionCard
              href="/student/attendance"
              title="Отметить посещение"
              description="Сканирование QR-кода занятия"
              icon={<Icon type="qr" size={44} />}
            />

            <ActionCard
              href="/student/history"
              title="История посещаемости"
              description="Посещения, пропуски и отклонённые отметки"
              icon={<Icon type="history" size={44} />}
            />
          </section>
        )}
      </div>
    </main>
  );
}
