"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTeacherStatistics, type AttendanceTotals, type TeacherStatistics } from "../_lib/statistics";

const cell = "px-3 py-4";
const button = "min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-100 disabled:opacity-50";
const number = (value: number) => value.toLocaleString("ru-RU");
const percentage = (value: AttendanceTotals) => value.totalStudents === 0 ? "—" : `${value.attendancePercentage.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %`;

export default function TeacherStatisticsPanel() {
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

  return <div className="mt-8" aria-busy={loading}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">Общая посещаемость</h2>
      <button type="button" className={button} disabled={loading} onClick={() => void refresh()}>{loading ? "Загружаем…" : "Обновить"}</button>
    </div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}{data && " Ниже показаны ранее загруженные данные."}</p>}
    {!data ? <p role="status" className="mt-6 text-slate-600">{loading ? "Загружаем статистику…" : "Статистика пока недоступна."}</p> : <>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Завершено занятий", number(data.summary.totalLessons)],
          ["Ожидалось посещений", number(data.summary.totalStudents)],
          ["Подтверждено посещений", number(data.summary.attendedStudents)],
          ["Посещаемость", percentage(data.summary)],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-3 text-3xl font-bold">{value}</dd></div>)}
      </dl>
      <p className="mt-4 text-sm leading-6 text-slate-600">Один студент на двух занятиях — два ожидаемых посещения. Подтверждённые посещения включают опоздания. Численность берётся из текущего состава групп.</p>
      {data.summary.totalLessons === 0 && <p className="mt-5 rounded-xl border border-slate-200 bg-white p-5">Пока нет завершённых занятий. После завершения занятия его результаты появятся в статистике.</p>}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">По группам</h2>
        {!data.groups.length ? <p className="mt-4 text-slate-600">Нет данных по завершённым занятиям групп.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
          <caption className="sr-only">Посещаемость завершённых занятий по группам</caption>
          <thead><tr className="border-b border-slate-200">{["Группа", "Занятий", "Ожидалось посещений", "Подтверждено", "Посещаемость"].map(label => <th scope="col" key={label} className={cell}>{label}</th>)}</tr></thead>
          <tbody>{data.groups.map(group => <tr key={group.groupId} className="border-b border-slate-100"><th scope="row" className={cell}>{group.groupName}</th><td className={cell}>{number(group.totalLessons)}</td><td className={cell}>{number(group.totalStudents)}</td><td className={cell}>{number(group.attendedStudents)}</td><td className={cell}>{percentage(group)}</td></tr>)}</tbody>
        </table></div>}
      </section>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">По занятиям</h2>
        {!data.lessons.length ? <p className="mt-4 text-slate-600">Нет завершённых занятий.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
          <caption className="sr-only">Посещаемость каждого завершённого занятия</caption>
          <thead><tr className="border-b border-slate-200">{["Занятие", "Группа", "Аудитория", "Студентов в группе", "Присутствовали", "Посещаемость"].map(label => <th scope="col" key={label} className={cell}>{label}</th>)}</tr></thead>
          <tbody>{data.lessons.map(lesson => <tr key={lesson.lessonId} className="border-b border-slate-100"><th scope="row" className={cell}><Link href={`/teacher/lessons/${lesson.lessonId}`} className="font-semibold text-blue-700 underline">Занятие №{lesson.lessonId}</Link><span className="mt-1 block font-normal text-slate-600">{new Date(lesson.startsAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></th><td className={cell}>{lesson.group.name}</td><td className={cell}>{lesson.classroom.name}</td><td className={cell}>{number(lesson.totalStudents)}</td><td className={cell}>{number(lesson.attendedStudents)}</td><td className={cell}>{percentage(lesson)}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </>}
  </div>;
}
