
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Attendance — Система контроля посещаемости",
  description:
    "Система автоматизированного контроля посещаемости студентов Smart Attendance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
