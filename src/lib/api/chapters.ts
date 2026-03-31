/**
 * API client for fetching chapters and topics
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface Chapter {
  id: number;
  title: string;
  description?: string;
  completed_topics: number;
  total_topics: number;
  completion_percent: number;
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  completion_percent: number;
  time_spent_seconds: number;
  content?: string;
}

export interface ChapterResponse {
  chapters: Chapter[];
  subject: {
    id: number;
    name: string;
    code?: string;
    category?: string;
  };
}

export interface TopicResponse {
  topics: Topic[];
  chapter: {
    id: number;
    title: string;
    description?: string;
    completed_topics: number;
    total_topics: number;
    completion_percent: number;
  };
  goals?: Array<{
    id: number;
    title: string;
    description: string;
    order: number;
    is_completed: boolean;
  }>;
}

interface FetchOptions {
  userId?: number;
  token?: string;
}

/**
 * Fetch chapters for a subject
 * GET /api/chapters/:subjectId
 */
export const fetchChapters = async (
  subjectId: number,
  options?: FetchOptions
): Promise<ChapterResponse> => {
  const token = options?.token || localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/chapters/${subjectId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch chapters" }));
    throw new Error(error.error || "Failed to fetch chapters");
  }

  return response.json();
};

/**
 * Fetch topics for a chapter
 * GET /api/topics/:chapterId
 */
export const fetchTopics = async (
  chapterId: number,
  options?: FetchOptions
): Promise<TopicResponse> => {
  const token = options?.token || localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/topics/${chapterId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch topics" }));
    throw new Error(error.error || "Failed to fetch topics");
  }

  return response.json();
};

/**
 * Save/bookmark a topic
 * POST /api/saved-topics/save
 */
export const saveTopic = async (
  userId: number,
  topicId: number,
  token?: string
): Promise<void> => {
  const authToken = token || localStorage.getItem("cloop_token");

  if (!authToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-topics/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      user_id: userId,
      topic_id: topicId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to save topic" }));
    throw new Error(error.error || "Failed to save topic");
  }
};

/**
 * Remove a bookmarked topic
 * POST /api/saved-topics/unsave
 */
export const unsaveTopic = async (
  userId: number,
  topicId: number,
  token?: string
): Promise<void> => {
  const authToken = token || localStorage.getItem("cloop_token");

  if (!authToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-topics/unsave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      user_id: userId,
      topic_id: topicId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to unsave topic" }));
    throw new Error(error.error || "Failed to unsave topic");
  }
};

/**
 * Fetch saved topics for a user
 * GET /api/saved-topics?user_id=1
 */
export const fetchSavedTopics = async (
  userId: number,
  token?: string
): Promise<Array<{ topic_id: number; title: string }>> => {
  const authToken = token || localStorage.getItem("cloop_token");

  if (!authToken) {
    throw new Error("Authentication required");
  }

  if (!userId || userId <= 0) {
    throw new Error("Valid userId is required");
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-topics?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch saved topics" }));
    throw new Error(error.error || "Failed to fetch saved topics");
  }

  return response.json();
};
