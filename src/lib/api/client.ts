/**
 * Minimal fetch wrapper for the NestJS/JHipster backend.
 *
 * Base URL comes from `PUBLIC_API_BASE_URL` (see .env.example). Endpoints are
 * given relative to it, e.g. request('/api/account', { token }).
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message = `Request failed with status ${status}`) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Registered once by the session module so any authenticated request that gets
 * a 401 (expired/invalid token) triggers logout + redirect, without client.ts
 * depending on session state itself. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  /** JWT to send as `Authorization: Bearer <token>`. Omit for anonymous requests. */
  token?: string;
  headers?: Record<string, string>;
}

function resolveUrl(path: string): string {
  const base = import.meta.env.PUBLIC_API_BASE_URL;
  return new URL(path, base).toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers = {}, ...init } = options;

  const finalHeaders: Record<string, string> = { ...headers };
  if (init.body !== undefined && !('Content-Type' in finalHeaders)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers: finalHeaders,
  });

  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status);
  }

  // 204 No Content and similar have no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
