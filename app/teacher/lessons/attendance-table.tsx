import type { TeacherAttendance } from "./mock-attendance";

const statusLabels = {
  present: "Присутствует",
  late: "Опоздал",
  absent: "Отсутствует",
};

const statusStyles = {
  present: "bg-green-50 text-green-800",
  late: "bg-amber-50 text-amber-800",
  absent: "bg-slate-100 text-slate-700",
};

type AttendanceTableProps = {
  attendance: TeacherAttendance[];
};

export default function AttendanceTable({
  attendance,
}: AttendanceTableProps) {
  if (attendance.length === 0) {
    return (
      <p className="mt-5 text-sm text-slate-600">
        Для этого занятия демонстрационные данные посещаемости
        не подготовлены.
      </p>
    );
  }

  return (
    <div
      className="mt-5 overflow-x-auto rounded-lg border border-slate-200 focus-visible:outline-2 focus-visible:outline-blue-700"
      role="region"
      aria-label="Таблица посещаемости с горизонтальной прокруткой"
      tabIndex={0}
    >
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">
          Демонстрационная посещаемость выбранного занятия
        </caption>

        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3">
              Студент
            </th>
            <th scope="col" className="px-4 py-3">
              Статус
            </th>
            <th scope="col" className="px-4 py-3">
              Время отметки
            </th>
            <th scope="col" className="px-4 py-3">
              Проверка отметки
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {attendance.map((item) => (
            <tr key={item.id} className="align-top">
              <th
                scope="row"
                className="px-4 py-4 font-medium text-slate-900"
              >
                {item.studentName}
              </th>

              <td className="px-4 py-4">
                <span
                  className={`inline-block whitespace-nowrap rounded-full px-3 py-1 font-medium ${statusStyles[item.status]}`}
                >
                  {statusLabels[item.status]}
                </span>
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {item.markedAt ?? "Нет отметки"}
              </td>

              <td className="px-4 py-4">
                {item.reviewReasons.length > 0 ? (
                  <div>
                    <p className="font-semibold text-amber-800">
                      Требует проверки
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                      {item.reviewReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <span className="text-slate-500">
                    {item.markedAt === null
                      ? "Нет отметки для проверки"
                      : "Нет замечаний"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}