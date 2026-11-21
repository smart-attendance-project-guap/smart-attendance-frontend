type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "PENDING"
  | "REJECTED"
  | "MISSED";

const statusStyles: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[#E5F2E8] text-[#28643A]",
  LATE: "bg-[#FFF0D8] text-[#885A13]",
  PENDING: "bg-[#F0E9F6] text-[#685080]",
  REJECTED: "bg-[#FBE7E7] text-[#A13D3D]",
  MISSED: "bg-[#ECEAEC] text-[#68636E]",
};

const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Присутствовал",
  LATE: "Опоздание",
  PENDING: "На проверке",
  REJECTED: "Отклонено",
  MISSED: "Пропуск",
};

export default function StatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
