"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  role: "student" | "teacher";
};

const navigation = [
  { label: "Главная", href: "/teacher", icon: "home" },
  { label: "Занятия", href: "/teacher/lessons", icon: "calendar" },
  { label: "Статистика", href: "/teacher/statistics", icon: "chart" },
];

function NavigationIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
          <path d="M8 14h3M8 17h5" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 3 6-7" />
        </svg>
      );

    default:
      return null;
  }
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  if (role === "student") {
    return null;
  }

  return (
    <aside className="z-20 flex w-full shrink-0 flex-col border-b border-[#D8D2DD] bg-[#F1EFF2] px-6 py-7 md:sticky md:top-0 md:min-h-screen md:w-[270px] md:border-b-0 md:border-r md:px-7 md:py-10">
      <Link href="/" className="group mb-8 block">
        <span className="block text-[30px] font-black leading-[0.94] tracking-[-1.8px] text-[#171717] transition-colors group-hover:text-[#8052AE] md:text-[35px]">
          SMART
          <br />
          ATTENDANCE
        </span>

        <span className="mt-3 block h-[3px] w-12 rounded-full bg-[#B99BD8]" />
      </Link>

      <nav className="flex flex-wrap gap-2 md:flex-col">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/teacher" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-[50px] items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-all ${
                active
                  ? "border border-[#DCC8EF] bg-[#E8DCF4] font-semibold text-[#30233D]"
                  : "border border-transparent text-[#68636E] hover:border-[#E7DFEC] hover:bg-[#F5F1F8] hover:text-[#171717]"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  active
                    ? "bg-white/65 text-[#8052AE]"
                    : "bg-[#E8E5E9] text-[#77717D] group-hover:text-[#8052AE]"
                }`}
              >
                <NavigationIcon name={item.icon} />
              </span>

              <span>{item.label}</span>

              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A77BD1]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-[#D8D2DD] pt-5 md:block">
        <p className="text-[10px] font-bold tracking-[0.14em] text-[#85808A]">
          ATTENDANCE SYSTEM
        </p>
        <p className="mt-1 text-xs text-[#A09AA5]">
          Система учёта посещаемости
        </p>
      </div>
    </aside>
  );
}