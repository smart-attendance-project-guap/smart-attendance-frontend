
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createLesson,
  getLessonReferences,
  type Reference,
} from "../../_lib/create-lesson";

function Icon({
  type,
  size = 20,
}: {
  type: "arrow" | "book" | "group" | "classroom" | "calendar" | "clock" | "plus";
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
    case "book":
      return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></svg>;
    case "group":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" /></svg>;
    case "classroom":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h4" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  }
}

const fieldStyle =
  "mt-2 min-h-[48px] w-full rounded-lg border border-[#D8D2DD] bg-[#FCFBFD] px-4 py-3 text-[14px] text-[#171717] outline-none transition placeholder:text-[#96909B] hover:border-[#BDA5CE] focus:border-[#A16FC5] focus:ring-2 focus:ring-[#E9DDF2] disabled:cursor-not-allowed disabled:bg-[#F0EDF2] disabled:text-[#96909B]";

const labelStyle =
  "block text-[14px] font-semibold text-[#343238]";

function BrandHeader() {
  return (
    <>
      <header className="mb-5">
        <Link
          href="/teacher/lessons"
          className="mb-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#A16FC5] transition hover:text-[#8050A5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A16FC5]"
        >
          <span aria-hidden="true">←</span>
          К списку занятий
        </Link>

        <div className="relative flex min-h-[112px] items-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-14 h-[170px] w-[170px] rounded-full border-[14px] border-[#F0EDF2]"
          />

          <div className="relative z-10">
            <h1 className="text-[clamp(32px,3.5vw,46px)] font-black leading-[0.87] tracking-[-0.075em] text-[#171717]">
              SMART
              <br />
              ATTENDANCE
            </h1>

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

function FormField({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelStyle}>
        <span className="flex items-center gap-2">
          <span className="text-[#A16FC5]">{icon}</span>
          {label}
        </span>
      </label>
      {children}
    </div>
  );
}

export default function NewTeacherLessonPage() {
  const router = useRouter();

  const [references, setReferences] = useState<{
    disciplines: Reference[];
    groups: Reference[];
    classrooms: Reference[];
  } | null>(null);

  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);

    getLessonReferences(controller.signal)
      .then((data) => {
        if (active) setReferences(data);
      })
      .catch((cause) => {
        if (active) {
          setLoadError(
            controller.signal.aborted || cause instanceof TypeError
              ? "Нет связи с сервером. Проверьте, что Backend запущен."
              : cause instanceof Error
                ? cause.message
                : "Не удалось загрузить данные."
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      submitting.current ||
      !references?.groups.length ||
      !references.classrooms.length ||
      !references.disciplines.length
    ) {
      return;
    }

    submitting.current = true;
    setPending(true);
    setSubmitError("");

    const data = new FormData(event.currentTarget);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const id = await createLesson(
        {
          discipline: String(data.get("discipline")),
          groupId: Number(data.get("groupId")),
          classroomId: Number(data.get("classroomId")),
          startsAt: String(data.get("startsAt")),
          endsAt: String(data.get("endsAt")),
        },
        controller.signal
      );

      router.push(`/teacher/lessons/${id}`);
    } catch (cause) {
      setSubmitError(
        controller.signal.aborted || cause instanceof TypeError
          ? "Не удалось получить ответ сервера. Перед повторной отправкой проверьте «Мои занятия»: занятие могло сохраниться."
          : cause instanceof Error
            ? cause.message
            : "Не удалось создать занятие."
      );

      submitting.current = false;
      setPending(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  const empty =
    references &&
    (!references.disciplines.length || !references.groups.length || !references.classrooms.length);

  return (
    <main
      lang="ru"
      className="min-h-screen bg-[#F7F5F8] px-3 py-2 text-[#171717] sm:px-5 sm:py-3"
    >
      <div className="mx-auto min-h-[calc(100vh-24px)] w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-4 shadow-[0_2px_12px_rgba(30,25,35,0.025)] sm:p-5 lg:p-6">
        <BrandHeader />

        <section className="mx-auto w-full max-w-[900px]">
          <div className="mb-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#A16FC5]">
              УПРАВЛЕНИЕ ЗАНЯТИЯМИ
            </p>

            <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.5px] text-[#171717] sm:text-[30px]">
              Начать занятие
            </h2>

            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#68636E] sm:text-[14px]">
              Заполните информацию о занятии, выберите учебную группу и
              аудиторию, а также укажите время проведения.
            </p>
          </div>

          {loadError ? (
            <div className="rounded-xl border border-[#E8CACA] bg-[#FCF4F4] p-5">
              <p role="alert" className="text-[14px] text-[#A34444]">
                {loadError}
              </p>

              <button
                type="button"
                className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#9B68BD] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#8958AC]"
                onClick={() => {
                  setLoadError("");
                  setReferences(null);
                  setAttempt((value) => value + 1);
                }}
              >
                Повторить загрузку
              </button>
            </div>
          ) : !references ? (
            <div
              role="status"
              className="rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-6 text-center text-[14px] text-[#68636E]"
            >
              Загружаем дисциплины, группы и аудитории…
            </div>
          ) : null}

          {empty && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-[#EAD9B9] bg-[#FBF5E9] p-5 text-[14px] leading-6 text-[#795D2E]"
            >
              {!references.disciplines.length && "В базе пока нет дисциплин. "}
              {!references.groups.length && "В базе пока нет групп. "}
              {!references.classrooms.length && "В базе пока нет аудиторий. "}
              Для создания занятия сначала нужно добавить эти данные в базу
              проекта, затем обновить страницу.
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-5 rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-5 sm:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0E7F6] text-[#9B68BD]">
                <Icon type="calendar" size={21} />
              </span>

              <div>
                <h3 className="text-[17px] font-bold text-[#171717]">
                  Информация о занятии
                </h3>
                <p className="mt-0.5 text-[12px] text-[#68636E]">
                  Основные параметры нового занятия
                </p>
              </div>
            </div>

            <fieldset disabled={pending} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="discipline"
                  label="Дисциплина"
                  icon={<Icon type="book" size={18} />}
                >
                  <select
                    id="discipline"
                    name="discipline"
                    disabled={!references?.disciplines.length}
                    required
                    defaultValue=""
                    className={fieldStyle}
                  >
                    <option value="" disabled>
                      Выберите дисциплину
                    </option>
                    {references?.disciplines.map(({ id, name }) => (
                      <option key={id} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  id="groupId"
                  label="Учебная группа"
                  icon={<Icon type="group" size={18} />}
                >
                  <select
                    id="groupId"
                    name="groupId"
                    required
                    defaultValue=""
                    disabled={!references?.groups.length}
                    className={fieldStyle}
                  >
                    <option value="" disabled>
                      Выберите группу
                    </option>
                    {references?.groups.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField
                id="classroomId"
                label="Аудитория"
                icon={<Icon type="classroom" size={18} />}
              >
                <select
                  id="classroomId"
                  name="classroomId"
                  required
                  defaultValue=""
                  disabled={!references?.classrooms.length}
                  className={fieldStyle}
                >
                  <option value="" disabled>
                    Выберите аудиторию
                  </option>
                  {references?.classrooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="border-t border-[#E5DFE9] pt-5">
                <div className="mb-4">
                  <h3 className="text-[15px] font-bold text-[#171717]">
                    Время проведения
                  </h3>
                  <p className="mt-1 text-[12px] text-[#68636E]">
                    Укажите дату и время по часовому поясу вашего устройства.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    id="startsAt"
                    label="Начало занятия"
                    icon={<Icon type="calendar" size={18} />}
                  >
                    <input
                      id="startsAt"
                      name="startsAt"
                      type="datetime-local"
                      required
                      className={fieldStyle}
                    />
                  </FormField>

                  <FormField
                    id="endsAt"
                    label="Окончание занятия"
                    icon={<Icon type="clock" size={18} />}
                  >
                    <input
                      id="endsAt"
                      name="endsAt"
                      type="datetime-local"
                      required
                      className={fieldStyle}
                    />
                  </FormField>
                </div>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-lg border border-[#E8CACA] bg-[#FCF4F4] p-4 text-[13px] leading-5 text-[#A34444]"
                >
                  {submitError}{" "}
                  <Link
                    href="/teacher/lessons"
                    className="font-semibold underline underline-offset-2"
                  >
                    Мои занятия
                  </Link>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[#E5DFE9] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/teacher/lessons"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D8D2DD] bg-white px-5 py-3 text-[14px] font-semibold text-[#514B56] transition hover:border-[#BDA5CE] hover:bg-[#F7F5F8]"
                >
                  Отмена
                </Link>

                <button
                  type="submit"
                  disabled={pending || !references || Boolean(empty)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#9B68BD] px-6 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#8958AC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A16FC5] disabled:cursor-not-allowed disabled:bg-[#E8E3EB] disabled:text-[#96909B]"
                >
                  {pending ? (
                    "Создаём занятие…"
                  ) : (
                    <>
                      <Icon type="plus" size={18} />
                      Создать занятие
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      </div>
    </main>
  );
}
