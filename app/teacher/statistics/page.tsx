
import Link from "next/link";
import TeacherStatisticsPanel from "../_components/teacher-statistics";

export default function TeacherStatisticsPage() {
  return (
    <main
      lang="ru"
      className="min-h-screen bg-[#F7F5F8] px-3 py-2 text-[#171717] sm:px-5 sm:py-3"
    >
      <div className="mx-auto min-h-[calc(100vh-24px)] w-full max-w-[1500px] rounded-2xl border border-[#D8D2DD] bg-white p-4 shadow-[0_4px_24px_rgba(45,30,55,0.04)] sm:p-5 lg:p-6">
        <Link
          href="/teacher"
          className="inline-flex min-h-8 items-center text-sm font-semibold text-[#9563B7] transition-colors hover:text-[#78479B]"
        >
          ← В кабинет преподавателя
        </Link>

        <header className="relative mt-2 overflow-hidden border-b border-[#E5DFE9] pb-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-5 -top-12 h-36 w-36 rounded-full bg-[#F8F5FA]"
          />

          <div className="relative">
            <div className="text-[clamp(28px,3vw,38px)] font-black leading-[0.86] tracking-[-0.075em] text-black">
              SMART
              <br />
              ATTENDANCE
            </div>

            <div className="mt-2 h-[3px] w-[46px] bg-[#B58AD5]" />
            <p className="mt-1.5 text-[8px] font-semibold tracking-[0.17em] text-[#8A8490]">
              STUDENT ATTENDANCE SYSTEM
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[1320px] pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A078BD]">
              Аналитика
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              Статистика
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm leading-5 text-[#68636E]">
              Результаты ваших завершённых занятий. Дата и время показаны по
              часовому поясу устройства.
            </p>
          </div>

          <TeacherStatisticsPanel />
        </div>
      </div>
    </main>
  );
}
