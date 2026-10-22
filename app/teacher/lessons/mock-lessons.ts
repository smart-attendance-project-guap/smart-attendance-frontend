// Демонстрационные данные для разработки интерфейса.
// Это не данные Backend и не согласованный формат API.

export type LessonStatus = "planned" | "active" | "completed";

export type TeacherLesson = {
  id: string;
  subject: string;
  group: string;
  classroom: string;
  date: string;
  startTime: string;
  endTime: string;
  status: LessonStatus;
};

export const mockLessons: TeacherLesson[] = [
  {
    id: "demo-1",
    subject: "Базы данных",
    group: "Тестовая группа 1",
    classroom: "101",
    date: "23.10.2026",
    startTime: "09:00",
    endTime: "10:30",
    status: "completed",
  },
  {
    id: "demo-2",
    subject: "Программирование",
    group: "Тестовая группа 2",
    classroom: "205",
    date: "23.10.2026",
    startTime: "10:40",
    endTime: "12:10",
    status: "active",
  },
  {
    id: "demo-3",
    subject: "Информационные системы",
    group: "Тестовая группа 1",
    classroom: "312",
    date: "23.10.2026",
    startTime: "12:20",
    endTime: "13:50",
    status: "planned",
  },
];