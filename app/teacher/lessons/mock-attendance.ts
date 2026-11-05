// Вымышленные данные для разработки интерфейса.
// Это не данные Backend и не согласованный формат API.
// Демонстрационные отметки относятся только к занятию demo-2.

export type AttendanceStatus = "present" | "late" | "absent";

export type TeacherAttendance = {
  id: string;
  lessonId: string;
  studentName: string;
  status: AttendanceStatus;
  markedAt: string | null;
  reviewReasons: string[];
};

export const mockAttendance: TeacherAttendance[] = [
  {
    id: "attendance-demo-1",
    lessonId: "demo-2",
    studentName: "Тестовый студент 1",
    status: "present",
    markedAt: "10:42",
    reviewReasons: [],
  },
  {
    id: "attendance-demo-2",
    lessonId: "demo-2",
    studentName: "Тестовый студент 2",
    status: "late",
    markedAt: "11:00",
    reviewReasons: [],
  },
  {
    id: "attendance-demo-3",
    lessonId: "demo-2",
    studentName: "Тестовый студент 3",
    status: "absent",
    markedAt: null,
    reviewReasons: [],
  },
  {
    id: "attendance-demo-4",
    lessonId: "demo-2",
    studentName: "Тестовый студент 4",
    status: "present",
    markedAt: "10:45",
    reviewReasons: ["Неизвестное устройство"],
  },
  {
    id: "attendance-demo-5",
    lessonId: "demo-2",
    studentName: "Тестовый студент 5",
    status: "late",
    markedAt: "11:05",
    reviewReasons: ["Несовпадение лица", "Вне допустимой зоны"],
  },
];