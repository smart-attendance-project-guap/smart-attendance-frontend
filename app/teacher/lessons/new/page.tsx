import Link from "next/link";

// Временные варианты для проверки интерфейса.
// Позже списки будут приходить из Backend.
const mockGroups = ["Тестовая группа 1", "Тестовая группа 2"];
const mockClassrooms = ["101", "205", "312"];

export default function NewTeacherLessonPage() {
  return (
    <main
      lang="ru"
      className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900"
    >
      <div className="mx-auto max-w-2xl">
        <Link
          href="/teacher/lessons"
          className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline"
        >
          ← К списку занятий
        </Link>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          Начать занятие
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Укажите дисциплину, группу и аудиторию.
        </p>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">
            Демонстрационный интерфейс
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Группы и аудитории вымышлены. Начало занятия
            через Backend пока не подключено.
          </p>
        </div>

        <form className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-semibold"
            >
              Дисциплина
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="Например, Базы данных"
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-blue-700 focus:outline-2 focus:outline-blue-700"
            />
          </div>

          <div>
            <label
              htmlFor="group"
              className="block text-sm font-semibold"
            >
              Группа
            </label>
            <select
              id="group"
              name="group"
              required
              defaultValue=""
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-blue-700 focus:outline-2 focus:outline-blue-700"
            >
              <option value="" disabled>
                Выберите группу
              </option>
              {mockGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="classroom"
              className="block text-sm font-semibold"
            >
              Аудитория
            </label>
            <select
              id="classroom"
              name="classroom"
              required
              defaultValue=""
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base focus:border-blue-700 focus:outline-2 focus:outline-blue-700"
            >
              <option value="" disabled>
                Выберите аудиторию
              </option>
              {mockClassrooms.map((classroom) => (
                <option key={classroom} value={classroom}>
                  {classroom}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled
            className="min-h-11 w-full rounded-lg bg-slate-200 px-5 py-3 font-semibold text-slate-500 disabled:cursor-not-allowed"
          >
            Начало занятия пока недоступно
          </button>
        </form>
      </div>
    </main>
  );
}