import { Suspense } from "react";
import LessonBrowser from "../../_components/lesson-browser";

type Props = { params: Promise<{ id: string }> };
async function LessonContent({ params }: Props) {
  const { id } = await params;
  return <LessonBrowser key={id} lessonId={id} />;
}
export default function TeacherLessonPage({ params }: Props) {
  return <Suspense fallback={<p role="status" className="p-6">Загружаем занятие…</p>}>
    <LessonContent params={params} />
  </Suspense>;
}
