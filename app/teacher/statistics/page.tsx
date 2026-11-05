import Link from "next/link";
import TeacherStatisticsPanel from "../_components/teacher-statistics";

export default function TeacherStatisticsPage() {
  return <main lang="ru" className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
    <div className="mx-auto max-w-5xl">
      <Link href="/teacher" className="font-semibold text-blue-700 hover:underline">← В кабинет преподавателя</Link>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Статистика</h1>
      <p className="mt-4 leading-7 text-slate-600">Результаты ваших завершённых занятий. Дата и время показаны по часовому поясу устройства.</p>
      <TeacherStatisticsPanel />
    </div>
  </main>;
}
