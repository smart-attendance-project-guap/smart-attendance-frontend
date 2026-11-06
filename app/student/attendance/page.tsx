
"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import QrScanner from "./QrScanner";
import {
  API_URL,
  getStudentToken,
  verifyStudent,
  clearStudentToken,
} from "../_lib/auth";

type LocationState = "idle" | "loading" | "success" | "error";
type AttendanceState = "idle" | "loading" | "success" | "error";

type QrPayload = {
  lessonId: number;
  qrToken: string;
};

export default function StudentAttendancePage() {
  const [locationState, setLocationState] =
    useState<LocationState>("idle");
  const [locationMessage, setLocationMessage] = useState(
    "Местоположение ещё не запрашивалось."
  );

  const [attendanceState, setAttendanceState] =
    useState<AttendanceState>("idle");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [scannerKey, setScannerKey] = useState(0);

  const handleQrScan = useCallback((value: string) => {
    setQrValue(value);
    setAttendanceState("idle");
    setAttendanceMessage("");
  }, []);

  async function submitAttendance() {
    if (attendanceState === "loading" || attendanceState === "success") {
      return;
    }

    let payload: QrPayload;

    try {
      const parsed: unknown = JSON.parse(qrValue);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("lessonId" in parsed) ||
        !("qrToken" in parsed) ||
        typeof parsed.lessonId !== "number" ||
        !Number.isInteger(parsed.lessonId) ||
        parsed.lessonId <= 0 ||
        typeof parsed.qrToken !== "string" ||
        !parsed.qrToken.trim()
      ) {
        throw new Error();
      }

      payload = parsed as QrPayload;
    } catch {
      setAttendanceState("error");
      setAttendanceMessage("QR-код имеет неверный формат.");
      return;
    }

    setAttendanceState("loading");
    setAttendanceMessage("Отправляем отметку на сервер…");

    try {
      const controller = new AbortController();

      const authorized = await verifyStudent(controller.signal);

      if (!authorized) {
        clearStudentToken();
        window.location.replace("/student/login");
        return;
      }

      const token = getStudentToken();

      const response = await fetch(
        `${API_URL}/api/attendance/${payload.lessonId}/mark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            qrToken: payload.qrToken,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        clearStudentToken();
        window.location.replace("/student/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Сервер не смог принять отметку."
        );
      }

      setAttendanceState("success");
      setAttendanceMessage(
        "Отметка отправлена. Ожидается прохождение проверок."
      );
    } catch (cause) {
      setAttendanceState("error");

      setAttendanceMessage(
        cause instanceof Error
          ? cause.name === "TimeoutError"
            ? "Время ожидания ответа сервера истекло."
            : cause instanceof TypeError
              ? "Нет связи с сервером. Попробуй ещё раз."
              : cause.message
          : "Не удалось отправить отметку."
      );
    }
  }

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
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationState("success");
        setLocationMessage(
          "Координаты получены. Проверка допустимой зоны выполняется Backend."
        );
      },
      (error) => {
        setLocationState("error");
        setCoordinates(null);

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

  function resetScanner() {
    setQrValue("");
    setAttendanceState("idle");
    setAttendanceMessage("");
    setScannerKey((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/student"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Вернуться в личный кабинет
        </Link>

        <header className="mb-8 mt-6">
          <p className="text-sm font-medium text-indigo-600">
            SMART ATTENDANCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Отметка посещения
          </h1>

          <p className="mt-2 text-slate-500">
            Отсканируй QR-код преподавателя и отправь отметку на сервер.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">
            1. Отсканируй QR-код
          </h2>

          {!qrValue && attendanceState !== "success" && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
              <QrScanner key={scannerKey} onScan={handleQrScan} />
            </div>
          )}

          {qrValue && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-800">
                QR-код считан
              </p>

              <p className="mt-2 break-all text-sm text-emerald-700">
                {qrValue}
              </p>
            </div>
          )}

          {qrValue && attendanceState !== "success" && (
            <button
              type="button"
              onClick={submitAttendance}
              disabled={attendanceState === "loading"}
              className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {attendanceState === "loading"
                ? "Отправляем отметку…"
                : "Отправить отметку"}
            </button>
          )}

          {attendanceMessage && (
            <div
              role="status"
              className={`mt-4 rounded-xl p-4 text-sm ${
                attendanceState === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : attendanceState === "error"
                    ? "border border-rose-200 bg-rose-50 text-rose-700"
                    : "border border-indigo-200 bg-indigo-50 text-indigo-700"
              }`}
            >
              {attendanceMessage}
            </div>
          )}

          {(attendanceState === "error" ||
            attendanceState === "success") && (
            <button
              type="button"
              onClick={resetScanner}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              Сканировать ещё раз
            </button>
          )}

          <div className="my-7 border-t border-slate-200" />

          <h2 className="font-semibold">
            2. Разреши определение местоположения
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Координаты определяются по запросу пользователя.
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

          {coordinates && (
            <p className="mt-2 break-all text-xs text-slate-400">
              Координаты получены. Они пока не отправляются на сервер.
            </p>
          )}
        </section>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Успешная отправка отметки означает только создание записи со
          статусом PENDING. Проверки лица, устройства и геолокации
          должны быть выполнены отдельно.
        </div>
      </div>
    </main>
  );
}
