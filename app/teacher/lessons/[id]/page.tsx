import Link from "next/link";
import { notFound } from "next/navigation";
import { mockLessons } from "../mock-lessons";

export const instant = false;

const statusLabels = {
  planned: "Запланировано",
  active: "Идёт занятие",
  completed: "Завершено",
};

export function generateStaticParams() {
  return mockLessons.map((lesson) => ({
    id: lesson.id,
  }));
}

export default async function TeacherLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = mockLessons.find((item) => item.id === id);

  if (!lesson) {
    notFound();
  }

  return (
    <main
      lang="ru"
      className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/teacher/lessons"
          className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline"
        >
          ← К списку занятий
        </Link>

        <h1 className="mt-6 break-words text-3xl font-bold sm:text-4xl">
          {lesson.subject}
        </h1>

        <p className="mt-3 font-semibold text-blue-700">
          {statusLabels[lesson.status]}
        </p>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">
            Демонстрационные данные
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Это вымышленное занятие. Управление занятием
            и получение данных с Backend пока не подключены.
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold">
            Сведения о занятии
          </h2>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Группа</dt>
              <dd className="mt-1 font-medium">{lesson.group}</dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Аудитория</dt>
              <dd className="mt-1 font-medium">{lesson.classroom}</dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Дата</dt>
              <dd className="mt-1 font-medium">{lesson.date}</dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Время</dt>
              <dd className="mt-1 font-medium">
                {lesson.startTime}–{lesson.endTime}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}