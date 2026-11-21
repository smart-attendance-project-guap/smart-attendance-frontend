import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#222222] text-white border-[#222222] hover:bg-[#383838]",
    secondary: "bg-[#E2CFF7] text-[#171717] border-[#E2CFF7] hover:bg-[#D8C2F0]",
    outline: "bg-transparent text-[#171717] border-[#D8D2DD] hover:bg-[#F0E9F6]",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-[6px] border px-5 py-2 text-sm font-semibold leading-5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
