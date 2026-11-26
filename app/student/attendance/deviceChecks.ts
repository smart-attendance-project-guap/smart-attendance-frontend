
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { API_URL, getStudentToken } from "../_lib/auth";

type OptionsResponse = {
  requestId: string;
  options: Record<string, unknown>;
};

class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function authorizedPost(path: string, body?: unknown) {
  const token = getStudentToken();
  if (!token) throw new Error("Сеанс истёк. Войди в аккаунт заново.");

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const code = data?.code;

    if (response.status === 409 && code === "NO_REGISTERED_CREDENTIAL") {
      throw new Error(
        "На аккаунте ещё нет зарегистрированного ключа. Сначала зарегистрируй устройство."
      );
    }

    if (response.status === 410 || code === "CHALLENGE_EXPIRED_OR_USED") {
      throw new ApiRequestError(
        data?.message || "Срок проверки устройства истёк.",
        response.status,
        code
      );
    }

    if (response.status === 401) {
      throw new Error("Сеанс истёк. Войди в аккаунт заново.");
    }

    throw new ApiRequestError(
      data?.message || "Не удалось выполнить проверку на сервере.",
      response.status,
      code
    );
  }

  return data;
}

export async function registerStudentDevice() {
  const optionsResponse = (await authorizedPost(
    "/api/devices/webauthn/register/options"
  )) as OptionsResponse;

  if (!optionsResponse.requestId || !optionsResponse.options) {
    throw new Error("Backend вернул неполные параметры регистрации WebAuthn.");
  }

  const credential = await startRegistration({
    optionsJSON: optionsResponse.options as unknown as Parameters<
      typeof startRegistration
    >[0]["optionsJSON"],
  });

  const result = await authorizedPost(
    "/api/devices/webauthn/register/verify",
    {
      requestId: optionsResponse.requestId,
      credential,
    }
  );

  if (result?.verified !== true) {
    throw new Error("Backend не подтвердил регистрацию устройства.");
  }
}

export async function verifyAttendanceDevice(attendanceId: number) {
  async function runVerification() {
    const optionsResponse = (await authorizedPost(
      `/api/attendance/${attendanceId}/device/options`
    )) as OptionsResponse;

    if (!optionsResponse.requestId || !optionsResponse.options) {
      throw new Error("Backend вернул неполные параметры проверки WebAuthn.");
    }

    const credential = await startAuthentication({
      optionsJSON: optionsResponse.options as unknown as Parameters<
        typeof startAuthentication
      >[0]["optionsJSON"],
    });

    return authorizedPost(
      `/api/attendance/${attendanceId}/device/verify`,
      {
        requestId: optionsResponse.requestId,
        credential,
      }
    );
  }

  let result: Awaited<ReturnType<typeof runVerification>>;

  try {
    result = await runVerification();
  } catch (error) {
    if (
      !(error instanceof ApiRequestError) ||
      (error.status !== 410 &&
        error.code !== "CHALLENGE_EXPIRED_OR_USED")
    ) {
      throw error;
    }

    // Если challenge истёк или был использован, пока окно проверки
    // посещения ещё открыто, запрашиваем новые параметры WebAuthn
    // для той же записи посещения. Повторно сканировать QR не нужно.
    try {
      result = await runVerification();
    } catch (retryError) {
      if (
        retryError instanceof ApiRequestError &&
        (retryError.status === 410 ||
          retryError.code === "CHALLENGE_EXPIRED_OR_USED")
      ) {
        throw new Error(
          "Окно проверки устройства истекло. Отметка сохранена и остаётся на рассмотрении преподавателя."
        );
      }

      throw retryError;
    }
  }

  if (result?.verified !== true || result?.status !== "PENDING") {
    throw new Error("Backend не подтвердил проверку устройства.");
  }
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Браузер не поддерживает геолокацию.")
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Доступ к геолокации запрещён. Разреши его в настройках браузера."
            )
          );
        } else if (error.code === error.TIMEOUT) {
          reject(
            new Error("Не удалось определить местоположение вовремя.")
          );
        } else {
          reject(
            new Error(
              "Местоположение недоступно. Проверь настройки устройства."
            )
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

export async function verifyAttendanceLocation(attendanceId: number) {
  const position = await getCurrentPosition();
  const capturedAt = new Date().toISOString();

  const result = await authorizedPost(
    `/api/attendance/${attendanceId}/location`,
    {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy,
      capturedAt,
    }
  );

  if (result?.locationChecked !== true) {
    const reasons: Record<string, string> = {
      LOCATION_CAPTURE_TIME_OUTSIDE_WINDOW:
        "Координаты получены вне допустимого времени проверки.",
      LOCATION_ACCURACY_TOO_LOW:
        "Точность геолокации недостаточна. Попробуй ещё раз на открытом месте.",
      LOCATION_OUTSIDE_RADIUS:
        "Ты находишься за пределами допустимой зоны аудитории.",
    };

    throw new Error(
      reasons[result?.reason] || "Backend не подтвердил геолокацию."
    );
  }
}
