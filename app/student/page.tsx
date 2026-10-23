
const attendance = {
  attended: 24,
  missed: 3,
};

export default function StudentPage() {
  const total = attendance.attended + attendance.missed;
  const percentage = Math.round((attendance.attended / total) * 100);

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
              Добро пожаловать!
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
            Студент
          </span>
        </header>

        <section className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white sm:p-8">
          <p className="text-sm text-indigo-100">
            Общая посещаемость
          </p>
          <p className="mt-3 text-5xl font-bold">
            {percentage}%
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-indigo-400">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-indigo-100">
            Демонстрационные данные
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Посещено занятий
            </p>
            <p className="mt-3 text-4xl font-bold text-emerald-600">
              {attendance.attended}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Пропущено занятий
            </p>
            <p className="mt-3 text-4xl font-bold text-rose-600">
              {attendance.missed}
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Посещаемость
          </h2>
          <p className="mt-2 text-slate-500">
            Здесь будет история посещений после подключения Backend.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <a
            href="/student/attendance"
            className="rounded-2xl bg-slate-900 p-5 text-white transition hover:bg-slate-700"
          >
            <h2 className="font-semibold">Отметить посещение</h2>
            <p className="mt-2 text-sm text-slate-300">
              Перейти к отметке по QR-коду
            </p>
          </a>

          <a
            href="/student/history"
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:bg-slate-100"
          >
            <h2 className="font-semibold">История посещаемости</h2>
            <p className="mt-2 text-sm text-slate-500">
              Посмотреть посещённые и пропущенные занятия
            </p>
          </a>
        </section>
      </div>
    </main>
  );
}
