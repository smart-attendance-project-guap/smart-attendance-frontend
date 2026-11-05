import type { ReactNode } from "react";
import TeacherSession from "./_components/teacher-session";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <TeacherSession>{children}</TeacherSession>;
}
