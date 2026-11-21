import { useId } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#171717]">
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${inputId}-description` : undefined}
        className={`h-11 w-full rounded-[6px] border bg-[#FCFBFD] px-3 text-sm text-[#171717] outline-none transition focus:border-[#A98ACB] focus:ring-2 focus:ring-[#E2CFF7] placeholder:text-[#99939F] disabled:cursor-not-allowed disabled:bg-[#F0EDF2] ${error ? "border-red-500" : "border-[#D8D2DD]"} ${className}`}
      />
      {(error || helperText) && (
        <p
          id={`${inputId}-description`}
          className={`text-xs leading-[18px] ${error ? "text-red-600" : "text-[#68636E]"}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
