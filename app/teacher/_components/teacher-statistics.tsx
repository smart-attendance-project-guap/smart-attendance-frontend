
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTeacherStatistics,
  filterTeacherStatistics,
  localDateKey,
  academicYearStart,
  semesterDates,
  EMPTY_STATISTICS_FILTERS,
  type AttendanceTotals,
  type TeacherStatistics,
} from "../_lib/statistics";

const cell = "px-4 py-4";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D8D2DD] bg-white px-4 py-2 text-sm font-semibold text-[#514B56] transition-colors hover:border-[#BFA7D0] hover:bg-[#F7F3FA] hover:text-[#8958AC] disabled:cursor-not-allowed disabled:opacity-50";

const activeButton =
  "border-[#A16FC5] bg-[#F0E7F6] text-[#8958AC] ring-1 ring-[#A16FC5]";

const number = (value: number) => value.toLocaleString("ru-RU");

const percentage = (value: AttendanceTotals) =>
  value.totalStudents === 0
    ? "—"
    : `${value.attendancePercentage.toLocaleString("ru-RU", {
        maximumFractionDigits: 2,
      })} %`;

const field =
  "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-[#D8D2DD] bg-white px-3 py-2.5 text-sm font-normal text-[#171717] outline-none transition focus:border-[#A16FC5] focus:ring-2 focus:ring-[#E9DDF2] disabled:cursor-not-allowed disabled:bg-[#F3F0F4]";

const section =
  "rounded-2xl border border-[#E3DCE8] bg-white p-4 sm:p-5 lg:p-6";

const mutedText = "text-sm leading-6 text-[#68636E]";

export default function TeacherStatisticsPanel() {
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [filters, setFilters] = useState(EMPTY_STATISTICS_FILTERS);
  const [data, setData] = useState<TeacherStatistics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    const timeout = setTimeout(() => controller.abort(), 15000);

    setLoading(true);
    setError("");

    try {
      const next = await getTeacherStatistics(controller.signal);

      if (controllerRef.current === controller) {
        setAcademicYear((current) => current ?? academicYearStart(new Date()));
      }

      if (controllerRef.current === controller) {
        setData(next);
      }
    } catch (cause) {
      if (controllerRef.current === controller) {
        setError(
          controller.signal.aborted || cause instanceof TypeError
            ? "Нет связи с сервером или истекло время ожидания. Нажмите «Обновить»."
            : cause instanceof Error
              ? cause.message
              : "Не удалось загрузить статистику.",
        );
      }
    } finally {
      clearTimeout(timeout);

      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      clearTimeout(initial);

      const controller = controllerRef.current;
      controllerRef.current = null;
      controller?.abort();
    };
  }, [refresh]);

  const filtered = data ? filterTeacherStatistics(data, filters) : null;
  const hasFilters = Object.values(filters).some(Boolean);
  const invalidDates = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );

  const groups = data
    ? [
        ...new Map(
          data.lessons.map((lesson) => [lesson.group.id, lesson.group]),
        ).values(),
      ].sort((a, b) => a.name.localeCompare(b.name, "ru"))
    : [];

  const disciplines = data
    ? [
        ...new Set(
          data.lessons.map(
            (lesson) => lesson.discipline ?? "Без дисциплины",
          ),
        ),
      ].sort((a, b) => a.localeCompare(b, "ru"))
    : [];

  const academicYears = [
    ...new Set([
      ...(academicYear === null ? [] : [academicYear]),
      ...(data?.lessons.map((lesson) =>
        academicYearStart(new Date(lesson.startsAt)),
      ) ?? []),
    ]),
  ].sort((a, b) => b - a);

  function selectSemester(semester: 1 | 2) {
    if (academicYear === null) return;

    setFilters((current) => ({
      ...current,
      ...semesterDates(academicYear, semester),
    }));
  }

  function period(kind: "today" | "week" | "month") {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const end = new Date(start);

    if (kind === "week") {
      start.setDate(start.getDate() - (start.getDay() + 6) % 7);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
    }

    if (kind === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    }

    setFilters((current) => ({
      ...current,
      from: localDateKey(start),
      to: localDateKey(end),
    }));
  }

  return (
    <div className="mt-8" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#171717] sm:text-2xl">
            Общая посещаемость
          </h2>
          <p className="mt-1 text-sm text-[#8A8490]">
            Сводные результаты завершённых занятий
          </p>
        </div>

        <button
          type="button"
          className={button}
          disabled={loading}
          onClick={() => void refresh()}
        >
          {loading ? "Загружаем…" : "↻ Обновить"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
        >
          {error}
          {data && " Ниже показаны ранее загруженные данные."}
        </p>
      )}

      {!filtered ? (
        <div
          role="status"
          className={`${section} mt-5 flex min-h-36 items-center justify-center text-center`}
        >
          <p className={mutedText}>
            {loading
              ? "Загружаем статистику…"
              : "Статистика пока недоступна."}
          </p>
        </div>
      ) : (
        <>
          <section
            className={`${section} mt-5 bg-[#FCFBFD]`}
            aria-labelledby="statistics-filters-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  id="statistics-filters-title"
                  className="text-lg font-bold text-[#171717]"
                >
                  Фильтры
                </h2>
                <p className="mt-1 text-sm text-[#8A8490]">
                  Настройте период и параметры отображения
                </p>
              </div>

              <span className="rounded-full bg-[#F0E7F6] px-3 py-1.5 text-xs font-semibold text-[#8958AC]">
                Найдено занятий: {filtered.lessons.length}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label
                className="min-w-0 text-sm font-semibold text-[#514B56]"
                htmlFor="stats-group"
              >
                Группа
                <select
                  id="stats-group"
                  className={field}
                  value={filters.groupId}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      groupId: event.target.value,
                    }))
                  }
                >
                  <option value="">Все группы</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="min-w-0 text-sm font-semibold text-[#514B56]"
                htmlFor="stats-discipline"
              >
                Дисциплина
                <select
                  id="stats-discipline"
                  className={field}
                  value={filters.discipline}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      discipline: event.target.value,
                    }))
                  }
                >
                  <option value="">Все дисциплины</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline} value={discipline}>
                      {discipline}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="min-w-0 text-sm font-semibold text-[#514B56]"
                htmlFor="stats-from"
              >
                Дата с
                <input
                  id="stats-from"
                  type="date"
                  className={field}
                  value={filters.from}
                  aria-invalid={invalidDates}
                  aria-describedby={
                    invalidDates ? "stats-date-error" : undefined
                  }
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      from: event.target.value,
                    }))
                  }
                />
              </label>

              <label
                className="min-w-0 text-sm font-semibold text-[#514B56]"
                htmlFor="stats-to"
              >
                Дата по
                <input
                  id="stats-to"
                  type="date"
                  className={field}
                  value={filters.to}
                  aria-invalid={invalidDates}
                  aria-describedby={
                    invalidDates ? "stats-date-error" : undefined
                  }
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      to: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={button}
                onClick={() => period("today")}
              >
                Сегодня
              </button>

              <button
                type="button"
                className={button}
                onClick={() => period("week")}
              >
                Эта неделя
              </button>

              <button
                type="button"
                className={button}
                onClick={() => period("month")}
              >
                Этот месяц
              </button>

              <button
                type="button"
                className={`${button} border-[#E5DFE9] text-[#8958AC]`}
                disabled={!hasFilters}
                onClick={() => setFilters(EMPTY_STATISTICS_FILTERS)}
              >
                Сбросить фильтры
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#E5DFE9] bg-[#F7F5F8] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    Учебный год
                  </h3>
                  <p className="mt-1 text-xs text-[#8A8490]">
                    Быстрый выбор периода по семестрам
                  </p>
                </div>

                <select
                  id="stats-academic-year"
                  aria-label="Учебный год"
                  className={`${field} mt-0 sm:max-w-56`}
                  value={academicYear ?? ""}
                  onChange={(event) =>
                    setAcademicYear(Number(event.target.value))
                  }
                >
                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {year}/{year + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {([1, 2] as const).map((semester) => {
                  const dates =
                    academicYear === null
                      ? null
                      : semesterDates(academicYear, semester);

                  const active = Boolean(
                    dates &&
                      filters.from === dates.from &&
                      filters.to === dates.to,
                  );

                  return (
                    <button
                      key={semester}
                      type="button"
                      disabled={academicYear === null}
                      aria-pressed={active}
                      className={`${button} ${active ? activeButton : ""}`}
                      onClick={() => selectSemester(semester)}
                    >
                      {semester}-й семестр
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs leading-5 text-[#77717C]">
                1-й семестр: 1 сентября — 31 января. 2-й семестр: 1 февраля —
                31 августа. Выберите учебный год и нажмите нужный семестр.
              </p>
            </div>

            <div className="mt-4 border-t border-[#E9E3ED] pt-4">
              <p className={mutedText}>
                Фильтры применяются ко всем показателям и обеим таблицам.
                Период включает обе даты и учитывает дату начала занятия.
              </p>

              {invalidDates && (
                <p
                  id="stats-date-error"
                  role="alert"
                  className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  Дата «с» должна быть не позже даты «по».
                </p>
              )}
            </div>
          </section>

          <section aria-label="Сводные показатели">
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Завершено занятий",
                  value: number(filtered.summary.totalLessons),
                  description: "Всего занятий",
                },
                {
                  label: "Ожидалось посещений",
                  value: number(filtered.summary.totalStudents),
                  description: "По текущему составу групп",
                },
                {
                  label: "Подтверждено посещений",
                  value: number(filtered.summary.attendedStudents),
                  description: "Включая опоздания",
                },
                {
                  label: "Посещаемость",
                  value: percentage(filtered.summary),
                  description: "Общий показатель",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#E3DCE8] bg-white p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-sm font-medium leading-5 text-[#68636E]">
                      {item.label}
                    </dt>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full bg-[#B58AD5]"
                    />
                  </div>

                  <dd className="mt-4 break-words text-3xl font-bold tracking-tight text-[#171717] sm:text-[34px]">
                    {item.value}
                  </dd>

                  <p className="mt-2 text-xs text-[#8A8490]">
                    {item.description}
                  </p>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-xl bg-[#F7F5F8] px-4 py-3 text-xs leading-5 text-[#77717C]">
              Один студент на двух занятиях — два ожидаемых посещения.
              Подтверждённые посещения включают опоздания. Численность берётся
              из текущего состава групп.
            </p>
          </section>

          {filtered.summary.totalLessons === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-[#D8D2DD] bg-[#FCFBFD] p-6 text-center">
              <p className="font-semibold text-[#514B56]">
                {hasFilters
                  ? "По выбранным условиям занятий нет."
                  : "Пока нет завершённых занятий."}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#8A8490]">
                {hasFilters
                  ? "Измените или сбросьте фильтры, чтобы посмотреть другие результаты."
                  : "После завершения занятия его результаты появятся в статистике."}
              </p>
            </div>
          )}

          <section className={`${section} mt-8`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#171717]">
                  По группам
                </h2>
                <p className="mt-1 text-sm text-[#8A8490]">
                  Сводная посещаемость в разрезе учебных групп
                </p>
              </div>

              <span className="rounded-full bg-[#F0E7F6] px-3 py-1 text-xs font-semibold text-[#8958AC]">
                {filtered.groups.length} групп
              </span>
            </div>

            {!filtered.groups.length ? (
              <p className="mt-5 rounded-xl bg-[#F7F5F8] p-4 text-sm text-[#68636E]">
                Нет данных по завершённым занятиям групп.
              </p>
            ) : (
              <>
                <ul
                  className="mt-5 space-y-3 sm:hidden"
                  aria-label="Статистика по группам"
                >
                  {filtered.groups.map((group) => (
                    <li
                      key={group.groupId}
                      className="min-w-0 rounded-xl border border-[#E9E3ED] bg-[#FCFBFD] p-4"
                    >
                      <h3 className="break-words font-bold text-[#171717]">
                        Группа {group.groupName}
                      </h3>

                      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                        {[
                          ["Занятий", number(group.totalLessons)],
                          [
                            "Ожидалось посещений",
                            number(group.totalStudents),
                          ],
                          [
                            "Подтверждено",
                            number(group.attendedStudents),
                          ],
                          ["Посещаемость", percentage(group)],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <dt className="text-xs leading-5 text-[#8A8490]">
                              {label}
                            </dt>
                            <dd className="mt-1 break-words font-semibold text-[#171717]">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 hidden overflow-x-auto rounded-xl border border-[#E9E3ED] sm:block">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Посещаемость завершённых занятий по группам
                    </caption>
                    <thead className="bg-[#F7F5F8] text-[#68636E]">
                      <tr>
                        {[
                          "Группа",
                          "Занятий",
                          "Ожидалось посещений",
                          "Подтверждено",
                          "Посещаемость",
                        ].map((label) => (
                          <th
                            scope="col"
                            key={label}
                            className={`${cell} whitespace-nowrap text-xs font-semibold`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.groups.map((group) => (
                        <tr
                          key={group.groupId}
                          className="border-t border-[#EEE9F1] transition-colors hover:bg-[#FCFBFD]"
                        >
                          <th
                            scope="row"
                            className={`${cell} font-semibold text-[#171717]`}
                          >
                            {group.groupName}
                          </th>
                          <td className={cell}>
                            {number(group.totalLessons)}
                          </td>
                          <td className={cell}>
                            {number(group.totalStudents)}
                          </td>
                          <td className={cell}>
                            {number(group.attendedStudents)}
                          </td>
                          <td
                            className={`${cell} font-semibold text-[#8958AC]`}
                          >
                            {percentage(group)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section className={`${section} mt-6`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#171717]">
                  По занятиям
                </h2>
                <p className="mt-1 text-sm text-[#8A8490]">
                  Результаты каждого завершённого занятия
                </p>
              </div>

              <span className="rounded-full bg-[#F0E7F6] px-3 py-1 text-xs font-semibold text-[#8958AC]">
                {filtered.lessons.length} занятий
              </span>
            </div>

            {!filtered.lessons.length ? (
              <p className="mt-5 rounded-xl bg-[#F7F5F8] p-4 text-sm text-[#68636E]">
                Нет завершённых занятий.
              </p>
            ) : (
              <>
                <ul
                  className="mt-5 space-y-3 sm:hidden"
                  aria-label="Статистика по занятиям"
                >
                  {filtered.lessons.map((lesson) => (
                    <li
                      key={lesson.lessonId}
                      className="min-w-0 rounded-xl border border-[#E9E3ED] bg-[#FCFBFD] p-4"
                    >
                      <h3>
                        <Link
                          href={`/teacher/lessons/${lesson.lessonId}`}
                          className="inline-block py-1 font-bold leading-6 text-[#8958AC] underline decoration-[#CDB5DE] underline-offset-4 transition-colors hover:text-[#78479B]"
                        >
                          {lesson.discipline ?? "Без дисциплины"} · №
                          {lesson.lessonId}
                        </Link>
                      </h3>

                      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                        {[
                          [
                            "Дата и время начала",
                            new Date(lesson.startsAt).toLocaleString(
                              "ru-RU",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            ),
                          ],
                          [
                            "Дисциплина",
                            lesson.discipline ?? "Без дисциплины",
                          ],
                          ["Группа", lesson.group.name],
                          ["Аудитория", lesson.classroom.name],
                          [
                            "Студентов в группе",
                            number(lesson.totalStudents),
                          ],
                          [
                            "Присутствовали",
                            number(lesson.attendedStudents),
                          ],
                          ["Посещаемость", percentage(lesson)],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <dt className="text-xs leading-5 text-[#8A8490]">
                              {label}
                            </dt>
                            <dd className="mt-1 break-words font-semibold text-[#171717]">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 hidden overflow-x-auto rounded-xl border border-[#E9E3ED] sm:block">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Посещаемость каждого завершённого занятия
                    </caption>

                    <thead className="bg-[#F7F5F8] text-[#68636E]">
                      <tr>
                        {[
                          "Занятие",
                          "Группа",
                          "Аудитория",
                          "Студентов в группе",
                          "Присутствовали",
                          "Посещаемость",
                        ].map((label) => (
                          <th
                            scope="col"
                            key={label}
                            className={`${cell} whitespace-nowrap text-xs font-semibold`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.lessons.map((lesson) => (
                        <tr
                          key={lesson.lessonId}
                          className="border-t border-[#EEE9F1] transition-colors hover:bg-[#FCFBFD]"
                        >
                          <th
                            scope="row"
                            className={`${cell} min-w-[220px] font-normal`}
                          >
                            <Link
                              href={`/teacher/lessons/${lesson.lessonId}`}
                              className="font-semibold text-[#8958AC] underline decoration-[#CDB5DE] underline-offset-4 transition-colors hover:text-[#78479B]"
                            >
                              {lesson.discipline ?? "Без дисциплины"} · №
                              {lesson.lessonId}
                            </Link>

                            <span className="mt-2 block text-xs text-[#8A8490]">
                              {new Date(lesson.startsAt).toLocaleString(
                                "ru-RU",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </th>

                          <td className={cell}>{lesson.group.name}</td>
                          <td className={cell}>{lesson.classroom.name}</td>
                          <td className={cell}>
                            {number(lesson.totalStudents)}
                          </td>
                          <td className={cell}>
                            {number(lesson.attendedStudents)}
                          </td>
                          <td
                            className={`${cell} font-semibold text-[#8958AC]`}
                          >
                            {percentage(lesson)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
