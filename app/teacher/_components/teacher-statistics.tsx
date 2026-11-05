"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTeacherStatistics, filterTeacherStatistics, localDateKey, academicYearStart, semesterDates, EMPTY_STATISTICS_FILTERS, type AttendanceTotals, type TeacherStatistics } from "../_lib/statistics";

const cell = "px-3 py-4";
const button = "min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-100 disabled:opacity-50";
const number = (value: number) => value.toLocaleString("ru-RU");
const percentage = (value: AttendanceTotals) => value.totalStudents === 0 ? "—" : `${value.attendancePercentage.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %`;

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
    setLoading(true); setError("");
    try {
      const next = await getTeacherStatistics(controller.signal);
      if (controllerRef.current === controller) setAcademicYear(current => current ?? academicYearStart(new Date()));
      if (controllerRef.current === controller) setData(next);
    } catch (cause) {
      if (controllerRef.current === controller) setError(controller.signal.aborted || cause instanceof TypeError
        ? "Нет связи с сервером или истекло время ожидания. Нажмите «Обновить»."
        : cause instanceof Error ? cause.message : "Не удалось загрузить статистику.");
    } finally {
      clearTimeout(timeout);
      if (controllerRef.current === controller) { controllerRef.current = null; setLoading(false); }
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => { void refresh(); }, 0);
    return () => { clearTimeout(initial); const controller = controllerRef.current; controllerRef.current = null; controller?.abort(); };
  }, [refresh]);

  const filtered = data ? filterTeacherStatistics(data, filters) : null;
  const hasFilters = Object.values(filters).some(Boolean);
  const invalidDates = Boolean(filters.from && filters.to && filters.from > filters.to);
  const groups = data ? [...new Map(data.lessons.map(lesson => [lesson.group.id, lesson.group])).values()].sort((a, b) => a.name.localeCompare(b.name, "ru")) : [];
  const disciplines = data ? [...new Set(data.lessons.map(lesson => lesson.discipline ?? "Без дисциплины"))].sort((a, b) => a.localeCompare(b, "ru")) : [];
  const field = "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3 text-sm";
  const academicYears = [...new Set([
    ...(academicYear === null ? [] : [academicYear]),
    ...(data?.lessons.map(lesson => academicYearStart(new Date(lesson.startsAt))) ?? []),
  ])].sort((a, b) => b - a);
  function selectSemester(semester: 1 | 2) {
    if (academicYear === null) return;
    setFilters(current => ({ ...current, ...semesterDates(academicYear, semester) }));
  }

  function period(kind: "today" | "week" | "month") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    if (kind === "week") { start.setDate(start.getDate() - (start.getDay() + 6) % 7); end.setTime(start.getTime()); end.setDate(end.getDate() + 6); }
    if (kind === "month") { start.setDate(1); end.setMonth(end.getMonth() + 1, 0); }
    setFilters(current => ({ ...current, from: localDateKey(start), to: localDateKey(end) }));
  }

  return <div className="mt-8" aria-busy={loading}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">Общая посещаемость</h2>
      <button type="button" className={button} disabled={loading} onClick={() => void refresh()}>{loading ? "Загружаем…" : "Обновить"}</button>
    </div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}{data && " Ниже показаны ранее загруженные данные."}</p>}
    {!filtered ? <p role="status" className="mt-6 text-slate-600">{loading ? "Загружаем статистику…" : "Статистика пока недоступна."}</p> : <>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="statistics-filters-title">
        <h2 id="statistics-filters-title" className="text-lg font-semibold">Фильтры</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="min-w-0 text-sm font-semibold" htmlFor="stats-group">Группа<select id="stats-group" className={field} value={filters.groupId} onChange={event => setFilters(current => ({ ...current, groupId: event.target.value }))}><option value="">Все группы</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
          <label className="min-w-0 text-sm font-semibold" htmlFor="stats-discipline">Дисциплина<select id="stats-discipline" className={field} value={filters.discipline} onChange={event => setFilters(current => ({ ...current, discipline: event.target.value }))}><option value="">Все дисциплины</option>{disciplines.map(discipline => <option key={discipline} value={discipline}>{discipline}</option>)}</select></label>
          <label className="min-w-0 text-sm font-semibold" htmlFor="stats-from">Дата с<input id="stats-from" type="date" className={field} value={filters.from} aria-invalid={invalidDates} aria-describedby={invalidDates ? "stats-date-error" : undefined} onChange={event => setFilters(current => ({ ...current, from: event.target.value }))} /></label>
          <label className="min-w-0 text-sm font-semibold" htmlFor="stats-to">Дата по<input id="stats-to" type="date" className={field} value={filters.to} aria-invalid={invalidDates} aria-describedby={invalidDates ? "stats-date-error" : undefined} onChange={event => setFilters(current => ({ ...current, to: event.target.value }))} /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" className={button} onClick={() => period("today")}>Сегодня</button><button type="button" className={button} onClick={() => period("week")}>Эта неделя</button><button type="button" className={button} onClick={() => period("month")}>Этот месяц</button><button type="button" className={button} disabled={!hasFilters} onClick={() => setFilters(EMPTY_STATISTICS_FILTERS)}>Сбросить</button></div>
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <label htmlFor="stats-academic-year" className="block text-sm font-semibold">Учебный год
            <select id="stats-academic-year" className={`${field} sm:max-w-56`} value={academicYear ?? ""} onChange={event => setAcademicYear(Number(event.target.value))}>
              {academicYears.map(year => <option key={year} value={year}>{year}/{year + 1}</option>)}
            </select>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">{([1, 2] as const).map(semester => {
            const dates = academicYear === null ? null : semesterDates(academicYear, semester);
            const active = Boolean(dates && filters.from === dates.from && filters.to === dates.to);
            return <button key={semester} type="button" disabled={academicYear === null} aria-pressed={active} className={`${button} ${active ? "border-blue-700 text-blue-700 ring-1 ring-blue-700" : ""}`} onClick={() => selectSemester(semester)}>{semester}-й семестр</button>;
          })}</div>
          <p className="mt-3 text-sm leading-6 text-slate-600">1-й семестр: 1 сентября — 31 января. 2-й семестр: 1 февраля — 31 августа. Выберите учебный год и нажмите нужный семестр.</p>
        </div>
        <p className="mt-3 text-sm text-slate-600">Фильтры применяются ко всем показателям и обеим таблицам. Период включает обе даты и учитывает дату начала занятия.</p>
        {invalidDates && <p id="stats-date-error" role="alert" className="mt-3 text-sm text-red-700">Дата «с» должна быть не позже даты «по».</p>}
        <p role="status" className="mt-3 text-sm font-semibold">Найдено занятий: {filtered.lessons.length}</p>
      </section>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Завершено занятий", number(filtered.summary.totalLessons)],
          ["Ожидалось посещений", number(filtered.summary.totalStudents)],
          ["Подтверждено посещений", number(filtered.summary.attendedStudents)],
          ["Посещаемость", percentage(filtered.summary)],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-3 text-3xl font-bold">{value}</dd></div>)}
      </dl>
      <p className="mt-4 text-sm leading-6 text-slate-600">Один студент на двух занятиях — два ожидаемых посещения. Подтверждённые посещения включают опоздания. Численность берётся из текущего состава групп.</p>
      {filtered.summary.totalLessons === 0 && <p className="mt-5 rounded-xl border border-slate-200 bg-white p-5">{hasFilters ? "По выбранным условиям занятий нет. Измените или сбросьте фильтры." : "Пока нет завершённых занятий. После завершения занятия его результаты появятся в статистике."}</p>}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">По группам</h2>
        {!filtered.groups.length ? <p className="mt-4 text-slate-600">Нет данных по завершённым занятиям групп.</p> : <>
          <ul className="mt-4 space-y-4 sm:hidden" aria-label="Статистика по группам">{filtered.groups.map(group => <li key={group.groupId} className="min-w-0 rounded-lg border border-slate-200 p-4">
            <h3 className="break-words font-semibold">Группа {group.groupName}</h3>
            <dl className="mt-3 space-y-3 text-sm">{[
              ["Занятий", number(group.totalLessons)],
              ["Ожидалось посещений", number(group.totalStudents)],
              ["Подтверждено", number(group.attendedStudents)],
              ["Посещаемость", percentage(group)],
            ].map(([label, value]) => <div key={label}><dt className="text-slate-600">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}</dl>
          </li>)}</ul>
          <div className="mt-4 hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm">
          <caption className="sr-only">Посещаемость завершённых занятий по группам</caption>
          <thead><tr className="border-b border-slate-200">{["Группа", "Занятий", "Ожидалось посещений", "Подтверждено", "Посещаемость"].map(label => <th scope="col" key={label} className={cell}>{label}</th>)}</tr></thead>
          <tbody>{filtered.groups.map(group => <tr key={group.groupId} className="border-b border-slate-100"><th scope="row" className={cell}>{group.groupName}</th><td className={cell}>{number(group.totalLessons)}</td><td className={cell}>{number(group.totalStudents)}</td><td className={cell}>{number(group.attendedStudents)}</td><td className={cell}>{percentage(group)}</td></tr>)}</tbody>
        </table></div></>}
      </section>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">По занятиям</h2>
        {!filtered.lessons.length ? <p className="mt-4 text-slate-600">Нет завершённых занятий.</p> : <>
          <ul className="mt-4 space-y-4 sm:hidden" aria-label="Статистика по занятиям">{filtered.lessons.map(lesson => <li key={lesson.lessonId} className="min-w-0 rounded-lg border border-slate-200 p-4">
            <h3><Link href={`/teacher/lessons/${lesson.lessonId}`} className="inline-block py-2 font-semibold text-blue-700 underline">{lesson.discipline ?? "Без дисциплины"} · №{lesson.lessonId}</Link></h3>
            <dl className="mt-3 space-y-3 text-sm">{[
              ["Дата и время начала", new Date(lesson.startsAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })],
              ["Дисциплина", lesson.discipline ?? "Без дисциплины"],
              ["Группа", lesson.group.name],
              ["Аудитория", lesson.classroom.name],
              ["Студентов в группе", number(lesson.totalStudents)],
              ["Присутствовали", number(lesson.attendedStudents)],
              ["Посещаемость", percentage(lesson)],
            ].map(([label, value]) => <div key={label}><dt className="text-slate-600">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}</dl>
          </li>)}</ul>
          <div className="mt-4 hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm">
          <caption className="sr-only">Посещаемость каждого завершённого занятия</caption>
          <thead><tr className="border-b border-slate-200">{["Занятие", "Группа", "Аудитория", "Студентов в группе", "Присутствовали", "Посещаемость"].map(label => <th scope="col" key={label} className={cell}>{label}</th>)}</tr></thead>
          <tbody>{filtered.lessons.map(lesson => <tr key={lesson.lessonId} className="border-b border-slate-100"><th scope="row" className={cell}><Link href={`/teacher/lessons/${lesson.lessonId}`} className="font-semibold text-blue-700 underline">{lesson.discipline ?? "Без дисциплины"} · №{lesson.lessonId}</Link><span className="mt-1 block font-normal text-slate-600">{new Date(lesson.startsAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></th><td className={cell}>{lesson.group.name}</td><td className={cell}>{lesson.classroom.name}</td><td className={cell}>{number(lesson.totalStudents)}</td><td className={cell}>{number(lesson.attendedStudents)}</td><td className={cell}>{percentage(lesson)}</td></tr>)}</tbody>
        </table></div></>}
      </section>
    </>}
  </div>;
}
