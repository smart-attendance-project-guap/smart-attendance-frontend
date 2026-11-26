
import { API_URL, clearTeacherToken, getTeacherToken } from "./auth";

export type Reference = {
  id: number;
  name: string;
};

export type ClassroomReference = Reference & {
  building?: Reference | null;
};

export type LessonInput = {
  discipline: string;
  groupId: number;
  groupIds?: number[];
  classroomId: number;
  startsAt: string;
  endsAt: string;
};

type ApiResponse = Record<string, unknown>;

function isRecord(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReference(value: unknown): value is Reference {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.id) &&
    (value.id as number) > 0 &&
    typeof value.name === "string"
  );
}

function isReferenceList(value: unknown): value is Reference[] {
  return Array.isArray(value) && value.every(isReference);
}

function isClassroomReference(value: unknown): value is ClassroomReference {
  if (!isReference(value)) {
    return false;
  }

  const building = (value as Record<string, unknown>).building;

  return (
    building === undefined ||
    building === null ||
    isReference(building)
  );
}

function getErrorMessage(data: ApiResponse, fallback: string): string {
  return typeof data.message === "string" && data.message.trim()
    ? data.message
    : fallback;
}

async function request(
  path: string,
  signal: AbortSignal,
  body?: LessonInput
): Promise<ApiResponse> {
  const token = getTeacherToken();

  if (!token) {
    window.location.replace("/teacher-login");
    throw new Error("Войдите в кабинет преподавателя.");
  }

  const response = await fetch(`${API_URL}/api/${path}`, {
    method: body ? "POST" : "GET",
    signal,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401 || response.status === 403) {
    clearTeacherToken();
    window.location.replace("/teacher-login");
    throw new Error("Войдите в кабинет преподавателя.");
  }

  const responseData: unknown = await response.json().catch(() => ({}));
  const data = isRecord(responseData) ? responseData : {};

  if (!response.ok) {
    if (body && response.status === 409) {
      const messages: Record<string, string> = {
        "Classroom is already occupied at this time": "Аудитория уже занята на выбранное время. Выберите другую аудиторию или время.",
        "Group already has a lesson at this time": "У группы уже есть занятие на выбранное время. Выберите другое время.",
        "Teacher already has a lesson at this time": "У вас уже есть занятие на выбранное время. Выберите другое время.",
      };
      throw new Error(messages[typeof data.message === "string" ? data.message : ""] ?? "В выбранное время есть пересечение с другим занятием. Проверьте группу, аудиторию и время.");
    }
    if (body && response.status === 404) {
      throw new Error(
        "Группа или аудитория больше не найдена. Обновите страницу и выберите их заново."
      );
    }

    if (body && response.status === 400) {
      throw new Error(
        getErrorMessage(
          data,
          "Проверьте дисциплину, группы, аудиторию и время занятия."
        )
      );
    }

    throw new Error(
      getErrorMessage(
        data,
        body
          ? "Не удалось создать занятие. Проверьте список занятий перед повторной отправкой."
          : "Не удалось загрузить справочники."
      )
    );
  }

  return data;
}

export async function getLessonReferences(
  signal: AbortSignal
): Promise<{
  groups: Reference[];
  classrooms: ClassroomReference[];
  disciplines: Reference[];
}> {
  const [groupsData, classroomsData, disciplinesData] = await Promise.all([
    request("groups", signal),
    request("classrooms", signal),
    request("disciplines", signal),
  ]);

  if (
    !isReferenceList(groupsData.groups) ||
    !isReferenceList(disciplinesData.disciplines) ||
    !Array.isArray(classroomsData.classrooms) ||
    !classroomsData.classrooms.every(isClassroomReference)
  ) {
    throw new Error(
      "Сервер вернул неверный формат групп, аудиторий или дисциплин."
    );
  }

  const classrooms: ClassroomReference[] =
    classroomsData.classrooms.map((item) => ({
      id: item.id,
      name: item.name,
      building: item.building ?? null,
    }));

  return {
    groups: groupsData.groups,
    classrooms,
    disciplines: disciplinesData.disciplines,
  };
}

export async function createLesson(
  input: LessonInput,
  signal: AbortSignal
): Promise<number> {
  if (!input.discipline.trim()) {
    throw new Error("Выберите дисциплину из списка.");
  }

  if (!Number.isSafeInteger(input.groupId) || input.groupId <= 0) {
    throw new Error("Выберите учебную группу.");
  }

  const additionalGroupIds = input.groupIds ?? [];
  const participatingGroupIds = [
    input.groupId,
    ...additionalGroupIds,
  ];

  if (
    participatingGroupIds.length > 4 ||
    participatingGroupIds.some(
      (id) => !Number.isSafeInteger(id) || id <= 0
    ) ||
    new Set(participatingGroupIds).size !== participatingGroupIds.length
  ) {
    throw new Error(
      "Выберите от одной до четырёх уникальных учебных групп."
    );
  }

  if (!Number.isSafeInteger(input.classroomId) || input.classroomId <= 0) {
    throw new Error("Выберите аудиторию.");
  }

  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);

  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end <= start
  ) {
    throw new Error("Окончание занятия должно быть позже начала.");
  }

  const data = await request("lessons", signal, {
    discipline: input.discipline,
    groupId: input.groupId,
    ...(participatingGroupIds.length > 1
      ? { groupIds: participatingGroupIds.slice(1) }
      : {}),
    classroomId: input.classroomId,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
  });

  const lesson = isRecord(data.lesson) ? data.lesson : null;
  const lessonId = lesson?.id;

  if (
    typeof lessonId !== "number" ||
    !Number.isSafeInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new Error(
      "Не удалось прочитать ответ сервера. Проверьте список занятий перед повторной отправкой."
    );
  }

  return lessonId;
}
