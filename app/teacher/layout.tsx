import type { ReactNode } from "react";
import Link from "next/link";
import TeacherSession from "./_components/teacher-session";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <TeacherSession>
      <nav
        aria-label="Навигация преподавателя"
        className="sticky top-0 z-40 border-b border-[#E5DFE9] bg-white px-3 py-2 sm:px-5"
      >
        <div className="mx-auto flex w-full max-w-[1500px] justify-end">
          <Link
            href="/teacher"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D8D2DD] bg-[#FAF8FC] px-4 py-2 text-sm font-semibold text-[#78479B] transition-colors hover:bg-[#F0E7F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9563B7]"
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
            </svg>
            Мой кабинет
          </Link>
        </div>
      </nav>
      {children}
    </TeacherSession>
  );
}
