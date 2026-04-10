const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface NormalChatMessage {
  id: number;
  user_id?: number;
  sender?: string;
  message?: string;
  message_type?: string;
  diff_html?: string;
  options?: string[];
  images?: string[];
  videos?: string[];
  links?: string[];
  emoji?: string;
  created_at: string;
}

export interface NormalChatResponse {
  messages: NormalChatMessage[];
}

export interface SendNormalMessageResponse {
  userMessage: NormalChatMessage;
  aiMessage: NormalChatMessage;
}

const getToken = (): string => {
  return localStorage.getItem("cloop_token") ?? "";
};

const getUserId = (): number | null => {
  const t = localStorage.getItem("cloop_token");
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload.userId || payload.user_id || payload.id || null;
  } catch {
    return null;
  }
};

/**
 * Fetch normal chat messages for the authenticated user
 */
export const fetchNormalChatMessages = async (): Promise<NormalChatResponse> => {
  const url = `${API_BASE_URL}/api/normal-chat`;
  const token = getToken();
  const userId = getUserId();

  const fullUrl = new URL(url);
  if (userId) {
    fullUrl.searchParams.set("user_id", String(userId));
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error("Authentication required - please login again");
    }
    throw new Error(error.error || "Failed to fetch chat messages");
  }

  return response.json();
};

/**
 * Send a message in normal chat
 */
export const sendNormalChatMessage = async (
  messageData: {
    message?: string;
    file_url?: string;
  }
): Promise<SendNormalMessageResponse> => {
  const url = `${API_BASE_URL}/api/normal-chat/message`;
  const token = getToken();
  const userId = getUserId();

  const fullUrl = new URL(url);
  if (userId) {
    fullUrl.searchParams.set("user_id", String(userId));
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error("Authentication required - please login again");
    }
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
};

/**
 * Clear all normal chat messages for the authenticated user
 */
export const clearNormalChatHistory = async (): Promise<{ message: string }> => {
  const url = `${API_BASE_URL}/api/normal-chat/clear`;
  const token = getToken();
  const userId = getUserId();

  const fullUrl = new URL(url);
  if (userId) {
    fullUrl.searchParams.set("user_id", String(userId));
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl.toString(), {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error("Authentication required - please login again");
    }
    throw new Error(error.error || "Failed to clear chat history");
  }

  return response.json();
};
