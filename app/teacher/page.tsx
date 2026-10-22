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
          Здесь будут ваши занятия, посещаемость студентов
          и отметки, требующие проверки.
        </p>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">
            Демонстрационный интерфейс
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Подключение к Backend и проверка роли преподавателя
            пока не реализованы. Реальные данные не используются.
          </p>
        </div>
      </div>
    </main>
  );
}