"use client";

import { useEffect, useRef, useState } from "react";
import { automaticExportPeriod, exportValidation, fetchAttendanceWorkbook } from "../_lib/export-attendance";
import type { LessonStatistics, StatisticsFilters } from "../_lib/statistics";

export default function AttendanceExport({ filters, lessons, disabled }: { filters: StatisticsFilters; lessons: LessonStatistics[]; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  const effectiveFilters = automaticExportPeriod(filters, lessons);
  const validation = exportValidation(effectiveFilters);

  async function download() {
    if (request.current || disabled || validation) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setNotice(""); setFailed(false);
    const timeout = setTimeout(() => controller.abort(), 60000);
    const snapshot = { ...effectiveFilters };
    try {
      const blob = await fetchAttendanceWorkbook(snapshot, controller.signal);
      if (request.current !== controller) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-${snapshot.groupId}-${snapshot.from}-${snapshot.to}.xlsx`;
      document.body.appendChild(link);
      try { link.click(); } finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
      setNotice("Файл Excel передан браузеру для скачивания.");
    } catch (error) {
      if (request.current !== controller) return;
      setFailed(true);
      setNotice(controller.signal.aborted || error instanceof TypeError
        ? "Нет связи с сервером или истекло время ожидания. Повторите скачивание."
        : error instanceof Error ? error.message : "Не удалось скачать Excel.");
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }

  return <div className="mt-4 border-t border-[#E9E3ED] pt-4">
    <button type="button" disabled={disabled || busy || Boolean(validation)} onClick={() => void download()}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D8D2DD] bg-white px-4 py-2 text-sm font-semibold text-[#514B56] hover:bg-[#F7F3FA] disabled:cursor-not-allowed disabled:opacity-50">
      {busy ? "Готовим Excel…" : "Скачать Excel"}
    </button>
    <p className="mt-2 text-xs leading-5 text-[#68636E]">{validation || "Журнал выбранной группы и дисциплины. Даты в Excel — по московскому времени."}</p>
    {!validation && <p className="mt-1 text-xs leading-5 text-[#68636E]">
      Период отчёта: {effectiveFilters.from.split("-").reverse().join(".")} — {effectiveFilters.to.split("-").reverse().join(".")}.
      {(!filters.from || !filters.to) && " Определён автоматически по занятиям. Для другого периода измените даты выше."}
    </p>}
    {notice && <p role={failed ? "alert" : "status"} className={`mt-2 text-sm ${failed ? "text-red-800" : "text-[#514B56]"}`}>{notice}</p>}
  </div>;
}
