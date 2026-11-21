
"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import QrScanner from "./QrScanner";
import { markAttendanceByQr } from "./markAttendance";

type LocationState = "idle" | "loading" | "success" | "error";

type QrState = "idle" | "loading" | "pending" | "duplicate" | "error";

function Icon({
  type,
  size = 22,
}: {
  type: "arrow" | "location" | "qr" | "check" | "alert" | "refresh";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "qr":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM20 14v2M14 20h2M20 19v2M18 20h3" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2" />
        </svg>
      );
  }
}

export default function StudentAttendancePage() {
  const [locationState, setLocationState] =
    useState<LocationState>("idle");

  const [locationMessage, setLocationMessage] = useState(
    "Местоположение ещё не запрашивалось."
  );

  const [qrState, setQrState] = useState<QrState>("idle");
  const [qrMessage, setQrMessage] = useState("");
  const scanRequestInProgress = useRef(false);

  const handleQrScan = useCallback(async (value: string) => {
    if (scanRequestInProgress.current) return;

    scanRequestInProgress.current = true;
    setQrState("loading");
    setQrMessage("Проверяем QR-код и отправляем отметку…");

    try {
      const message = await markAttendanceByQr(value);

      setQrState("pending");
      setQrMessage(message);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось отметить посещение.";

      if (message === "Посещение уже было отмечено.") {
        setQrState("duplicate");
      } else {
        setQrState("error");
      }

      setQrMessage(message);
    } finally {
      scanRequestInProgress.current = false;
    }
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

  const locationStatusStyles = {
    idle: "border-[#D8D2DD] bg-[#F8F6F9] text-[#68636E]",
    loading: "border-[#D8C5E8] bg-[#F3ECF8] text-[#8055A4]",
    success: "border-[#C9DCCF] bg-[#F0F7F1] text-[#39734A]",
    error: "border-[#E8CACA] bg-[#FBF1F1] text-[#A54D4D]",
  };

  return (
    <main className="min-h-screen bg-[#F7F5F8] px-3 py-1 text-[#171717] sm:px-5 sm:py-1">
      <div className="mx-auto min-h-[calc(100vh-8px)] w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-3 shadow-[0_2px_12px_rgba(30,25,35,0.025)] sm:p-4 lg:p-5">

        {/* Шапка */}
        <header className="border-b border-[#E5DFE9] pb-3">
          <Link
            href="/student"
            className="mb-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#9668BD] transition hover:text-[#8959B1]"
          >
            <span className="rotate-180">
              <Icon type="arrow" size={16} />
            </span>
            В личный кабинет
          </Link>

          <Link href="/student" className="block w-fit">
            <h1 className="text-[35px] font-black leading-[0.88] tracking-[-0.07em] sm:text-[40px]">
              SMART
              <br />
              ATTENDANCE
            </h1>
          </Link>

          <div className="mt-2 h-[3px] w-[50px] rounded-full bg-[#B58AD5]" />

          <p className="mt-1.5 text-[10px] font-bold tracking-[0.19em] text-[#68636E]">
            STUDENT ATTENDANCE SYSTEM
          </p>
        </header>

        {/* Заголовок страницы */}
        <section className="mb-4 mt-4 sm:mb-5 sm:mt-5">
          <p className="text-[11px] font-bold tracking-[0.16em] text-[#9668BD]">
            ОТМЕТКА ПОСЕЩЕНИЯ
          </p>

          <h2 className="mt-1.5 text-[28px] font-bold leading-tight tracking-[-0.7px] sm:text-[30px]">
            Отметить посещение
          </h2>

          <p className="mt-1.5 max-w-2xl text-[13px] leading-[19px] text-[#68636E] sm:text-[14px]">
            Выполни два шага, чтобы подготовить отметку о посещении занятия:
            отсканируй QR-код преподавателя и разреши определение местоположения.
          </p>
        </section>

        {/* Основные шаги */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-4">

          {/* QR-код */}
          <section className="flex min-w-0 flex-col rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-4 sm:p-5">
            <div className="mb-3 flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEE5F4] text-[#9668BD]">
                <Icon type="qr" size={23} />
              </span>

              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-[#9668BD]">
                  ШАГ 01
                </p>

                <h3 className="mt-0.5 text-[19px] font-bold sm:text-[20px]">
                  Сканирование QR-кода
                </h3>

                <p className="mt-1 text-[12px] leading-[18px] text-[#68636E]">
                  Наведи камеру на QR-код преподавателя.
                </p>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-xl border border-[#D8D2DD] bg-[#F3F0F4] p-3">
              <QrScanner onScan={handleQrScan} />
            </div>

            <p className="mt-3 text-[11px] leading-[17px] text-[#68636E]">
              Разреши доступ к камере, когда браузер запросит его.
              Для сканирования используй камеру устройства.
            </p>

            {qrState !== "idle" && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-3 rounded-xl border p-3.5 ${
                  qrState === "pending"
                    ? "border-[#D8C5E8] bg-[#F3ECF8] text-[#8055A4]"
                    : qrState === "error"
                    ? "border-[#E8CACA] bg-[#FBF1F1] text-[#A54D4D]"
                    : qrState === "duplicate"
                    ? "border-[#D8D2DD] bg-[#F8F6F9] text-[#68636E]"
                    : "border-[#D8C5E8] bg-[#F3ECF8] text-[#8055A4]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {qrState === "loading" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  ) : (
                    <Icon
                      type={qrState === "error" ? "alert" : "check"}
                      size={19}
                    />
                  )}

                  <p className="text-[14px] font-bold">
                    {qrState === "loading"
                      ? "Отправка отметки"
                      : qrState === "pending"
                      ? "Отметка ожидает проверки"
                      : qrState === "duplicate"
                      ? "Отметка уже существует"
                      : "Не удалось отправить отметку"}
                  </p>
                </div>

                <p className="mt-2 text-[12px] leading-5">
                  {qrMessage}
                </p>
              </div>
            )}
          </section>

          {/* Геолокация */}
          <section className="flex min-w-0 flex-col rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-4 sm:p-5">
            <div className="mb-3 flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEE5F4] text-[#9668BD]">
                <Icon type="location" size={23} />
              </span>

              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-[#9668BD]">
                  ШАГ 02
                </p>

                <h3 className="mt-0.5 text-[19px] font-bold sm:text-[20px]">
                  Проверка геолокации
                </h3>

                <p className="mt-1 text-[12px] leading-[18px] text-[#68636E]">
                  Разреши доступ к местоположению устройства.
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#E5DFE9] bg-[#F5F1F7] px-4 py-4 text-center sm:py-5">
              <span className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-white text-[#9668BD] shadow-sm">
                <Icon type="location" size={31} />
              </span>

              <h4 className="mt-3 text-[16px] font-bold">
                Местоположение устройства
              </h4>

              <p className="mt-1.5 max-w-[320px] text-[12px] leading-[18px] text-[#68636E]">
                Координаты будут получены после твоего разрешения.
                Проверку допустимой зоны выполняет сервер.
              </p>

              {locationState !== "success" && (
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locationState === "loading"}
                  className="mt-4 inline-flex min-h-11 w-full max-w-[290px] items-center justify-center gap-3 rounded-lg bg-[#343238] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#29272D] disabled:cursor-wait disabled:opacity-60"
                >
                  {locationState === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Определяем местоположение…
                    </>
                  ) : locationState === "error" ? (
                    <>
                      <Icon type="refresh" size={17} />
                      Повторить запрос
                    </>
                  ) : (
                    <>
                      <Icon type="location" size={17} />
                      Разрешить геолокацию
                    </>
                  )}
                </button>
              )}

              {locationState === "success" && (
                <span className="mt-4 inline-flex min-h-11 w-full max-w-[290px] items-center justify-center gap-2 rounded-lg border border-[#C9DCCF] bg-[#F0F7F1] px-4 text-[13px] font-semibold text-[#39734A]">
                  <Icon type="check" size={18} />
                  Координаты получены
                </span>
              )}
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`mt-3 rounded-lg border p-3 text-[11px] leading-[17px] ${locationStatusStyles[locationState]}`}
            >
              {locationState === "error" && (
                <span className="mr-2 inline-flex align-middle">
                  <Icon type="alert" size={15} />
                </span>
              )}

              {locationMessage}
            </div>
          </section>
        </div>

        {/* Информация */}
        <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-[#E5DFE9] bg-[#F5F2F7] p-3 sm:mt-4 sm:p-3.5">
          <span className="mt-0.5 shrink-0 text-[#9668BD]">
            <Icon type="alert" size={19} />
          </span>

          <div>
            <p className="text-[12px] font-bold text-[#37323B]">
              Важно знать
            </p>

            <p className="mt-1 text-[11px] leading-[17px] text-[#68636E]">
              После сканирования QR-код проверяется сервером.
              При успешной проверке создаётся отметка со статусом PENDING,
              которую должен подтвердить преподаватель.
              Получение геолокации работает, но передача координат на сервер
              и проверка допустимой зоны пока не подключены.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
