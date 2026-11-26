"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { importSchedule, prepareSchedule, ScheduleImportError, type ScheduleRowError } from "../../_lib/import-schedule";

export default function ScheduleImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [rows, setRows] = useState<ScheduleRowError[]>([]);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);

  async function upload() {
    if (!file || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setNotice(""); setRows([]); setFailed(false);
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      if (!file.name.toLowerCase().endsWith(".json")) throw new ScheduleImportError("Выберите файл с расширением .json.");
      if (file.size > 100 * 1024) throw new ScheduleImportError("Файл превышает 100 КБ. Разделите расписание на несколько файлов.");
      const body = prepareSchedule(await file.text());
      if (request.current !== controller) return;
      controller.signal.throwIfAborted();
      const result = await importSchedule(body, controller.signal);
      if (request.current !== controller) return;
      setNotice(`Расписание загружено. Обработано записей файла: ${result.sourceEntries}; записей по группам: ${result.imported}. Повторная загрузка тех же записей обновляет их без дубликатов.`);
    } catch (error) {
      if (request.current !== controller) return;
      setFailed(true);
      if (error instanceof ScheduleImportError) { setNotice(error.message); setRows(error.rows); }
      else setNotice("Связь с сервером прервана или истекло время ожидания. Результат загрузки неизвестен. Можно повторить загрузку того же файла: дубликаты не создаются.");
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }

  return <main className="min-h-screen bg-[#F7F5F8] px-3 py-4 text-[#171717] sm:px-5">
    <div className="mx-auto max-w-4xl rounded-2xl border border-[#D8D2DD] bg-white p-5 sm:p-8">
      <Link href="/teacher" className="text-sm font-semibold text-[#895BB2] hover:underline">← Кабинет преподавателя</Link>
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Загрузка расписания</h1>
      <p className="mt-3 text-sm leading-6 text-[#68636E]">Выберите подготовленный файл JSON в кодировке UTF-8. Файл должен содержать массив записей расписания. Доступ к загрузке предоставляется ответственным сотрудникам.</p>
      <form className="mt-6 rounded-xl border border-[#D8D2DD] bg-[#FCFAFD] p-5" onSubmit={(event) => { event.preventDefault(); void upload(); }}>
        <label htmlFor="schedule-file" className="block text-sm font-semibold">Файл расписания</label>
        <input id="schedule-file" type="file" accept=".json,application/json" disabled={busy}
          onChange={(event) => { setFile(event.target.files?.[0] ?? null); setNotice(""); setRows([]); setFailed(false); }}
          className="mt-3 block w-full min-w-0 text-sm text-[#514B56] file:mr-3 file:rounded-lg file:border file:border-[#D8D2DD] file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold disabled:opacity-50" aria-describedby="schedule-help" />
        <p id="schedule-help" className="mt-3 text-xs leading-5 text-[#68636E]">До 100 КБ и 1000 записей. Номер строки в ошибке означает номер записи в массиве, начиная с 1. Время пар указывается по Москве (+03:00).</p>
        <button type="submit" disabled={!file || busy} className="mt-5 min-h-11 rounded-lg bg-[#9C68BC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#895BB2] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Загружаем…" : "Загрузить расписание"}</button>
      </form>
      {notice && <div role={failed ? "alert" : "status"} className={`mt-5 break-words rounded-xl border p-4 text-sm leading-6 ${failed ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-900"}`}>
        <p>{notice}</p>
        {rows.length > 0 && <ul className="mt-3 list-disc space-y-2 pl-5">{rows.map((item, index) => <li key={`${item.row}-${index}`}><strong>{item.row === 0 ? "Файл" : `Строка ${item.row}`}:</strong> {item.message}</li>)}</ul>}
      </div>}
      <p className="mt-5 text-sm leading-6 text-[#68636E]">При ошибках проверки файл целиком отклоняется. Для общей пары нескольких групп используется одна запись с полем groups. Физкультура не включается в учёт посещаемости.</p>
    </div>
  </main>;
}
