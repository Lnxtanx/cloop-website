/**
 * API client for topic chat (AI-powered learning)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface TopicChatMessage {
  id: number;
  message: string;
  sender: "user" | "ai";
  message_type?: string;
  options?: Array<{ text: string; value: string }>;
  diff_html?: string;
  emoji?: string;
  is_correct?: boolean;
  feedback?: {
    type?: string;
    content?: string;
  };
  session_summary?: SessionSummaryData;
  complete_answer?: string;
  completeAnswer?: string;
  created_at: string;
}

export interface SessionSummaryData {
  total_questions?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  score_percent?: number;
  overall_score_percent?: number;
  performance_percent?: number;
  top_error_types?: Array<{ type: string }>;
  weak_goals?: Array<{ goal_title: string }>;
  has_weak_areas?: boolean;
}

export interface ErrorType {
  type: string;
}

export interface WeakGoal {
  goal_title: string;
}

export interface TopicGoal {
  id: number;
  title: string;
  description: string;
  order: number;
  is_completed: boolean;
}

export interface TopicChatDetails {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  completion_percent: number;
  time_spent_seconds: number;
}

export interface TopicChatResponse {
  topic: TopicChatDetails;
  messages: TopicChatMessage[];
  aiMessages?: TopicChatMessage[];
  goals?: TopicGoal[];
  initialGreeting?: Array<{
    message: string;
    message_type: string;
    options?: Array<{ text: string; value: string }>;
  }>;
  session_summary?: {
    summary: string;
    key_points: string[];
    next_steps: string[];
    performance: number;
  };
}

export interface SendMessageResponse {
  userMessage?: TopicChatMessage;
  messages: TopicChatMessage[];
  aiMessages?: TopicChatMessage[];
  goals?: TopicGoal[];
  feedback?: {
    message_type: string;
    feedback: string;
    correction?: string;
  };
  userCorrection?: {
    message_type: string;
    diff_html?: string;
    correction?: string;
    emoji?: string;
  };
  session_summary?: SessionSummaryData;
  all_goals_completed?: boolean;
}

interface FetchOptions {
  userId?: number;
  token?: string;
}

/**
 * Fetch initial topic chat messages and goals
 * GET /api/topic-chats/:topicId
 */
export const fetchTopicChatMessages = async (
  topicId: number,
  options?: FetchOptions
): Promise<TopicChatResponse> => {
  const token = options?.token || localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/topic-chats/${topicId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch chat" }));
    throw new Error(error.error || "Failed to fetch topic chat");
  }

  return response.json();
};

/**
 * Send a message in topic chat
 * POST /api/topic-chats/:topicId/message
 */
export const sendTopicChatMessage = async (
  topicId: number,
  messageData: {
    message: string;
    session_time_seconds?: number;
  },
  options?: FetchOptions
): Promise<SendMessageResponse> => {
  const token = options?.token || localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/topic-chats/${topicId}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to send message" }));
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
};

/**
 * Update time spent on a topic
 * POST /api/topic-chats/:topicId/update-time
 */
export const updateTopicTime = async (
  topicId: number,
  timeSpentSeconds: number,
  options?: FetchOptions
): Promise<void> => {
  const token = options?.token || localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/topic-chats/${topicId}/update-time`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      session_time_seconds: timeSpentSeconds,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update time" }));
    throw new Error(error.error || "Failed to update time spent");
  }
};
