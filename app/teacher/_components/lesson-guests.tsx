"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { allowLessonGuest, getLessonGuests, type LessonGuest } from "../_lib/lesson-guests";

const secondary = "min-h-11 rounded-lg border border-[#D8D2DD] bg-white px-4 py-2 text-sm font-semibold text-[#514B56] hover:bg-[#F7F3FA] disabled:cursor-not-allowed disabled:opacity-50";
export default function LessonGuests({ lessonId, closed }: { lessonId: number; closed: boolean }) {
  const [guests, setGuests] = useState<LessonGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const action = useRef<AbortController | null>(null);
  useEffect(() => () => { action.current?.abort(); action.current = null; }, []);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    getLessonGuests(lessonId, controller.signal).then((result) => {
      if (active) { setGuests(result); setLoadError(""); }
    }).catch((error) => {
      if (active) setLoadError(controller.signal.aborted || error instanceof TypeError
        ? "Не удалось связаться с сервером. Повторите загрузку списка гостей."
        : error instanceof Error ? error.message : "Не удалось получить гостей.");
    }).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [lessonId, attempt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (action.current || closed) return;
    const controller = new AbortController(); action.current = controller;
    const snapshot = email.trim().toLowerCase();
    setSaving(true); setNotice(""); setFailed(false);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      await allowLessonGuest(lessonId, snapshot, controller.signal);
      if (action.current !== controller) return;
      setNotice(`Студенту ${snapshot} разрешено посетить эту пару. Это разрешение ещё не подтверждает присутствие.`);
      setEmail(""); setLoading(true); setAttempt((value) => value + 1);
    } catch (error) {
      if (action.current !== controller) return;
      setFailed(true);
      setNotice(controller.signal.aborted || error instanceof TypeError
        ? "Связь прервалась. Обновите список гостей, чтобы проверить результат. Повторное разрешение той же пары не создаёт дубликат."
        : error instanceof Error ? error.message : "Не удалось разрешить посещение.");
    } finally {
      clearTimeout(timeout);
      if (action.current === controller) { action.current = null; setSaving(false); }
    }
  }
  return <section aria-labelledby="guests-title" className="mt-6 rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-5 sm:p-6">
    <h2 id="guests-title" className="text-xl font-semibold">Гостевое посещение</h2>
    <p className="mt-3 text-sm leading-6 text-[#68636E]">Разрешите студенту другой группы посетить только эту пару. Его постоянная группа не изменится. Во время занятия студент сможет выбрать разрешённую пару и отметиться по QR-коду.</p>
    {closed ? <p className="mt-4 text-sm text-[#68636E]">Занятие завершено или его время истекло. Новые разрешения недоступны.</p> : <form onSubmit={(event) => void submit(event)} className="mt-4">
      <label htmlFor={`guest-email-${lessonId}`} className="block text-sm font-semibold">Почта зарегистрированного студента</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input id={`guest-email-${lessonId}`} type="email" autoComplete="off" required maxLength={254} disabled={saving} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@example.com" className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#D8D2DD] bg-white px-3 text-sm focus:outline-[#A77BD1] disabled:opacity-50" />
        <button type="submit" disabled={saving || !email.trim()} className="min-h-11 rounded-lg bg-[#9C68BC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#895BB2] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Сохраняем…" : "Разрешить посещение"}</button>
      </div>
    </form>}
    {notice && <p role={failed ? "alert" : "status"} className={`mt-4 break-words text-sm leading-6 ${failed ? "text-red-800" : "text-green-800"}`}>{notice}</p>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-semibold">Кому разрешено посещение</h3>
      <button type="button" className={secondary} disabled={loading || saving} onClick={() => { setLoading(true); setAttempt((value) => value + 1); }}>Обновить список гостей</button>
    </div>
    {loading && <p role="status" className="mt-3 text-sm text-[#68636E]">Загружаем гостей…</p>}
    {loadError && <p role="alert" className="mt-3 text-sm text-red-800">{loadError}</p>}
    {!loading && !loadError && guests.length === 0 && <p className="mt-3 text-sm text-[#68636E]">Гостевых разрешений пока нет.</p>}
    <ul className="mt-3 space-y-2">{guests.map((guest) => <li key={guest.id} className="break-words rounded-lg border border-[#E5DFE9] bg-white p-3 text-sm">
      <p className="font-semibold">{guest.lastName} {guest.firstName}</p>
      <p className="mt-1 text-[#68636E]">{guest.email} · {guest.group ? `Группа ${guest.group.name}` : "Группа не указана"}</p>
      <p className="mt-1 text-[#68636E]">Посещение этой пары разрешено</p>
    </li>)}</ul>
  </section>;
}
