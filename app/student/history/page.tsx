"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  API_URL,
  getStudentToken,
  getStudentUser,
  verifyStudent,
  clearStudentToken,
} from "../_lib/auth";

type Group = {
  id: number;
  name: string;
};

type Attendance = {
  id: number;
  status: string;
  markedAt: string;
  rejectionReason?: string | null;
  lesson: {
    id: number;
    title?: string;
    subject?: string;
    name?: string;
    discipline?: string | null;
    startsAt?: string;
    date?: string;
    startTime?: string;
    group?: { name?: string } | null;
    classroom?: { name?: string } | null;
  };
};

type MissedLesson = {
  id: number;
  discipline: string | null;
  startsAt: string;
  endsAt: string;
  finishedAt: string;
  group: { id: number; name: string };
  classroom: { id: number; name: string };
};

type HistoryEntry =
  | {
      type: "attendance";
      key: string;
      attendance: Attendance;
      sortDate: string;
    }
  | {
      type: "missed";
      key: string;
      lesson: MissedLesson;
      sortDate: string;
    };

const statusLabels: Record<string, string> = {
  PRESENT: "Присутствовал",
  LATE: "Опоздал",
  REJECTED: "Отклонено",
  PENDING: "Ожидает проверки",
  MISSED: "Пропуск",
};

const statusStyles: Record<string, string> = {
  PRESENT: "border-[#C9DCCF] bg-[#F0F7F1] text-[#39734A]",
  LATE: "border-[#E8D9B8] bg-[#FBF6EA] text-[#98702D]",
  REJECTED: "border-[#E8CACA] bg-[#FBF1F1] text-[#A54D4D]",
  PENDING: "border-[#D8C5E8] bg-[#F3ECF8] text-[#8055A4]",
  MISSED: "border-[#D8D2DD] bg-[#F3F0F4] text-[#68636E]",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Дата не указана";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Icon({
  type,
  size = 20,
}: {
  type: "arrow" | "calendar" | "clock" | "check" | "alert" | "book";
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
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M4 5.5v16M8 7h8M8 11h7" />
        </svg>
      );
  }
}

export default function StudentHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summary = {
    present: entries.filter(
      (entry) =>
        entry.type === "attendance" &&
        entry.attendance.status === "PRESENT"
    ).length,
    late: entries.filter(
      (entry) =>
        entry.type === "attendance" &&
        entry.attendance.status === "LATE"
    ).length,
    missed: entries.filter((entry) => entry.type === "missed").length,
    pending: entries.filter(
      (entry) =>
        entry.type === "attendance" &&
        entry.attendance.status === "PENDING"
    ).length,
    rejected: entries.filter(
      (entry) =>
        entry.type === "attendance" &&
        entry.attendance.status === "REJECTED"
    ).length,
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        const authorized = await verifyStudent(controller.signal);

        if (!authorized) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const user = getStudentUser();

        if (user?.groupId) {
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
                (group) => group.id === user.groupId
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

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [historyResponse, missedResponse] = await Promise.all([
          fetch(`${API_URL}/api/attendance/history`, {
            headers,
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${API_URL}/api/attendance/missed`, {
            headers,
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (
          historyResponse.status === 401 ||
          historyResponse.status === 403 ||
          missedResponse.status === 401 ||
          missedResponse.status === 403
        ) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const [historyData, missedData] = await Promise.all([
          historyResponse.json(),
          missedResponse.json(),
        ]);

        if (!historyResponse.ok) {
          throw new Error(
            historyData.message ||
              "Не удалось загрузить историю посещаемости."
          );
        }

        if (!missedResponse.ok) {
          throw new Error(
            missedData.message ||
              "Не удалось загрузить пропущенные занятия."
          );
        }

        const attendances: Attendance[] = Array.isArray(
          historyData.attendances
        )
          ? historyData.attendances
          : [];

        const missedLessons: MissedLesson[] = Array.isArray(
          missedData.missedLessons
        )
          ? missedData.missedLessons
          : [];

        const attendanceLessonIds = new Set(
          attendances.map((attendance) => attendance.lesson.id)
        );

        const attendanceEntries: HistoryEntry[] = attendances.map(
          (attendance) => ({
            type: "attendance",
            key: `attendance-${attendance.id}`,
            attendance,
            sortDate:
              attendance.lesson.startsAt ||
              attendance.lesson.date ||
              attendance.markedAt,
          })
        );

        const missedEntries: HistoryEntry[] = missedLessons
          .filter((lesson) => !attendanceLessonIds.has(lesson.id))
          .map((lesson) => ({
            type: "missed",
            key: `missed-${lesson.id}`,
            lesson,
            sortDate: lesson.startsAt,
          }));

        const combinedEntries = [
          ...attendanceEntries,
          ...missedEntries,
        ].sort(
          (a, b) =>
            new Date(b.sortDate).getTime() -
            new Date(a.sortDate).getTime()
        );

        setEntries(combinedEntries);
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
            : "Не удалось загрузить историю посещаемости."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F5F8] px-3 py-1 text-[#171717] sm:px-5 sm:py-1">
      <div className="mx-auto min-h-[calc(100vh-8px)] w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-3 shadow-[0_2px_12px_rgba(30,25,35,0.025)] sm:p-4 lg:p-5">
        {/* Шапка */}
        <header className="border-b border-[#E5DFE9] pb-3">
          <Link
            href="/student"
            className="mb-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#9668BD] transition hover:text-[#8959B1]"
          >
            <span className="rotate-180">
              <Icon type="arrow" size={16} />
            </span>
            В личный кабинет
          </Link>

          <Link href="/student" className="block w-fit">
            <h1 className="text-[35px] font-black leading-[0.88] tracking-[-0.07em] sm:text-[40px]">
              SMART
              <br />
              ATTENDANCE
            </h1>
          </Link>

          <div className="mt-2 h-[3px] w-[50px] rounded-full bg-[#B58AD5]" />

          <p className="mt-1.5 text-[10px] font-bold tracking-[0.19em] text-[#68636E]">
            STUDENT ATTENDANCE SYSTEM
          </p>
        </header>

        {/* Заголовок и группа */}
        <section className="mb-4 mt-4 sm:mb-5 sm:mt-5">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#9668BD]">
              УЧЁТ ПОСЕЩАЕМОСТИ
            </p>

            <div className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-[#E5DFE9] bg-[#F8F6F9] px-3 py-1.5">
              <span className="text-[#9668BD]">
                <Icon type="book" size={16} />
              </span>
              <span className="text-[11px] text-[#68636E]">
                Группа
              </span>
              <span className="text-[12px] font-bold text-[#37323B]">
                {groupName || "Не указана"}
              </span>
            </div>
          </div>

          <h2 className="text-[28px] font-bold leading-tight tracking-[-0.7px] sm:text-[30px]">
            История посещаемости
          </h2>

          <p className="mt-1.5 text-[13px] leading-[19px] text-[#68636E] sm:text-[14px]">
            Занятия, отметки и результаты посещения.
          </p>
        </section>

        {/* Содержимое */}
        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-8 text-center">
            <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E5DFE9] border-t-[#9668BD]" />
            <p className="mt-4 text-[14px] font-medium text-[#68636E]">
              Загружаем историю посещаемости…
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[#E8CACA] bg-[#FBF1F1] p-4 text-[#A54D4D]"
          >
            <Icon type="alert" size={20} />
            <div>
              <p className="text-[14px] font-bold">
                Не удалось загрузить историю
              </p>
              <p className="mt-1 text-[13px] leading-5">
                {error}
              </p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] px-5 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE5F4] text-[#9668BD]">
              <Icon type="calendar" size={27} />
            </span>

            <h3 className="mt-4 text-[18px] font-bold">
              История пока пуста
            </h3>

            <p className="mt-2 max-w-md text-[13px] leading-5 text-[#68636E]">
              Здесь появятся занятия после отметки посещаемости или пропуска.
            </p>

            <Link
              href="/student/attendance"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#9668BD] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#8959B1]"
            >
              Отметить посещение
              <Icon type="arrow" size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Сводка по статусам посещаемости */}
            <section
              aria-label="Сводка посещаемости"
              className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5"
            >
              <div className="rounded-xl border border-[#C9DCCF] bg-[#F0F7F1] p-3">
                <p className="text-[11px] font-medium text-[#39734A]">
                  Присутствовал
                </p>
                <p className="mt-1 text-[25px] font-bold leading-none text-[#39734A]">
                  {summary.present}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8D9B8] bg-[#FBF6EA] p-3">
                <p className="text-[11px] font-medium text-[#98702D]">
                  Опоздал
                </p>
                <p className="mt-1 text-[25px] font-bold leading-none text-[#98702D]">
                  {summary.late}
                </p>
              </div>

              <div className="rounded-xl border border-[#D8D2DD] bg-[#F3F0F4] p-3">
                <p className="text-[11px] font-medium text-[#68636E]">
                  Пропустил
                </p>
                <p className="mt-1 text-[25px] font-bold leading-none text-[#68636E]">
                  {summary.missed}
                </p>
              </div>

              <div className="rounded-xl border border-[#D8C5E8] bg-[#F3ECF8] p-3">
                <p className="text-[11px] font-medium text-[#8055A4]">
                  На проверке
                </p>
                <p className="mt-1 text-[25px] font-bold leading-none text-[#8055A4]">
                  {summary.pending}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8CACA] bg-[#FBF1F1] p-3">
                <p className="text-[11px] font-medium text-[#A54D4D]">
                  Отклонено
                </p>
                <p className="mt-1 text-[25px] font-bold leading-none text-[#A54D4D]">
                  {summary.rejected}
                </p>
              </div>
            </section>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-[#37323B]">
                Все занятия
              </p>

              <span className="rounded-full border border-[#E5DFE9] bg-[#F8F6F9] px-3 py-1 text-[11px] font-semibold text-[#68636E]">
                Всего: {entries.length}
              </span>
            </div>

            <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {entries.map((entry) => {
                if (entry.type === "missed") {
                  const lesson = entry.lesson;
                  const subject =
                    lesson.discipline || "Учебное занятие";

                  return (
                    <article
                      key={entry.key}
                      className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-4 transition hover:border-[#C8B4D9] sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEE5F4] text-[#9668BD]">
                            <Icon type="book" size={21} />
                          </span>

                          <div className="min-w-0">
                            <h3 className="break-words text-[16px] font-bold leading-5 text-[#171717] sm:text-[17px]">
                              {subject}
                            </h3>
                            <p className="mt-1 text-[11px] font-medium text-[#9668BD]">
                              Учебное занятие
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold ${statusStyles.MISSED}`}
                        >
                          {statusLabels.MISSED}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2 border-t border-[#EAE5ED] pt-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                          <span className="text-[#9668BD]">
                            <Icon type="calendar" size={16} />
                          </span>
                          {formatDate(lesson.startsAt)}
                        </div>

                        <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                          <span className="text-[#9668BD]">
                            <Icon type="clock" size={16} />
                          </span>
                          {formatTime(lesson.startsAt)}
                          {lesson.endsAt && ` — ${formatTime(lesson.endsAt)}`}
                        </div>

                        {lesson.classroom?.name && (
                          <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                            <span className="text-[#9668BD]">
                              <Icon type="book" size={16} />
                            </span>
                            Аудитория: {lesson.classroom.name}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                          <span className="text-[#9668BD]">
                            <Icon type="book" size={16} />
                          </span>
                          Группа: {lesson.group?.name || groupName || "Не указана"}
                        </div>
                      </div>
                    </article>
                  );
                }

                const attendance = entry.attendance;
                const lesson = attendance.lesson;

                const subject =
                  lesson.discipline ||
                  lesson.title ||
                  lesson.subject ||
                  lesson.name ||
                  "Учебное занятие";

                const dateValue =
                  lesson.startsAt || lesson.date || attendance.markedAt;

                return (
                  <article
                    key={entry.key}
                    className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-4 transition hover:border-[#C8B4D9] sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEE5F4] text-[#9668BD]">
                          <Icon type="book" size={21} />
                        </span>

                        <div className="min-w-0">
                          <h3 className="break-words text-[16px] font-bold leading-5 text-[#171717] sm:text-[17px]">
                            {subject}
                          </h3>
                          <p className="mt-1 text-[11px] font-medium text-[#9668BD]">
                            Учебное занятие
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                          statusStyles[attendance.status] ||
                          "border-[#D8D2DD] bg-[#F3F0F4] text-[#68636E]"
                        }`}
                      >
                        {statusLabels[attendance.status] || attendance.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2 border-t border-[#EAE5ED] pt-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                        <span className="text-[#9668BD]">
                          <Icon type="calendar" size={16} />
                        </span>
                        {formatDate(dateValue)}
                        {lesson.startsAt && ` · ${formatTime(lesson.startsAt)}`}
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                        <span className="text-[#9668BD]">
                          <Icon type="clock" size={16} />
                        </span>
                        Отметка: {formatTime(attendance.markedAt)}
                      </div>

                      {lesson.classroom?.name && (
                        <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                          <span className="text-[#9668BD]">
                            <Icon type="book" size={16} />
                          </span>
                          Аудитория: {lesson.classroom.name}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[12px] text-[#68636E]">
                        <span className="text-[#9668BD]">
                          <Icon type="book" size={16} />
                        </span>
                        Группа: {lesson.group?.name || groupName || "Не указана"}
                      </div>
                    </div>

                    {attendance.status === "REJECTED" &&
                      attendance.rejectionReason && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#E8CACA] bg-[#FBF1F1] p-3 text-[12px] leading-5 text-[#A54D4D]">
                          <span className="mt-0.5 shrink-0">
                            <Icon type="alert" size={16} />
                          </span>
                          <p>
                            <span className="font-bold">
                              Причина отказа:{" "}
                            </span>
                            {attendance.rejectionReason}
                          </p>
                        </div>
                      )}
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}