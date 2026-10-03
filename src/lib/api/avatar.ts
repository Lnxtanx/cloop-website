const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export type AvatarFace = {
  id: string;
  name: string;
  note: string;
  model: string;
};

export type AvatarLanguage = {
  code: string;
  label: string;
  native: string;
};

export type AvatarUsage = {
  month: string;
  secondsUsed: number;
  secondsBudget: number;
  remainingSeconds: number;
  perUserSecondsUsed: number;
  perUserSecondsBudget: number;
  perUserRemainingSeconds: number;
  sessionCount: number;
};

export type AvatarConfig = {
  enabled: boolean;
  configured: boolean;
  available: boolean;
  reason: string | null;
  faces: AvatarFace[];
  languages: AvatarLanguage[];
  defaultFaceId: string;
  defaultLanguages: string[];
  maxCallSeconds: number;
  usage: AvatarUsage;
};

export type AvatarSession = {
  conversationId: string;
  conversationUrl: string;
  status: string;
  testMode: boolean;
  usage: AvatarUsage;
};

export type StartAvatarInput = {
  faceId?: string;
  languages?: string[];
  greeting?: string;
  context?: string;
  testMode?: boolean;
};

type FetchOptions = { token?: string };

function getToken(explicit?: string): string {
  if (explicit) return explicit;
  const token = localStorage.getItem("cloop_token");
  if (!token) throw new Error("Authentication required");
  return token;
}

async function authFetch<T>(path: string, init: RequestInit = {}, options: FetchOptions = {}): Promise<T> {
  const token = getToken(options.token);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: Record<string, unknown> = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : typeof payload.message === "string"
          ? payload.message
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

/** Availability, face list, language list, and budget in one call. */
export const fetchAvatarConfig = (options: FetchOptions = {}) =>
  authFetch<AvatarConfig>("/api/avatar/config", {}, options);

export const fetchAvatarUsage = (options: FetchOptions = {}) =>
  authFetch<AvatarUsage>("/api/avatar/usage", {}, options);

/**
 * Creates a Tavus conversation and returns the URL to embed.
 *
 * Pass `testMode: true` to create it without the PAL joining -- that costs no
 * minutes and does not consume the single concurrency slot.
 */
export const startAvatarSession = (input: StartAvatarInput, options: FetchOptions = {}) =>
  authFetch<AvatarSession>(
    "/api/avatar/session",
    { method: "POST", body: JSON.stringify(input) },
    options,
  );

export const endAvatarSession = (conversationId: string, elapsedSeconds: number, options: FetchOptions = {}) =>
  authFetch<{ ok: boolean; usage: AvatarUsage }>(
    "/api/avatar/session/end",
    { method: "POST", body: JSON.stringify({ conversationId, elapsedSeconds }) },
    options,
  );

export type AvatarHistoryEntry = {
  id: number;
  status: string;
  duration_seconds: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
};

export const fetchAvatarHistory = (limit = 10, options: FetchOptions = {}) =>
  authFetch<{ sessions: AvatarHistoryEntry[] }>(
    `/api/avatar/sessions?limit=${limit}`,
    {},
    options,
  );

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}