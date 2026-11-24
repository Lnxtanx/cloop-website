/**
 * Demo API client for instant showcase access
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface DemoSessionResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    user_id: number;
    name: string;
    email: string;
    is_demo?: boolean;
  };
  guestId: string;
  demoTopic: {
    topicId: number;
    topicTitle: string;
    chapterTitle: string;
    subjectName: string;
  };
}

/**
 * Connects to the demo session endpoint.
 * By default, loads the master demo showcase session (GUEST-52233).
 * If { fresh: true } is passed, creates a new isolated guest session for fresh chatting.
 */
export const createDemoSession = async (
  options?: string | { name?: string; fresh?: boolean }
): Promise<DemoSessionResponse> => {
  const payload = typeof options === "string" ? { name: options } : options || {};

  const response = await fetch(`${API_BASE_URL}/api/demo/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to initialize demo session");
  }

  const data: DemoSessionResponse = await response.json();

  // Store in localStorage so all authenticated API calls work transparently
  localStorage.setItem("cloop_token", data.token);
  localStorage.setItem("cloop_user", JSON.stringify(data.user));
  localStorage.setItem("cloop_is_demo", "true");

  return data;
};
