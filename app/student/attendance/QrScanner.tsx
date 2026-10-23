
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

type QrScannerProps = {
  onScan: (value: string) => void;
};

export default function QrScanner({ onScan }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      const scanner = new Html5Qrcode("student-qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      try {
        const cameras = await Html5Qrcode.getCameras();

        if (cancelled) return;

        if (cameras.length === 0) {
          setError("Камера не найдена. Проверь подключение камеры.");
          setStarting(false);
          return;
        }

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (cancelled) return;

            onScan(decodedText);
            void stopScanner();
          },
          () => {
            // QR-код ещё не найден — продолжаем сканирование.
          }
        );

        if (cancelled) {
          await scanner.stop().catch(() => undefined);
          return;
        }

        startedRef.current = true;
        setStarting(false);
      } catch {
        if (!cancelled) {
          setError(
            "Не удалось запустить камеру. Проверь разрешение браузера и попробуй ещё раз."
          );
          setStarting(false);
        }
      }
    }

    async function stopScanner() {
      const scanner = scannerRef.current;

      if (scanner && startedRef.current) {
        startedRef.current = false;

        try {
          await scanner.stop();
        } catch {
          // Камера могла остановиться самостоятельно.
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [onScan]);

  return (
    <div>
      <div
        id="student-qr-reader"
        className="w-full overflow-hidden rounded-xl"
      />

      {starting && (
        <p className="mt-3 text-sm text-slate-500">
          Подключаем камеру…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
