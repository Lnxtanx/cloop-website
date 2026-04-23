const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

const getToken = (): string => {
  return localStorage.getItem("cloop_token") ?? "";
};

export interface SendNormalMessageResponse {
  userMessage: NormalChatMessage;
  aiMessage: NormalChatMessage;
}

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

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: NormalChatMessage[];
}

export interface NormalChatResponse {
  messages: NormalChatMessage[];
  session_id?: number;
}

export interface ChatSessionsResponse {
  sessions: ChatSession[];
}

/**
 * Fetch chat sessions for the user
 */
export const fetchChatSessions = async (): Promise<ChatSessionsResponse> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/normal-chat/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch sessions");
  return response.json();
};

/**
 * Create a new chat session
 */
export const createChatSession = async (title?: string): Promise<{ session: ChatSession }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/normal-chat/sessions`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Failed to create session");
  return response.json();
};

/**
 * Fetch messages for a specific session
 */
export const fetchNormalChatMessages = async (sessionId?: number): Promise<NormalChatResponse> => {
  const token = getToken();
  const url = new URL(`${API_BASE_URL}/api/normal-chat`);
  if (sessionId) url.searchParams.set("session_id", String(sessionId));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
};

/**
 * Send a message in normal chat
 */
export const sendNormalChatMessage = async (
  messageData: {
    message: string;
    session_id?: number;
  }
): Promise<SendNormalMessageResponse & { session_id: number }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/normal-chat/message`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
};

/**
 * Delete a session
 */
export const deleteChatSession = async (id: number): Promise<{ message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/normal-chat/sessions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete session");
  return response.json();
};
