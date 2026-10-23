
"use client";

import { useCallback, useState } from "react";
import QrScanner from "./QrScanner";

type LocationState = "idle" | "loading" | "success" | "error";

export default function StudentAttendancePage() {
  const [locationState, setLocationState] =
    useState<LocationState>("idle");

  const [locationMessage, setLocationMessage] = useState(
    "Местоположение ещё не запрашивалось."
  );

  const [qrValue, setQrValue] = useState("");

  const handleQrScan = useCallback((value: string) => {
    setQrValue(value);
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
          "Координаты получены. Проверка допустимой зоны выполняется Backend."
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

          {qrValue && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-800">
                QR-код считан
              </p>

              <p className="mt-2 break-all text-sm text-emerald-700">
                {qrValue}
              </p>

              <p className="mt-2 text-sm text-emerald-700">
                Это только результат считывания. Подлинность QR
                и посещение ещё не подтверждены Backend.
              </p>
            </div>
          )}

          <div className="my-7 border-t border-slate-200" />

          <h2 className="font-semibold">
            2. Разреши определение местоположения
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Координаты запрашиваются только после нажатия кнопки.
            Проверку допустимой зоны выполняет сервер.
          </p>

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

          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${
              locationState === "error"
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
          Серверная проверка QR, отправка координат и подтверждение
          посещения пока не подключены. Считывание QR само по себе
          не засчитывает занятие.
        </div>
      </div>
    </main>
  );
}
