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
 * Creates a fresh, isolated guest user account and returns a valid JWT token
 * pre-configured for the Class 8 Science "Force & Motion" tutor demo showcase.
 */
export const createDemoSession = async (name?: string): Promise<DemoSessionResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/demo/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
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
