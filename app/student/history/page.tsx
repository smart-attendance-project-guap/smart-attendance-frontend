
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  API_URL,
  getStudentToken,
  getStudentUser,
  verifyStudent,
  clearStudentToken,
} from "../_lib/auth";

type Group = {
  id: number;
  name: string;
};

type Attendance = {
  id: number;
  status: string;
  markedAt: string;
  rejectionReason?: string | null;
  lesson: {
    id: number;
    title?: string;
    subject?: string;
    name?: string;
    discipline?: string;
    startsAt?: string;
    date?: string;
    startTime?: string;
    group?: {
      name?: string;
    } | null;
    classroom?: {
      name?: string;
    } | null;
  };
};

const statusLabels: Record<string, string> = {
  PRESENT: "Посещение засчитано",
  LATE: "Опоздание",
  REJECTED: "Отметка отклонена",
  PENDING: "Ожидает подтверждения",
};

const statusStyles: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  LATE: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  PENDING: "bg-indigo-100 text-indigo-700",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Дата не указана";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentHistoryPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        const authorized = await verifyStudent(controller.signal);

        if (!authorized) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const user = getStudentUser();

        if (user?.groupId) {
          try {
            const groupsResponse = await fetch(
              `${API_URL}/api/registration/groups`,
              {
                cache: "no-store",
                signal: controller.signal,
              }
            );

            if (groupsResponse.ok) {
              const groupsData = await groupsResponse.json();
              const groups: Group[] = groupsData.groups || [];

              const studentGroup = groups.find(
                (group) => group.id === user.groupId
              );

              setGroupName(studentGroup?.name || "");
            }
          } catch (cause) {
            if (
              cause instanceof DOMException &&
              cause.name === "AbortError"
            ) {
              return;
            }
          }
        }

        const token = getStudentToken();

        const response = await fetch(
          `${API_URL}/api/attendance/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (response.status === 401 || response.status === 403) {
          clearStudentToken();
          window.location.replace("/student/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Не удалось загрузить историю посещаемости."
          );
        }

        setAttendances(
          Array.isArray(data.attendances) ? data.attendances : []
        );
      } catch (cause) {
        if (
          cause instanceof DOMException &&
          cause.name === "AbortError"
        ) {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Не удалось загрузить историю посещаемости."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
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
            История посещаемости
          </h1>

          <p className="mt-2 text-slate-500">
            Список занятий и результаты отметок.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-2">
            <span className="text-sm text-slate-500">
              Учебная группа
            </span>
            <span className="text-sm font-semibold text-indigo-700">
              {groupName || "Не указана"}
            </span>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Загружаем историю посещаемости…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
          </div>
        ) : attendances.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold">
              История пока пуста
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Здесь появятся занятия после отметки посещаемости.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {attendances.map((attendance) => {
              const lesson = attendance.lesson;

              const subject =
                lesson.discipline ||
                lesson.title ||
                lesson.subject ||
                lesson.name ||
                "Учебное занятие";

              const dateValue =
                lesson.startsAt || lesson.date || attendance.markedAt;

              return (
                <article
                  key={attendance.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {subject}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Дата занятия: {formatDate(dateValue)}
                        {lesson.startsAt &&
                          ` · ${formatTime(lesson.startsAt)}`}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Время отметки: {formatDate(attendance.markedAt)}
                        {` · ${formatTime(attendance.markedAt)}`}
                      </p>

                      {lesson.classroom?.name && (
                        <p className="mt-2 text-sm text-slate-500">
                          Аудитория: {lesson.classroom.name}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-slate-500">
                        Группа: {lesson.group?.name || groupName || "Не указана"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-sm font-medium ${
                        statusStyles[attendance.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {statusLabels[attendance.status] ||
                        attendance.status}
                    </span>
                  </div>

                  {attendance.status === "REJECTED" &&
                    attendance.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                        <span className="font-semibold">
                          Причина отказа:{" "}
                        </span>
                        {attendance.rejectionReason}
                      </div>
                    )}
                </article>
              );
            })}
          </section>
        )}

        {!loading && !error && attendances.length > 0 && (
          <p className="mt-6 text-sm text-slate-500">
            Всего записей: {attendances.length}
          </p>
        )}
      </div>
    </main>
  );
}
