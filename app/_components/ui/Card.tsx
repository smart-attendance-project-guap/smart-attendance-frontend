import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-xl border border-[#D8D2DD] bg-[#FCFBFD] p-5 ${className}`}
    >
      {children}
    </div>
  );
}
