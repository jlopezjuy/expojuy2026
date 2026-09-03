import { signal } from '@preact/signals';
import type { UserDTO } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';

export interface Session {
  token: string;
  user: UserDTO;
  remember: boolean;
}

const STORAGE_KEY = 'expojuy_auth';

function readStorage(): Session | null {
  if (typeof window === 'undefined') return null;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Partial<Session>;
      if (parsed.token && parsed.user) return parsed as Session;
    } catch {
      // Corrupted or inaccessible storage — try the next one.
    }
  }
  return null;
}

/**
 * Reactive session state, shared by every island that imports this module
 * (Vite serves it as the same module instance in the browser). Preact islands
 * can read `sessionSignal.value` directly, or use the plain get/set/clear
 * helpers below — both stay in sync with storage.
 */
export const sessionSignal = signal<Session | null>(readStorage());

export function getSession(): Session | null {
  return sessionSignal.value;
}

export function setSession(token: string, user: UserDTO, remember: boolean): void {
  const session: Session = { token, user, remember };
  sessionSignal.value = session;
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  try {
    other.removeItem(STORAGE_KEY); // avoid a stale copy lingering in the other storage
    target.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — session still holds for the current page life.
  }
}

export function clearSession(): void {
  sessionSignal.value = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage was never reachable.
  }
}

if (typeof window !== 'undefined') {
  setUnauthorizedHandler(() => {
    clearSession();
    window.location.href = '/login';
  });
}
