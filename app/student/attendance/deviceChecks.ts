import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { API_URL, getStudentToken } from "../_lib/auth";

type OptionsResponse = {
  requestId: string;
  options: Record<string, unknown>;
};

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
      throw new Error("На аккаунте ещё нет зарегистрированного ключа. Сначала зарегистрируй устройство.");
    }
    if (response.status === 410 || code === "CHALLENGE_EXPIRED_OR_USED") {
      throw new Error("Время проверки истекло. Отсканируй QR-код заново.");
    }
    if (response.status === 401) throw new Error("Сеанс истёк. Войди в аккаунт заново.");
    throw new Error(data?.message || "Не удалось выполнить проверку на сервере.");
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
    optionsJSON: optionsResponse.options as unknown as Parameters<typeof startRegistration>[0]["optionsJSON"],
  });

  const result = await authorizedPost("/api/devices/webauthn/register/verify", {
    requestId: optionsResponse.requestId,
    credential,
  });

  if (result?.verified !== true) {
    throw new Error("Backend не подтвердил регистрацию устройства.");
  }
}

export async function verifyAttendanceDevice(attendanceId: number) {
  const optionsResponse = (await authorizedPost(
    `/api/attendance/${attendanceId}/device/options`
  )) as OptionsResponse;

  if (!optionsResponse.requestId || !optionsResponse.options) {
    throw new Error("Backend вернул неполные параметры проверки WebAuthn.");
  }

  const credential = await startAuthentication({
    optionsJSON: optionsResponse.options as unknown as Parameters<typeof startAuthentication>[0]["optionsJSON"],
  });

  const result = await authorizedPost(
    `/api/attendance/${attendanceId}/device/verify`,
    { requestId: optionsResponse.requestId, credential }
  );

  if (result?.verified !== true || result?.status !== "PENDING") {
    throw new Error("Backend не подтвердил проверку устройства.");
  }
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Браузер не поддерживает геолокацию."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Доступ к геолокации запрещён. Разреши его в настройках браузера."));
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Не удалось определить местоположение вовремя."));
        } else {
          reject(new Error("Местоположение недоступно. Проверь настройки устройства."));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export async function verifyAttendanceLocation(attendanceId: number) {
  const position = await getCurrentPosition();
  const capturedAt = new Date().toISOString();

  const result = await authorizedPost(`/api/attendance/${attendanceId}/location`, {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy,
    capturedAt,
  });

  if (result?.locationChecked !== true) {
    const reasons: Record<string, string> = {
      LOCATION_CAPTURE_TIME_OUTSIDE_WINDOW: "Координаты получены вне допустимого времени проверки.",
      LOCATION_ACCURACY_TOO_LOW: "Точность геолокации недостаточна. Попробуй ещё раз на открытом месте.",
      LOCATION_OUTSIDE_RADIUS: "Ты находишься за пределами допустимой зоны аудитории.",
    };
    throw new Error(reasons[result?.reason] || "Backend не подтвердил геолокацию.");
  }
}
