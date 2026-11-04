"use client";

import Link from "next/link";
import LessonActions from "./lesson-actions";
import LessonAttendance from "./lesson-attendance";
import { useEffect, useState } from "react";
import { formatDate, formatTime, getLessons, lessonStatus, type Lesson } from "../_lib/lessons";

const linkStyle = "inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700";

function LessonInfo({ lesson }: { lesson: Lesson }) {
  return <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
    <div><dt className="text-slate-500">Группа</dt><dd className="mt-1 font-medium">{lesson.group.name}</dd></div>
    <div><dt className="text-slate-500">Аудитория</dt><dd className="mt-1 font-medium">{lesson.classroom.name}</dd></div>
    <div><dt className="text-slate-500">Дата начала</dt><dd className="mt-1 font-medium">{formatDate(lesson.startsAt)}</dd></div>
    <div><dt className="text-slate-500">Время</dt><dd className="mt-1 font-medium">{formatTime(lesson.startsAt)}–{formatTime(lesson.endsAt)}{formatDate(lesson.startsAt) !== formatDate(lesson.endsAt) && ` (${formatDate(lesson.endsAt)})`}</dd></div>
  </dl>;
}

export default function LessonBrowser({ lessonId }: { lessonId?: string }) {
  const [result, setResult] = useState<{ lessons: Lesson[]; now: number } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    getLessons(controller.signal).then((lessons) => {
      if (active) setResult({ lessons, now: Date.now() });
    }).catch((cause) => {
      if (active) setError(cause instanceof TypeError || controller.signal.aborted
        ? "Нет связи с сервером. Проверьте, что Backend запущен, и повторите загрузку."
        : cause instanceof Error ? cause.message : "Не удалось загрузить занятия.");
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [attempt]);

  const lesson = result?.lessons.find((item) => String(item.id) === lessonId);
  const retry = () => { setError(""); setResult(null); setAttempt(attempt + 1); };

  return <main lang="ru" className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
    <div className="mx-auto max-w-5xl">
      <Link href={lessonId ? "/teacher/lessons" : "/teacher"} className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline">
        {lessonId ? "← К списку занятий" : "← В кабинет преподавателя"}
      </Link>
      <h1 className="mt-6 break-words text-3xl font-bold sm:text-4xl">{lessonId ? lesson?.discipline ?? "Занятие" : "Мои занятия"}</h1>
      <p className="mt-4 leading-7 text-slate-600">Дата и время показаны по часовому поясу устройства.</p>
      {!lessonId && <Link href="/teacher/lessons/new" className={`mt-6 ${linkStyle}`}>Начать занятие</Link>}
      {error ? <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
        <p role="alert" className="text-red-800">{error}</p>
        <button onClick={retry} className={`mt-4 ${linkStyle}`}>Повторить</button>
      </div> : !result ? <p role="status" className="mt-8">Загружаем занятия…</p> : lessonId ? lesson ? <>
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Сведения о занятии</h2>
          <p className="mt-3 font-semibold text-blue-700">{lessonStatus(lesson, result.now)}</p>
          <LessonInfo lesson={lesson} />
        </section>
        <LessonActions key={lesson.id} id={lesson.id} finishedAt={lesson.finishedAt} onFinished={(at) => setResult(current => current ? { now: Date.now(), lessons: current.lessons.map(item => item.id === lesson.id ? { ...item, finishedAt: at } : item) } : current)} />
        <LessonAttendance key={`attendance-${lesson.id}`} lessonId={lesson.id} finished={Boolean(lesson.finishedAt)} />
      </> : <p role="status" className="mt-8">Занятие не найдено среди ваших занятий.</p> : result.lessons.length === 0 ? <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <p className="font-semibold">У вас пока нет занятий</p>
        <p className="mt-2 text-sm text-slate-600">Здесь появятся занятия, созданные под вашей учётной записью преподавателя.</p>
      </div> : <ul className="mt-8 space-y-4">{result.lessons.map((item) => <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="min-w-0 break-words text-xl font-semibold">{item.discipline}</h2>
          <span className="self-start rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">{lessonStatus(item, result.now)}</span>
        </div>
        <LessonInfo lesson={item} />
        <Link href={`/teacher/lessons/${item.id}`} className={`mt-5 ${linkStyle}`}>Открыть занятие</Link>
      </li>)}</ul>}
    </div>
  </main>;
}
