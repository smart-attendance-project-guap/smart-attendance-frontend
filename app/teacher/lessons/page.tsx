import Link from "next/link";
import { mockLessons } from "./mock-lessons";

const statusLabels = {
  planned: "Запланировано",
  active: "Идёт занятие",
  completed: "Завершено",
};

const statusStyles = {
  planned: "bg-blue-50 text-blue-800",
  active: "bg-green-50 text-green-800",
  completed: "bg-slate-100 text-slate-700",
};

export default function TeacherLessonsPage() {
  return (
    <main
      lang="ru"
      className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/teacher"
          className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline"
        >
          ← В кабинет преподавателя
        </Link>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          Мои занятия
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Группы, аудитории и состояние ваших занятий.
        </p>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">
            Демонстрационные данные
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Все занятия ниже вымышлены. Подключение к Backend
            пока не реализовано.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/teacher/lessons/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Начать занятие
          </Link>
        </div>
        
        <ul className="mt-8 space-y-4">
          {mockLessons.map((lesson) => (
            <li
              key={lesson.id}
              className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="min-w-0 break-words text-xl font-semibold">
                  {lesson.subject}
                </h2>

                <span
                  className={`self-start rounded-full px-3 py-1 text-sm font-medium ${statusStyles[lesson.status]}`}
                >
                  {statusLabels[lesson.status]}
                </span>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Группа</dt>
                  <dd className="mt-1 font-medium">{lesson.group}</dd>
                </div>

                <div>
                  <dt className="text-slate-500">Аудитория</dt>
                  <dd className="mt-1 font-medium">{lesson.classroom}</dd>
                </div>

                <div>
                  <dt className="text-slate-500">Дата</dt>
                  <dd className="mt-1 font-medium">{lesson.date}</dd>
                </div>

                <div>
                  <dt className="text-slate-500">Время</dt>
                  <dd className="mt-1 font-medium">
                    {lesson.startTime}–{lesson.endTime}
                  </dd>
                </div>
              </dl>
              <Link
  href={`/teacher/lessons/${lesson.id}`}
  className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
>
  Открыть занятие
</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}