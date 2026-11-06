
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  API_URL,
  getStudentToken,
  getStudentUser,
  verifyStudent,
  clearStudentToken,
  type StudentUser,
} from "./_lib/auth";

type AttendanceStats = {
  totalLessons: number;
  attendedLessons: number;
  missedLessons: number;
  rejectedLessons: number;
  attendancePercentage: number;
};

export default function StudentPage() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        const authorized = await verifyStudent(controller.signal);

        if (!authorized) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        setUser(getStudentUser());

        const token = getStudentToken();

        const response = await fetch(`${API_URL}/api/attendance/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          if (data.message === "Student is not assigned to a group") {
            throw new Error(
              "Ваш аккаунт пока не привязан к учебной группе. Обратитесь к администратору."
            );
          }

          throw new Error(
            "Не удалось загрузить статистику. Попробуйте позже."
          );
        }

        setStats(data);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Не удалось загрузить статистику."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => controller.abort();
  }, []);

  function handleLogout() {
    clearStudentToken();
    window.location.replace("/student/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              SMART ATTENDANCE
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Личный кабинет
            </h1>

            <p className="mt-2 text-slate-500">
              Добро пожаловать,{" "}
              {user
                ? `${user.firstName} ${user.lastName}`
                : "студент"}
              !
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="w-fit rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
              Студент
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Выйти
            </button>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Загружаем статистику…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-6 text-red-700"
          >
            {error}
          </div>
        ) : stats ? (
          <>
            <section className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white sm:p-8">
              <p className="text-sm text-indigo-100">
                Общая посещаемость
              </p>

              <p className="mt-3 text-5xl font-bold">
                {stats.attendancePercentage}%
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-indigo-400">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, stats.attendancePercentage)
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-indigo-100">
                Всего завершённых занятий: {stats.totalLessons}
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">
                  Посещено занятий
                </p>

                <p className="mt-3 text-4xl font-bold text-emerald-600">
                  {stats.attendedLessons}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">
                  Пропущено занятий
                </p>

                <p className="mt-3 text-4xl font-bold text-rose-600">
                  {stats.missedLessons}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">
                  Отклонённые отметки
                </p>

                <p className="mt-3 text-4xl font-bold text-amber-600">
                  {stats.rejectedLessons}
                </p>
              </article>
            </section>
          </>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/student/attendance"
            className="rounded-2xl bg-slate-900 p-5 text-white transition hover:bg-slate-700"
          >
            <h2 className="font-semibold">
              Отметить посещение
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Перейти к отметке по QR-коду
            </p>
          </Link>

          <Link
            href="/student/history"
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-100"
          >
            <h2 className="font-semibold">
              История посещаемости
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Посмотреть посещённые и пропущенные занятия
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
