
"use client";

import { useCallback, useRef, useState } from "react";
import QrScanner from "./QrScanner";
import { markAttendanceByQr } from "./markAttendance";

type LocationState = "idle" | "loading" | "success" | "error";

export default function StudentAttendancePage() {
  const [locationState, setLocationState] =
    useState<LocationState>("idle");

  const [locationMessage, setLocationMessage] = useState(
    "Местоположение ещё не запрашивалось."
  );


  const [markState, setMarkState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [markMessage, setMarkMessage] = useState("");
  const markingRef = useRef(false);

  const handleQrScan = useCallback((value: string) => {
    if (markingRef.current) return;

    markingRef.current = true;
    setMarkState("loading");
    setMarkMessage("Проверяем QR-код на сервере…");

    void markAttendanceByQr(value)
      .then((message) => {
        setMarkState("success");
        setMarkMessage(message);
      })
      .catch((error: unknown) => {
        setMarkState("error");
        setMarkMessage(
          error instanceof Error
            ? error.message
            : "Не удалось отметить посещение."
        );
      })
      .finally(() => {
        markingRef.current = false;
      });
  }, []);


  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationMessage(
        "Этот браузер не поддерживает получение геолокации."
      );
      return;
    }

    setLocationState("loading");
    setLocationMessage("Определяем местоположение…");

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationState("success");
        setLocationMessage(
          "Геолокация работает. Передача координат на сервер пока не подключена."
        );
      },
      (error) => {
        setLocationState("error");

        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Доступ к геолокации запрещён. Разреши его в настройках браузера."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage(
            "Не удалось определить местоположение вовремя. Попробуй ещё раз."
          );
        } else {
          setLocationMessage(
            "Местоположение недоступно. Проверь настройки устройства и повтори попытку."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/student"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Вернуться в личный кабинет
        </a>

        <header className="mb-8 mt-6">
          <p className="text-sm font-medium text-indigo-600">
            SMART ATTENDANCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Отметка посещения
          </h1>

          <p className="mt-2 text-slate-500">
            Отсканируй QR-код преподавателя и подготовь устройство
            к проверке условий посещения.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">
            1. Отсканируй QR-код
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
            <QrScanner onScan={handleQrScan} />
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Разреши доступ к камере, когда браузер запросит его.
            Наведи камеру на QR-код преподавателя.
          </p>


          {markState !== "idle" && (
            <div
              role="status"
              className={`mt-4 rounded-xl border p-4 ${markState === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : markState === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
            >
              <p className="font-semibold">
                {markState === "loading"
                  ? "Проверяем QR-код"
                  : markState === "success"
                    ? "Отметка создана"
                    : "Не удалось отметить посещение"}
              </p>
              <p className="mt-2 text-sm">{markMessage}</p>
            </div>
          )}


          <div className="my-7 border-t border-slate-200" />

          <h2 className="font-semibold">
            2. Разреши определение местоположения
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Координаты запрашиваются только после нажатия кнопки.
            Сейчас проверяется доступ к геолокации, без отправки данных на сервер.
          </p>

          {locationState !== "success" && (
            <button
              type="button"
              onClick={requestLocation}
              disabled={locationState === "loading"}
              className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {locationState === "loading"
                ? "Определяем местоположение…"
                : "Разрешить геолокацию"}
            </button>
          )}

          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${locationState === "error"
              ? "text-rose-600"
              : locationState === "success"
                ? "text-emerald-700"
                : "text-slate-500"
              }`}
          >
            {locationMessage}
          </p>
        </section>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          После сканирования QR-код проверяется сервером.
          При успешной проверке создаётся отметка со статусом PENDING,
          которую должен подтвердить преподаватель.
          Проверка геолокации и автоматическое подтверждение пока не подключены.
        </div>
      </div>
    </main>
  );
}
