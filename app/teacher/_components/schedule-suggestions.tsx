"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchScheduleSuggestions, startScheduledLesson, ScheduleStartError, type ScheduleSuggestion, type ScheduleClassroom } from "../_lib/schedule-suggestions";

const buttonClass = "min-h-11 rounded-lg border border-[#D8D2DD] bg-white px-4 py-2 text-sm font-semibold text-[#514B56] hover:bg-[#F7F3FA] disabled:cursor-not-allowed disabled:opacity-50";
function period(item: ScheduleSuggestion) {
  const date = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(item.startsAt));
  const end = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" }).format(new Date(item.endsAt));
  return `${date} – ${end} (МСК)`;
}
type StartNotice = { id: number; message: string; classrooms: ScheduleClassroom[] };
export default function ScheduleSuggestions() {
  const router = useRouter();
  const [items, setItems] = useState<ScheduleSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [hidden, setHidden] = useState<number[]>([]);
  const [starting, setStarting] = useState<number | null>(null);
  const [notice, setNotice] = useState<StartNotice | null>(null);
  const [classroom, setClassroom] = useState("");
  const action = useRef<AbortController | null>(null);
  useEffect(() => () => { action.current?.abort(); action.current = null; }, []);
  useEffect(() => {
    let active = true;
    let current: AbortController | null = null;
    async function load() {
      if (current) return;
      const controller = new AbortController(); current = controller;
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const result = await fetchScheduleSuggestions(controller.signal);
        if (!active) return;
        setItems(result); setLoadError("");
      } catch (error) {
        if (active) setLoadError(controller.signal.aborted || error instanceof TypeError
          ? "Не удалось связаться с сервером. Обновите список позже."
          : error instanceof Error ? error.message : "Не удалось получить ближайшие пары.");
      } finally {
        clearTimeout(timeout); current = null;
        if (active) setLoading(false);
      }
    }
    void load();
    const interval = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 30000);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => { active = false; current?.abort(); clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [attempt]);

  async function start(item: ScheduleSuggestion) {
    if (action.current) return;
    const controller = new AbortController(); action.current = controller;
    setStarting(item.id);
    const chosen = notice?.id === item.id && classroom ? Number(classroom) : undefined;
    setNotice(null);
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const lessonId = await startScheduledLesson(item.id, controller.signal, chosen);
      if (action.current === controller) router.push(`/teacher/lessons/${lessonId}`);
    } catch (error) {
      if (action.current !== controller) return;
      const rooms = error instanceof ScheduleStartError ? error.classrooms : [];
      setNotice({ id: item.id, classrooms: rooms, message: controller.signal.aborted || error instanceof TypeError
        ? "Связь прервалась. Проверьте «Мои занятия» или повторите запуск: одна запись расписания не создаёт повторное занятие."
        : error instanceof Error ? error.message : "Не удалось запустить занятие." });
      setClassroom("");
    } finally {
      clearTimeout(timeout);
      if (action.current === controller) { action.current = null; setStarting(null); }
    }
  }
  const visible = items.filter((item) => !hidden.includes(item.canonicalScheduleId));
  return <section aria-labelledby="schedule-title" className="mt-6 rounded-xl border border-[#D8D2DD] bg-[#FCFAFD] p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="schedule-title" className="text-xl font-bold">Ближайшие пары</h2>
      <button type="button" className={buttonClass} disabled={loading || starting !== null} onClick={() => { setLoading(true); setAttempt((value) => value + 1); }}>Обновить</button>
    </div>
    <p className="mt-2 text-sm leading-6 text-[#68636E]">Пары из вашего расписания появляются за 30 минут до начала и доступны до окончания. Время указано по Москве. Список обновляется каждые 30 секунд, пока вкладка открыта.</p>
    {loading && <p role="status" className="mt-3 text-sm">Загружаем ближайшие пары…</p>}
    {loadError && <p role="alert" className="mt-3 text-sm text-red-800">{loadError}</p>}
    {!loading && !loadError && visible.length === 0 && <p className="mt-4 text-sm text-[#68636E]">{items.length ? "Все предложения скрыты." : "Сейчас подходящих пар нет. Если ожидаете пару, уточните привязку расписания к вашему аккаунту."}</p>}
    {hidden.length > 0 && <button type="button" disabled={starting !== null} className="mt-3 text-sm font-semibold text-[#895BB2] hover:underline disabled:opacity-50" onClick={() => setHidden([])}>Показать скрытые предложения</button>}
    <ul className="mt-4 space-y-3">{visible.map((item) => <li key={item.canonicalScheduleId} className="min-w-0 rounded-lg border border-[#E5DFE9] bg-white p-4">
      <h3 className="break-words text-base font-bold">{item.discipline}</h3>
      <p className="mt-2 text-sm text-[#514B56]">{period(item)}</p>
      <p className="mt-1 break-words text-sm text-[#68636E]">Группы: {item.groups.map((group) => group.name).join(", ")}. Аудитория: {item.classroom}.</p>
      {notice?.id === item.id && <div className="mt-3">
        <p role="alert" className="text-sm text-red-800">{notice.message}</p>
        {notice.classrooms.length > 0 && <label className="mt-3 block text-sm font-semibold">Аудитория и корпус
          <select value={classroom} disabled={starting !== null} onChange={(event) => setClassroom(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-[#D8D2DD] bg-white p-2 font-normal">
            <option value="">Выберите аудиторию</option>
            {notice.classrooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.building?.name || "Корпус не указан"}</option>)}
          </select>
        </label>}
      </div>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={starting !== null || Boolean(notice?.id === item.id && notice.classrooms.length && !classroom)} onClick={() => void start(item)} className="min-h-11 rounded-lg bg-[#9C68BC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#895BB2] disabled:cursor-not-allowed disabled:opacity-50">{starting === item.id ? "Запускаем…" : "Открыть / начать занятие"}</button>
        <button type="button" disabled={starting !== null} className={buttonClass} onClick={() => { setHidden((previous) => [...previous, item.canonicalScheduleId]); if (notice?.id === item.id) { setNotice(null); setClassroom(""); } }}>Скрыть</button>
      </div>
    </li>)}</ul>
    <Link href="/teacher/lessons/new" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#895BB2] hover:underline">Создать занятие вручную →</Link>
  </section>;
}
