import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type ScheduleRowError = { row: number; message: string };
export class ScheduleImportError extends Error {
  constructor(message: string, public rows: ScheduleRowError[] = []) {
    super(message);
    this.name = "ScheduleImportError";
  }
}

const messages: Record<string, string> = {
  "Provide 1–1000 entries": "В файле должно быть от 1 до 1000 записей.",
  "Entry must be an object": "Запись должна быть объектом JSON.",
  "groups must contain 1–4 existing groups 4514–4517": "Укажите от 1 до 4 существующих групп: 4514–4517.",
  "discipline and classroom are required": "Укажите дисциплину и аудиторию.",
  "Physical education is excluded from attendance tracking": "Физкультура не включается в учёт посещаемости.",
  "teacherName must be nonempty": "Имя преподавателя не должно быть пустым.",
  "Use valid startsAt/endsAt ISO 8601 +03:00; end must follow start": "Проверьте начало и конец пары: формат ISO 8601 с +03:00; конец должен быть позже начала.",
  "teacherEmail must match an existing TEACHER account": "Не найден зарегистрированный преподаватель с указанной почтой.",
  "teacherName has multiple linked accounts; specify teacherEmail": "С именем связаны несколько аккаунтов. Укажите почту преподавателя.",
};

export function prepareSchedule(text: string): string {
  let entries: unknown;
  try { entries = JSON.parse(text.replace(/^\uFEFF/, "")); }
  catch { throw new ScheduleImportError("Не удалось прочитать JSON. Проверьте синтаксис файла."); }
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 1000) {
    throw new ScheduleImportError("Файл должен содержать массив от 1 до 1000 записей расписания.");
  }
  // Reject non-string emails before the API attempts to trim them.
  const rows: ScheduleRowError[] = [];
  entries.forEach((entry: unknown, index: number) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry) &&
        "teacherEmail" in entry && typeof entry.teacherEmail !== "string") {
      rows.push({ row: index + 1, message: "Почта преподавателя должна быть строкой." });
    }
  });
  if (rows.length) throw new ScheduleImportError("Исправьте ошибки в файле.", rows);
  const body = JSON.stringify({ entries });
  if (new TextEncoder().encode(body).length > 100 * 1024) {
    throw new ScheduleImportError("Файл превышает лимит сервера 100 КБ. Разделите расписание на несколько файлов.");
  }
  return body;
}

export async function importSchedule(body: string, signal: AbortSignal): Promise<{ imported: number; sourceEntries: number }> {
  const token = getTeacherToken();
  if (!token) throw new ScheduleImportError("Войдите в кабинет преподавателя заново.");
  const response = await fetch(`${API_URL}/api/schedule/import`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body, signal,
  });
  if (response.status === 401) {
    clearTeacherToken();
    throw new ScheduleImportError("Сессия истекла. Войдите заново.");
  }
  if (response.status === 403) throw new ScheduleImportError("Для вашего аккаунта не разрешён импорт расписания. Обратитесь к ответственному за систему.");
  if (response.status === 404) throw new ScheduleImportError("Сервер не поддерживает импорт расписания. Проверьте версию Backend.");
  if (response.status === 413) throw new ScheduleImportError("Файл слишком большой. Разделите расписание на несколько файлов.");
  const data = await response.json().catch(() => null);
  if (response.status === 400 && Array.isArray(data?.errors)) {
    const rows = data.errors.filter((item: unknown): item is ScheduleRowError =>
      typeof item === "object" && item !== null && "row" in item &&
      Number.isInteger(item.row) && Number(item.row) >= 0 && "message" in item && typeof item.message === "string"
    ).map((item: ScheduleRowError) => ({ row: item.row, message: messages[item.message] || item.message }));
    throw new ScheduleImportError("Расписание не загружено. Исправьте ошибки и выберите исправленный файл.", rows);
  }
  if (!response.ok) throw new ScheduleImportError("Не удалось загрузить расписание. Попробуйте позже.");
  if (!Number.isInteger(data?.imported) || data.imported < 0 || !Number.isInteger(data?.sourceEntries) || data.sourceEntries < 1) {
    throw new ScheduleImportError("Сервер вернул неожиданный результат. Проверьте загрузку перед повторной попыткой.");
  }
  return { imported: data.imported, sourceEntries: data.sourceEntries };
}
