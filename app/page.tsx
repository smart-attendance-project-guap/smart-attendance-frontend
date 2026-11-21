
import Link from "next/link";

function FeatureIcon({ type }: { type: number }) {
  const common = {
    width: 25,
    height: 25,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === 0) {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6" height="6" />
        <rect x="14" y="4" width="6" height="6" />
        <rect x="4" y="14" width="6" height="6" />
        <path d="M14 14h2v2h-2zM18 14v2M14 18h2M18 18h2v2" />
      </svg>
    );
  }

  if (type === 1) {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === 2) {
    return (
      <svg {...common}>
        <path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m3 17 6-6 4 3 8-9" />
      <path d="M15 5h6v6" />
    </svg>
  );
}

const features = [
  ["Отметка", "по QR-коду"],
  ["Проверка", "геолокации"],
  ["Защита", "от подмены"],
  ["Статистика", "и отчёты"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F5F8] px-3 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-[1100px] rounded-[16px] border border-[#D8D2DD] bg-[#FCFBFD] p-3 sm:p-4 lg:p-5">
        <header className="flex items-center justify-between gap-4 px-2 pb-4 sm:px-4">
          <Link href="/" className="text-base font-bold leading-4 tracking-tight">
            [ SMART
            <br />
            &nbsp; ATTENDANCE ]
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/role"
              className="rounded-md border border-[#D8D2DD] px-4 py-2.5 text-sm transition hover:bg-[#F0E9F6]"
            >
              Войти
            </Link>
            <Link
              href="/student/register"
              className="rounded-md bg-[#222222] px-4 py-2.5 text-sm text-white transition hover:bg-[#383838]"
            >
              Регистрация
            </Link>
          </div>
        </header>

        <section className="relative h-[210px] overflow-hidden rounded-[12px] border border-[#D8D2DD] bg-[#C9C7CA] sm:h-[260px] lg:h-[300px]">
          <svg
            viewBox="0 0 1400 420"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Современное учебное здание"
          >
            <defs>
              <linearGradient id="building" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e9e7e9" />
                <stop offset="1" stopColor="#99979b" />
              </linearGradient>
            </defs>
            <rect width="1400" height="420" fill="url(#building)" />
            <path d="M200 420 520 0h880v420Z" fill="#c5c3c6" />
            <path d="M0 420 420 0h180L320 420Z" fill="#e4e2e4" />
            {Array.from({ length: 15 }, (_, i) => (
              <path
                key={`v${i}`}
                d={`M${470 + i * 68} 0 L${300 + i * 78} 420`}
                stroke="#777579"
                strokeWidth="2"
                opacity=".5"
              />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={`h${i}`}
                d={`M${400 - i * 25} ${i * 55} H1400`}
                stroke="#858387"
                strokeWidth="2"
                opacity=".35"
              />
            ))}
            <path d="M470 0 220 420h60L540 0Z" fill="#777579" opacity=".6" />
            <path d="M620 0 400 420h48L670 0Z" fill="#777579" opacity=".5" />
            <path
              d="M-100 420 C100 80 300 80 500 420"
              stroke="#DCC3FA"
              strokeWidth="55"
              fill="none"
            />
            <path
              d="M850 420 C1050 50 1250 50 1500 350"
              stroke="#DCC3FA"
              strokeWidth="55"
              fill="none"
            />
          </svg>
        </section>

        <section className="grid gap-5 py-7 sm:grid-cols-[1.1fr_1fr] sm:items-center sm:py-8">
          <h1 className="text-[48px] font-bold leading-[0.92] tracking-tight sm:text-[64px] lg:text-[72px]">
            Smart
            <br />
            Attendance
          </h1>

          <p className="border-l-0 border-[#D8D2DD] pl-0 text-base leading-6 sm:border-l sm:pl-7">
            Система автоматизированного учёта посещаемости студентов
            в учебных заведениях.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {features.map(([title, subtitle], index) => (
            <article
              key={title}
              className="flex min-h-[115px] flex-col justify-between rounded-[10px] border border-[#D8D2DD] bg-[#FCFBFD] p-4 sm:min-h-[135px] sm:p-5"
            >
              <FeatureIcon type={index} />
              <p className="text-sm leading-5 sm:text-base">
                {title}
                <br />
                {subtitle}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
