
"use client";

import Link from "next/link";
import LessonActions from "./lesson-actions";
import LessonAttendance from "./lesson-attendance";
import LessonGuests from "./lesson-guests";
import { useEffect, useState, type ReactNode } from "react";
import {
  formatDate,
  formatTime,
  getLessons,
  lessonStatus,
  lessonGroupNames,
  type Lesson,
} from "../_lib/lessons";

function Icon({
  type,
  size = 22,
}: {
  type: "arrow" | "calendar" | "clock" | "group" | "plus";
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
    case "calendar":
      return <svg {...common}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h3" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "group":
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  }
}

function BackLink({ lessonId }: { lessonId?: string }) {
  return (
    <Link
      href={lessonId ? "/teacher/lessons" : "/teacher"}
      className="mb-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#A16FC5] transition hover:text-[#8050A5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A16FC5]"
    >
      <span aria-hidden="true">←</span>
      {lessonId ? "К списку занятий" : "В кабинет преподавателя"}
    </Link>
  );
}

function BrandHeader({ lessonId }: { lessonId?: string }) {
  return (
    <>
      <header className="mb-5">
        <BackLink lessonId={lessonId} />

        <div className="relative flex min-h-[112px] items-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-14 h-[170px] w-[170px] rounded-full border-[14px] border-[#F0EDF2]"
          />

          <div className="relative z-10">
            <div className="text-[clamp(32px,3.5vw,46px)] font-black leading-[0.87] tracking-[-0.075em] text-[#171717]">
              SMART
              <br />
              ATTENDANCE
            </div>

            <div className="mt-3 h-[3px] w-[54px] rounded-full bg-[#B58AD5]" />

            <p className="mt-2 text-[9px] font-bold tracking-[0.18em] text-[#68636E] sm:text-[10px]">
              STUDENT ATTENDANCE SYSTEM
            </p>
          </div>
        </div>
      </header>

      <div className="mb-5 h-px w-full bg-[#E5DFE9]" />
    </>
  );
}

function LessonStatusBadge({
  lesson,
  now,
}: {
  lesson: Lesson;
  now: number;
}) {
  const status = lessonStatus(lesson, now);

  const colors = {
    "Идёт занятие": "border-[#CDE5D4] bg-[#EFF7F1] text-[#397B4D]",
    "Завершено": "border-[#D8D2DD] bg-[#F3F0F4] text-[#68636E]",
    "Запланировано": "border-[#E2CFF7] bg-[#F5EFFA] text-[#895BB2]",
    "Время занятия истекло": "border-[#EAD9B9] bg-[#FBF5E9] text-[#956D2E]",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
}

function LessonInfo({ lesson }: { lesson: Lesson }) {
  return (
    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-[#F7F5F8] p-3">
        <dt className="flex items-center gap-2 text-[12px] text-[#68636E]">
          <Icon type="group" size={16} />
          Группы
        </dt>
        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
          {lessonGroupNames(lesson)}
        </dd>
      </div>

      <div className="rounded-lg bg-[#F7F5F8] p-3">
        <dt className="flex items-center gap-2 text-[12px] text-[#68636E]">
          <Icon type="calendar" size={16} />
          Аудитория
        </dt>
        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
          {lesson.classroom.name}
        </dd>
      </div>

      <div className="rounded-lg bg-[#F7F5F8] p-3">
        <dt className="flex items-center gap-2 text-[12px] text-[#68636E]">
          <Icon type="calendar" size={16} />
          Дата начала
        </dt>
        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
          {formatDate(lesson.startsAt)}
        </dd>
      </div>

      <div className="rounded-lg bg-[#F7F5F8] p-3">
        <dt className="flex items-center gap-2 text-[12px] text-[#68636E]">
          <Icon type="clock" size={16} />
          Время
        </dt>
        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
          {formatTime(lesson.startsAt)}–{formatTime(lesson.endsAt)}
          {formatDate(lesson.startsAt) !== formatDate(lesson.endsAt) &&
            ` (${formatDate(lesson.endsAt)})`}
        </dd>
      </div>
    </dl>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#9B68BD] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#8958AC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A16FC5]"
    >
      {children}
    </Link>
  );
}

export default function LessonBrowser({ lessonId }: { lessonId?: string }) {
  const [result, setResult] = useState<{
    lessons: Lesson[];
    now: number;
  } | null>(null);

  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);

    getLessons(controller.signal)
      .then((lessons) => {
        if (active) {
          setResult({ lessons, now: Date.now() });
        }
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof TypeError || controller.signal.aborted
              ? "Нет связи с сервером. Проверьте, что Backend запущен, и повторите загрузку."
              : cause instanceof Error
                ? cause.message
                : "Не удалось загрузить занятия."
          );
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [attempt]);

  const lesson = result?.lessons.find(
    (item) => String(item.id) === lessonId
  );

  const retry = () => {
    setError("");
    setResult(null);
    setAttempt((current) => current + 1);
  };

  return (
    <main
      lang="ru"
      className="min-h-screen bg-[#F7F5F8] px-3 py-2 text-[#171717] sm:px-5 sm:py-3"
    >
      <div className="mx-auto min-h-[calc(100vh-24px)] w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-4 shadow-[0_2px_12px_rgba(30,25,35,0.025)] sm:p-5 lg:p-6">
        <BrandHeader lessonId={lessonId} />

        <section>
          <div className="mb-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#A16FC5]">
              УПРАВЛЕНИЕ ЗАНЯТИЯМИ
            </p>

            <div className="mt-2">
              <h1 className="break-words text-[28px] font-bold leading-tight tracking-[-0.5px] text-[#171717] sm:text-[30px]">
                {lessonId
                  ? lesson?.discipline ?? "Занятие"
                  : "Мои занятия"}
              </h1>

              <p className="mt-2 text-[13px] text-[#68636E] sm:text-[14px]">
                {lessonId
                  ? "Информация о занятии и посещаемости студентов."
                  : "Просмотр и управление вашими занятиями."}
              </p>

              {!lessonId && (
                <div className="mt-4">
                  <PrimaryButton href="/teacher/lessons/new">
                    <Icon type="plus" size={18} />
                    Начать занятие
                  </PrimaryButton>
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-[#E8CACA] bg-[#FCF4F4] p-5 sm:p-6">
              <p role="alert" className="text-[14px] text-[#A34444]">
                {error}
              </p>

              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#9B68BD] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#8958AC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A16FC5]"
              >
                Повторить
              </button>
            </div>
          ) : !result ? (
            <div
              role="status"
              className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-8 text-center text-[14px] text-[#68636E]"
            >
              Загружаем занятия…
            </div>
          ) : lessonId ? (
            lesson ? (
              <>
                <section className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-[18px] font-semibold text-[#171717]">
                      Сведения о занятии
                    </h2>

                    <LessonStatusBadge lesson={lesson} now={result.now} />
                  </div>

                  <LessonInfo lesson={lesson} />
                </section>

                <LessonActions
                  key={lesson.id}
                  id={lesson.id}
                  finishedAt={lesson.finishedAt}
                  onFinished={(at) =>
                    setResult((current) =>
                      current
                        ? {
                            now: Date.now(),
                            lessons: current.lessons.map((item) =>
                              item.id === lesson.id
                                ? { ...item, finishedAt: at }
                                : item
                            ),
                          }
                        : current
                    )
                  }
                />

                <LessonGuests
                  key={`guests-${lesson.id}`}
                  lessonId={lesson.id}
                  closed={Boolean(lesson.finishedAt) || Date.parse(lesson.endsAt) <= result.now}
                />

                <LessonAttendance
                  key={`attendance-${lesson.id}`}
                  lessonId={lesson.id}
                  finished={Boolean(lesson.finishedAt)}
                />
              </>
            ) : (
              <div
                role="status"
                className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-8 text-center text-[14px] text-[#68636E]"
              >
                Занятие не найдено среди ваших занятий.
              </div>
            )
          ) : result.lessons.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0E7F6] text-[#9B68BD]">
                <Icon type="calendar" size={30} />
              </div>

              <h2 className="mt-5 text-[19px] font-bold text-[#171717]">
                У вас пока нет занятий
              </h2>

              <p className="mt-2 max-w-md text-[14px] leading-6 text-[#68636E]">
                Здесь появятся занятия, созданные под вашей учётной записью
                преподавателя.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4">
              {result.lessons.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-5 transition hover:border-[#C6A9DA] sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="min-w-0 break-words text-[19px] font-bold text-[#171717]">
                      {item.discipline}
                    </h2>

                    <LessonStatusBadge lesson={item} now={result.now} />
                  </div>

                  <LessonInfo lesson={item} />

                  <div className="mt-5">
                    <PrimaryButton href={`/teacher/lessons/${item.id}`}>
                      Открыть занятие
                      <Icon type="arrow" size={18} />
                    </PrimaryButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
