"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAttendance, reviewAttendanceBatch, type AttendanceRow } from "../_lib/attendance";

const buttonStyle = "min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50";
const labels = { PENDING: "Ожидает проверки", PRESENT: "Присутствует", LATE: "Опоздал(а)", REJECTED: "Отметка отклонена" };
const badgeStyles = { PENDING: "bg-amber-50 text-amber-900", PRESENT: "bg-green-50 text-green-800", LATE: "bg-blue-50 text-blue-800", REJECTED: "bg-red-50 text-red-800" };

export default function LessonAttendance({ lessonId, finished }: { lessonId: number; finished: boolean }) {
  const [rows, setRows] = useState<AttendanceRow[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<{ ids: number[]; action: "approve" | "reject"; name: string } | null>(null);
  const [reason, setReason] = useState("");
  const busyRef = useRef(false);
  const mounted = useRef(false);
  const version = useRef(0);
  const reading = useRef<AbortController | null>(null);
  const writing = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (busyRef.current || reading.current) return;
    const current = ++version.current;
    const controller = new AbortController(); reading.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    try { const next = await getAttendance(lessonId, controller.signal); if (mounted.current && current === version.current) { setRows(next); setError(""); } }
    catch (cause) { if (mounted.current && current === version.current) setError(cause instanceof TypeError || controller.signal.aborted ? "Нет связи с сервером. Данные могли устареть. Нажмите «Обновить»." : cause instanceof Error ? cause.message : "Не удалось загрузить посещаемость."); }
    finally { clearTimeout(timeout); if (current === version.current) { reading.current = null; if (mounted.current) setLoading(false); } }
  }, [lessonId]);

  useEffect(() => {
    mounted.current = true;
    const initial = setTimeout(() => { void refresh(); }, 0);
    const interval = setInterval(() => { if (!document.hidden) void refresh(); }, 10000);
    const focus = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", focus);
    return () => {
      mounted.current = false;
      // Это счётчик запросов, а не ссылка на DOM: инвалидируем текущий запрос.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      version.current++;
      reading.current?.abort(); reading.current = null; writing.current?.abort();
      clearTimeout(initial); clearInterval(interval); window.removeEventListener("focus", focus);
    };
  }, [refresh]);

  async function review() {
    if (!selected || busyRef.current) return;
    if (selected.action === "reject" && !reason.trim()) { setNotice("Укажите причину отклонения."); return; }
    busyRef.current = true; setBusy(true); setNotice("");
    version.current++; reading.current?.abort(); reading.current = null; setLoading(false);
    const controller = new AbortController(); writing.current = controller;
    try {
      const result = await reviewAttendanceBatch(selected.ids, selected.action, controller.signal, reason, count => {
        if (mounted.current) setNotice(`Сохранено решений: ${count} из ${selected.ids.length}.`);
      });
      if (mounted.current) {
        setNotice(result.error
          ? `Сохранено решений: ${result.completed} из ${selected.ids.length}. Обработка остановлена. ${result.error} Обновите данные перед повтором.`
          : selected.ids.length === 1 ? (selected.action === "approve" ? "Отметка подтверждена." : "Отметка отклонена.") : `Готово. ${selected.action === "approve" ? "Подтверждено" : "Отклонено"} заявок: ${result.completed}.`);
        setSelected(null); setReason("");
      }
    } catch (cause) {
      if (mounted.current) { setNotice(cause instanceof TypeError || controller.signal.aborted ? "Не удалось получить подтверждение сервера. Проверьте обновлённый статус перед повтором." : cause instanceof Error ? cause.message : "Не удалось сохранить решение."); setSelected(null); }
    } finally {
      writing.current = null; busyRef.current = false;
      if (mounted.current) { setBusy(false); await refresh(); }
    }
  }

  const pendingIds = rows?.flatMap(row => row.attendance?.status === "PENDING" && !row.attendance.reviewed ? [row.attendance.id] : []) ?? [];
  const confirmed = rows?.filter(row => row.attendance && ["PRESENT", "LATE"].includes(row.attendance.status)).length ?? 0;
  const pending = rows?.filter(row => row.attendance?.status === "PENDING").length ?? 0;
  return <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Посещаемость</h2><button disabled={busy || loading} onClick={() => void refresh()} className={buttonStyle}>{loading ? "Обновляем…" : "Обновить"}</button></div>
    {rows && <p className="mt-3 text-sm text-slate-600">Студентов: {rows.length}. Присутствуют с учётом опоздавших: {confirmed}. Ожидают проверки: {pending}.</p>}
    <p className="mt-2 text-sm text-slate-600">Данные обновляются каждые 10 секунд, пока страница открыта.</p>
    {pendingIds.length > 0 && <div className="mt-4 flex flex-wrap gap-3">
      <button className={buttonStyle} disabled={busy || loading || Boolean(error)} onClick={() => { setSelected({ ids: pendingIds, action: "approve", name: "" }); setReason(""); setNotice(""); }}>Подтвердить все ({pendingIds.length})</button>
      <button className={buttonStyle} disabled={busy || loading || Boolean(error)} onClick={() => { setSelected({ ids: pendingIds, action: "reject", name: "" }); setReason(""); setNotice(""); }}>Отклонить все ({pendingIds.length})</button>
      <p className="w-full text-sm text-slate-600">Только заявки, ожидающие проверки. Студенты без отметки и рассмотренные заявки не изменятся.</p>
    </div>}
    {selected && <form className="mt-5 rounded-lg border border-slate-300 p-4" onSubmit={event => { event.preventDefault(); void review(); }}>
      <p className="font-semibold">{selected.action === "approve" ? "Подтвердить" : "Отклонить"} {selected.name ? `отметку: ${selected.name}` : `все выбранные заявки (${selected.ids.length})`}?</p>
      {selected.action === "approve" ? <p className="mt-2 text-sm">Сервер определит статус «Присутствует» или «Опоздал(а)» по времени каждой отметки.</p> : <div className="mt-3"><label htmlFor="rejection-reason" className="block text-sm font-semibold">Причина отклонения{!selected.name && " (общая для выбранных заявок)"}</label><textarea id="rejection-reason" required disabled={busy} value={reason} onChange={event => setReason(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 p-3" /></div>}
      {!selected.name && <p className="mt-3 text-sm text-slate-600">Будут обработаны заявки, выбранные при нажатии кнопки. Новые заявки останутся на проверке. Сохранённые решения нельзя изменить в этом интерфейсе.</p>}
      <div className="mt-4 flex flex-wrap gap-3"><button disabled={busy || loading || Boolean(error)} className={buttonStyle} type="submit">{busy ? "Сохраняем…" : "Сохранить решение"}</button><button disabled={busy} type="button" className={buttonStyle} onClick={() => setSelected(null)}>Отмена</button></div>
    </form>}
    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-lg bg-slate-50 p-3">{notice}</p>}
    {!rows ? <p role="status" className="mt-5">{error ? "Посещаемость не загружена." : "Загружаем посещаемость…"}</p> : !rows.length ? <p className="mt-5">В группе пока нет студентов и отметок.</p> : <>
      <ul className="mt-5 space-y-4 sm:hidden" aria-label="Посещаемость студентов">{rows.map(({ student, attendance: a }) => <li key={student.id} className="min-w-0 rounded-xl border border-slate-200 p-4 text-sm">
        <h3 className="break-words font-semibold">{student.lastName} {student.firstName}</h3>
        <p className="mt-1 break-all text-slate-500">{student.email}</p>
        <dl className="mt-4 space-y-4">
          <div><dt className="font-semibold">Статус</dt><dd className="mt-1"><span className={`inline-block rounded-lg px-2 py-1 ${a ? badgeStyles[a.status] : "bg-slate-100 text-slate-700"}`}>{a ? labels[a.status] : finished ? "Не отметился(ась)" : "Пока не отметился(ась)"}</span>{a?.rejectionReason && <p className="mt-2 whitespace-pre-wrap break-words">Причина: {a.rejectionReason}</p>}</dd></div>
          <div><dt className="font-semibold">Время отметки</dt><dd className="mt-1 break-words">{a ? new Date(a.markedAt).toLocaleString("ru-RU") : "—"}</dd></div>
          <div><dt className="font-semibold">Проверки</dt><dd className="mt-1 break-words">{a ? <ul className="space-y-1"><li>Лицо: {a.faceChecked ? "пройдена" : "не подтверждена"}</li><li>Устройство: {a.deviceChecked ? "пройдена" : "не подтверждена"}</li><li>Местоположение: {a.locationChecked ? "пройдена" : "не подтверждена"}</li></ul> : "Нет отметки"}</dd></div>
          <div><dt className="font-semibold">Решение</dt><dd className="mt-2">{a ? a.reviewed ? "Рассмотрено" : <div className="flex flex-col gap-2"><button disabled={busy || loading || Boolean(error)} className={buttonStyle} onClick={() => { setSelected({ ids: [a.id], action: "approve", name: `${student.lastName} ${student.firstName}` }); setReason(""); setNotice(""); }}>Подтвердить</button><button disabled={busy || loading || Boolean(error)} className={buttonStyle} onClick={() => { setSelected({ ids: [a.id], action: "reject", name: `${student.lastName} ${student.firstName}` }); setReason(""); setNotice(""); }}>Отклонить</button></div> : "—"}</dd></div>
        </dl>
      </li>)}</ul>
      <div className="mt-5 hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm">
      <caption className="sr-only">Студенты и отметки посещаемости занятия</caption>
      <thead><tr className="border-b border-slate-200"><th scope="col" className="p-3">Студент</th><th scope="col" className="p-3">Статус</th><th scope="col" className="p-3">Время отметки</th><th scope="col" className="p-3">Проверки</th><th scope="col" className="p-3">Решение</th></tr></thead>
      <tbody>{rows.map(({ student, attendance: a }) => <tr key={student.id} className="border-b border-slate-100 align-top">
        <th scope="row" className="p-3 font-normal"><span className="font-semibold">{student.lastName} {student.firstName}</span><span className="mt-1 block break-all text-slate-500">{student.email}</span></th>
        <td className="p-3"><span className={`inline-block rounded-lg px-2 py-1 ${a ? badgeStyles[a.status] : "bg-slate-100 text-slate-700"}`}>{a ? labels[a.status] : finished ? "Не отметился(ась)" : "Пока не отметился(ась)"}</span>{a?.rejectionReason && <p className="mt-2 whitespace-pre-wrap break-words">Причина: {a.rejectionReason}</p>}</td>
        <td className="whitespace-nowrap p-3">{a ? new Date(a.markedAt).toLocaleString("ru-RU") : "—"}</td>
        <td className="p-3">{a ? <ul className="space-y-1"><li>Лицо: {a.faceChecked ? "пройдена" : "не подтверждена"}</li><li>Устройство: {a.deviceChecked ? "пройдена" : "не подтверждена"}</li><li>Местоположение: {a.locationChecked ? "пройдена" : "не подтверждена"}</li></ul> : "Нет отметки"}</td>
        <td className="p-3">{a ? a.reviewed ? "Рассмотрено" : <div className="flex flex-col gap-2"><button disabled={busy || loading || Boolean(error)} className={buttonStyle} onClick={() => { setSelected({ ids: [a.id], action: "approve", name: `${student.lastName} ${student.firstName}` }); setReason(""); setNotice(""); }}>Подтвердить</button><button disabled={busy || loading || Boolean(error)} className={buttonStyle} onClick={() => { setSelected({ ids: [a.id], action: "reject", name: `${student.lastName} ${student.firstName}` }); setReason(""); setNotice(""); }}>Отклонить</button></div> : "—"}</td>
      </tr>)}</tbody>
    </table></div></>}

  </section>;
}
