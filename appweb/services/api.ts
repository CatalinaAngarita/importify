// Cliente HTTP central hacia `app` (NestJS).
// Toda URL sale de NEXT_PUBLIC_API_URL. Ningún componente repite URLs.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const TOKEN_KEY = "importify_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface Options extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { auth, ...init } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.headers) {
    const h = new Headers(init.headers);
    h.forEach((v, k) => {
      headers[k] = v;
    });
  }
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init, headers });
  } catch {
    throw new ApiError(0, `Sin conexión con la API (${API_URL}${path})`);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body as { message?: string | string[] } | null)?.message ??
      `API ${res.status} en ${path}`;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : String(message), body);
  }
  return body as T;
}

export const apiGet = <T>(path: string, auth = false) => request<T>(path, { auth });

export const apiPost = <T>(path: string, data?: unknown, auth = false) =>
  request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}), auth });

export const apiPatch = <T>(path: string, data?: unknown, auth = false) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}), auth });

export const apiDelete = <T>(path: string, auth = false) =>
  request<T>(path, { method: "DELETE", auth });

export { API_URL };
