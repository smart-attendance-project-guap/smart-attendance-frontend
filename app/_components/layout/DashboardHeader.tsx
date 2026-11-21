import type { ReactNode } from "react";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function DashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#D8D2DD] bg-[#FCFBFD] px-5 py-3 md:px-8">
      <div>
        <h1 className="text-[28px] font-bold leading-[34px] text-[#171717]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm leading-5 text-[#68636E]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
