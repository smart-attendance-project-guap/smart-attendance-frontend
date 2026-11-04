"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { finishLesson, generateQr } from "../_lib/lesson-actions";

const buttonStyle = "min-h-11 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500";

export default function LessonActions({ id, finishedAt, onFinished }: { id: number; finishedAt: string | null; onFinished: (at: string) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [qr, setQr] = useState<{ src: string; deadline: number } | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [qrError, setQrError] = useState("");
  const [finishError, setFinishError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (!enabled || finishedAt) return;
    let active = true;
    let controller: AbortController | undefined;
    let refresh: ReturnType<typeof setTimeout> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let deadline = 0;
    let loading = false;
    async function update() {
      if (!active || loading || document.hidden) return;
      loading = true; deadline = 0; setQr(null); setRemaining(0); setQrError("");
      controller = new AbortController();
      timeout = setTimeout(() => controller?.abort(), 10000);
      try {
        const next = await generateQr(id, controller.signal);
        const src = await QRCode.toDataURL(next.payload, { width: 320, margin: 4, errorCorrectionLevel: "M" });
        if (!active) return;
        if (next.deadline <= Date.now()) throw new Error("Код истёк при загрузке. Повторите запрос.");
        deadline = next.deadline; setQr({ src, deadline });
        setRemaining(Math.ceil((deadline - Date.now()) / 1000));
        refresh = setTimeout(() => { void update(); }, Math.max(0, deadline - Date.now()));
      } catch (cause) {
        if (active) { setQr(null); setQrError(cause instanceof Error && cause.name !== "AbortError" && !(cause instanceof TypeError) ? cause.message : "Не удалось обновить QR-код. Проверьте связь с сервером."); setEnabled(false); }
      } finally { loading = false; clearTimeout(timeout); }
    }
    const tick = setInterval(() => {
      if (!active) return;
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) setQr(null);
    }, 250);
    function visibility() {
      clearTimeout(refresh);
      if (document.hidden) { deadline = 0; setQr(null); controller?.abort(); }
      else if (!loading) { void update(); }
    }
    document.addEventListener("visibilitychange", visibility);
    void update();
    return () => { active = false; clearInterval(tick); clearTimeout(refresh); clearTimeout(timeout); controller?.abort(); document.removeEventListener("visibilitychange", visibility); };
  }, [id, enabled, finishedAt]);

  async function finish() {
    if (busy.current) return;
    busy.current = true; setFinishing(true); setEnabled(false); setQr(null); setFinishError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try { const at = await finishLesson(id, controller.signal); onFinished(at); setConfirming(false); }
    catch (cause) { setFinishError(cause instanceof TypeError || controller.signal.aborted ? "Нет подтверждения от сервера. Обновите страницу, чтобы проверить, завершилось ли занятие." : cause instanceof Error ? cause.message : "Не удалось завершить занятие."); }
    finally { clearTimeout(timeout); busy.current = false; setFinishing(false); }
  }

  return <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 className="text-xl font-semibold">Управление занятием</h2>
    {finishedAt ? <p role="status" className="mt-4">Занятие завершено. Новые отметки по QR-коду недоступны.</p> : <>
      <p className="mt-3 text-sm text-slate-600">Покажите QR-код студентам. Он автоматически обновляется каждые 15 секунд. При ошибке или истечении срока код скрывается.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button disabled={finishing || confirming} className={buttonStyle} onClick={() => { setQrError(""); setQr(null); setEnabled(value => !value); }}>{enabled ? "Скрыть QR-код" : "Показать QR-код"}</button>
        <button disabled={finishing} className={buttonStyle} onClick={() => { setEnabled(false); setQr(null); setConfirming(true); }}>Завершить занятие</button>
      </div>
      {enabled && !qr && !qrError && <p role="status" className="mt-4">Обновляем QR-код…</p>}
      {enabled && qr && remaining > 0 && <div className="mt-5">
        {/* QR генерируется локально; токен не передаётся внешнему сервису. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr.src} alt={`QR-код для отметки на занятии ${id}`} width={320} height={320} className="max-w-full" />
        <p className="mt-2 text-sm">Обновление через {remaining} сек.</p>
      </div>}
      {qrError && <p role="alert" className="mt-4 text-red-800">{qrError} Нажмите «Показать QR-код», чтобы повторить.</p>}
      {confirming && <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p>Завершить занятие? После этого студенты не смогут отмечаться по QR-коду.</p>
        <div className="mt-4 flex flex-wrap gap-3"><button disabled={finishing} className={buttonStyle} onClick={finish}>{finishing ? "Завершаем…" : "Да, завершить"}</button><button disabled={finishing} className={buttonStyle} onClick={() => setConfirming(false)}>Отмена</button></div>
      </div>}
      {finishError && <p role="alert" className="mt-4 text-red-800">{finishError}</p>}
    </>}
  </section>;
}
