import Link from "next/link";

export default function TeacherPage() {
  return (
    <main
      lang="ru"
      className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-blue-700">
          Smart Attendance
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Кабинет преподавателя
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          Ваши занятия, посещаемость студентов
          и отметки, требующие проверки.
        </p>

        <nav aria-label="Разделы кабинета" className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/teacher/lessons"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Мои занятия
          </Link>
          <Link href="/teacher/statistics" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50">
            Статистика
          </Link>
        </nav>
      </div>
    </main>
  );
}
