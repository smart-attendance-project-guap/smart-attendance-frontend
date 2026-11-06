import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center">

        <div className="mb-16 text-center">
          <p className="font-semibold tracking-widest text-indigo-600">
            SMART ATTENDANCE
          </p>

          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
            Контроль посещаемости
          </h1>

          <p className="mt-4 text-lg text-slate-500">
            Единая система учёта посещаемости учебных занятий
          </p>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-2">

          <Link
            href="/student/login"
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🎓</div>

            <h2 className="mt-6 text-2xl font-bold">
              Кабинет студента
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              Отметка посещения по QR-коду,
              история занятий и статистика посещаемости.
            </p>

            <div className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white">
              Войти как студент →
            </div>
          </Link>

          <Link
            href="/teacher-login"
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">👩‍🏫</div>

            <h2 className="mt-6 text-2xl font-bold">
              Кабинет преподавателя
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              Создание занятий, генерация QR-кодов,
              управление посещаемостью и статистика.
            </p>

            <div className="mt-8 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white">
              Войти как преподаватель →
            </div>
          </Link>

        </div>

        <p className="mt-16 text-sm text-slate-400">
          Smart Attendance · Учебный проект
        </p>

      </div>
    </main>
  );
}