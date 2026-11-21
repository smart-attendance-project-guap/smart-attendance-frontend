
import Link from "next/link";

function StudentIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 11 14-7 14 7-14 7L2 11Z" />
      <path d="M8 14v7c5 4 11 4 16 0v-7" />
      <path d="M30 11v9" />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="16" cy="9" r="5" />
      <path d="M6 27c0-6 4-10 10-10s10 4 10 10" />
    </svg>
  );
}

export default function RolePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F5F8] px-4 py-6">
      <section className="flex min-h-[440px] w-full max-w-[540px] flex-col rounded-[16px] border border-[#D8D2DD] bg-[#FCFBFD] px-6 py-8 sm:px-10 sm:py-9">
        <Link href="/" className="self-center text-center text-sm font-bold leading-4">
          [ SMART
          <br />
          &nbsp; ATTENDANCE ]
        </Link>

        <h1 className="mt-10 text-center text-[28px] font-bold leading-9">
          Выберите роль
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href="/student/login"
            className="flex min-h-[125px] flex-col justify-between rounded-[10px] border border-[#D8D2DD] bg-[#E2CFF7] p-4 transition hover:bg-[#D8C2F0] sm:min-h-[145px] sm:p-5"
          >
            <StudentIcon />
            <span className="text-base font-semibold sm:text-lg">Студент</span>
            <span className="self-end text-2xl">→</span>
          </Link>

          <Link
            href="/teacher-login"
            className="flex min-h-[125px] flex-col justify-between rounded-[10px] border border-[#D8D2DD] bg-[#FCFBFD] p-4 transition hover:bg-[#F0E9F6] sm:min-h-[145px] sm:p-5"
          >
            <TeacherIcon />
            <span className="text-base font-semibold sm:text-lg">Преподаватель</span>
            <span className="self-end text-2xl">→</span>
          </Link>
        </div>

        <Link
          href="/"
          className="mt-7 self-center text-sm text-[#68636E] hover:text-[#171717]"
        >
          ← Вернуться на главную
        </Link>
      </section>
    </main>
  );
}
