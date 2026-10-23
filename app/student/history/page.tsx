
const history = [
  {
    id: 1,
    subject: "История России",
    date: "20 октября 2026",
    time: "09:00",
    status: "PRESENT",
  },
  {
    id: 2,
    subject: "Алгоритмы и структуры данных",
    date: "19 октября 2026",
    time: "11:30",
    status: "LATE",
  },
  {
    id: 3,
    subject: "Физика",
    date: "17 октября 2026",
    time: "13:20",
    status: "REJECTED",
    reason: "Демонстрационная причина: отметка отклонена сервером.",
  },
  {
    id: 4,
    subject: "Математический анализ",
    date: "15 октября 2026",
    time: "09:00",
    status: "PRESENT",
  },
];

const statusLabels: Record<string, string> = {
  PRESENT: "Посещение засчитано",
  LATE: "Опоздание",
  REJECTED: "Отметка отклонена",
};

const statusStyles: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  LATE: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export default function StudentHistoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
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
            История посещаемости
          </h1>
          <p className="mt-2 text-slate-500">
            Список занятий и результаты отметок.
          </p>
        </header>

        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Демонстрационные данные. История ещё не загружается из Backend.
        </div>

        <section className="space-y-4">
          {history.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {lesson.subject}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {lesson.date} · {lesson.time}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-sm font-medium ${
                    statusStyles[lesson.status]
                  }`}
                >
                  {statusLabels[lesson.status]}
                </span>
              </div>

              {lesson.status === "REJECTED" && lesson.reason && (
                <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  <span className="font-semibold">Причина отказа: </span>
                  {lesson.reason}
                </div>
              )}
            </article>
          ))}
        </section>

        <p className="mt-6 text-sm text-slate-500">
          Всего демонстрационных записей: {history.length}
        </p>
      </div>
    </main>
  );
}
