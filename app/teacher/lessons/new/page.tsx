"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createLesson, DISCIPLINES, getLessonReferences, type Reference } from "../../_lib/create-lesson";

const fieldStyle = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:outline-2 focus:outline-blue-700";
const buttonStyle = "min-h-11 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500";

export default function NewTeacherLessonPage() {
  const router = useRouter();
  const [references, setReferences] = useState<{ groups: Reference[]; classrooms: Reference[] } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    getLessonReferences(controller.signal).then(data => { if (active) setReferences(data); }).catch(cause => {
      if (active) setLoadError(controller.signal.aborted || cause instanceof TypeError ? "Нет связи с сервером. Проверьте, что Backend запущен." : cause instanceof Error ? cause.message : "Не удалось загрузить данные.");
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [attempt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !references?.groups.length || !references.classrooms.length) return;
    submitting.current = true; setPending(true); setSubmitError("");
    const data = new FormData(event.currentTarget);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const id = await createLesson({ discipline: String(data.get("discipline")), groupId: Number(data.get("groupId")), classroomId: Number(data.get("classroomId")), startsAt: String(data.get("startsAt")), endsAt: String(data.get("endsAt")) }, controller.signal);
      router.push(`/teacher/lessons/${id}`);
    } catch (cause) {
      setSubmitError(controller.signal.aborted || cause instanceof TypeError ? "Не удалось получить ответ сервера. Перед повторной отправкой проверьте «Мои занятия»: занятие могло сохраниться." : cause instanceof Error ? cause.message : "Не удалось создать занятие.");
      submitting.current = false; setPending(false);
    } finally { clearTimeout(timeout); }
  }

  const empty = references && (!references.groups.length || !references.classrooms.length);
  return <main lang="ru" className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
    <div className="mx-auto max-w-2xl">
      <Link href="/teacher/lessons" className="text-sm font-semibold text-blue-700 hover:underline">← К списку занятий</Link>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Начать занятие</h1>
      <p className="mt-4 leading-7 text-slate-600">Выберите дисциплину, группу и аудиторию. Укажите начало и окончание по местному времени устройства.</p>
      {loadError ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <p role="alert">{loadError}</p>
        <button className={`mt-4 ${buttonStyle}`} onClick={() => { setLoadError(""); setAttempt(value => value + 1); }}>Повторить загрузку</button>
      </div> : !references ? <p role="status" className="mt-6">Загружаем группы и аудитории…</p> : null}
      {empty && <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">{!references.groups.length && "В базе пока нет групп. "}{!references.classrooms.length && "В базе пока нет аудиторий. "}Для создания занятия сначала нужно добавить эти данные в базу проекта, затем обновить страницу.</p>}
      <form onSubmit={submit} className="mt-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <fieldset disabled={pending} className="space-y-6">
          <div><label htmlFor="discipline" className="block text-sm font-semibold">Дисциплина</label>
            <select id="discipline" name="discipline" required defaultValue="" className={fieldStyle}><option value="" disabled>Выберите дисциплину</option>{DISCIPLINES.map(name => <option key={name} value={name}>{name}</option>)}</select>
          </div>
          <div><label htmlFor="groupId" className="block text-sm font-semibold">Группа</label>
            <select id="groupId" name="groupId" required defaultValue="" disabled={!references?.groups.length} className={fieldStyle}><option value="" disabled>Выберите группу</option>{references?.groups.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </div>
          <div><label htmlFor="classroomId" className="block text-sm font-semibold">Аудитория</label>
            <select id="classroomId" name="classroomId" required defaultValue="" disabled={!references?.classrooms.length} className={fieldStyle}><option value="" disabled>Выберите аудиторию</option>{references?.classrooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </div>
          <div><label htmlFor="startsAt" className="block text-sm font-semibold">Начало занятия</label><input id="startsAt" name="startsAt" type="datetime-local" required className={fieldStyle} /></div>
          <div><label htmlFor="endsAt" className="block text-sm font-semibold">Окончание занятия</label><input id="endsAt" name="endsAt" type="datetime-local" required className={fieldStyle} /></div>
          {submitError && <p role="alert" className="text-sm text-red-800">{submitError} <Link href="/teacher/lessons" className="underline">Мои занятия</Link></p>}
          <button type="submit" disabled={pending || !references || Boolean(empty)} className={`w-full ${buttonStyle}`}>{pending ? "Создаём занятие…" : "Создать занятие"}</button>
        </fieldset>
      </form>
    </div>
  </main>;
}
