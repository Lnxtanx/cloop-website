/**
 * API client for topic chat (AI-powered learning)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface TopicChatMessage {
  id: number | string;
  message: string;
  sender: "user" | "ai";
  message_type?: string;
  options?: Array<{ text: string; value: string }>;
  diff_html?: string | null;
  emoji?: string | null;
  complete_answer?: string | null;
  metadata?: any;
  is_correct?: boolean;
  feedback?: {
    type?: string;
    content?: string;
    is_correct?: boolean;
    score_percent?: number;
    bubble_color?: string;
    error_type?: string | null;
  } | null;
  session_summary?: SessionSummaryData;
  score_prediction?: ScorePrediction;
  session_frame?: {
    concept: string;
    why_it_matters: string;
    objectives: string[];
  };
  hook_prediction?: {
    scenario: string;
    student_prediction?: string | null;
    resolve_in_reveal?: boolean;
  };
  exam_definition?: {
    term: string;
    definition: string;
    plain_english: string;
    formula?: string | null;
    units?: string | null;
  };
  concept_card?: {
    concept: string;
    one_line_rule: string;
    key_terms: string[];
    watch_out_for: string;
  };
  revision_sheet?: {
    topic: string;
    concepts_covered: string[];
    definitions: Array<{ term: string; definition: string }>;
    formulas: Array<{ name: string; expression: string; symbols: string }>;
    key_points: string[];
    common_mistakes: string[];
    exam_likely_questions: Array<{ question: string; marks: number; answer_outline: string }>;
    one_minute_recall: string[];
    your_weak_spots: string[];
  };
  score_percent?: number;
  overall_score_percent?: number;
  performance_percent?: number;
  predicted_score?: number;
  top_error_types?: Array<{ type: string }>;
  weak_goals?: Array<{ goal_title: string }>;
  has_weak_areas?: boolean;
  complete_answer?: string;
  completeAnswer?: string;
  mermaid_diagram?: {
    title: string;
    code: string;
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  text_diagram?: {
    title: string;
    code: string;
    diagram_type: "tree" | "arrow" | "table" | "ascii";
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  youtube_video?: {
    search_query: string;
    title: string;
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  google_image?: {
    search_query: string;
    title: string;
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  videos?: Array<{
    id: string;
    thumbnail?: string;
    url: string;
    embedUrl?: string;
    channel?: string;
  }>;
  images?: Array<{
    thumbnail?: string;
    url: string;
    source?: string;
  }>;
  audio?: string;
  created_at: string;
}

export interface SessionSummaryData {
  total_questions?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  score_percent?: number;
  overall_score_percent?: number;
  performance_percent?: number;
  predicted_score?: number;
  star_rating?: number;
  performance_level?: string;
  performance_color?: string;
  goal_performance?: Array<{
    goal_title: string;
    questions_asked: number;
    correct_answers: number;
    incorrect_answers: number;
    score_percent: number;
    is_weak: boolean;
  }>;
  top_error_types?: Array<{ type: string; count?: number; percent?: number }>;
  weak_goals?: Array<{ goal_title: string; score_percent?: number }>;
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
  chat_goal_progress?: Array<{
    is_completed?: boolean;
    num_questions?: number;
    num_correct?: number;
    score_percent?: number;
  }>;
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

export interface ScorePrediction {
  goal_id: number;
  goal_title?: string;
  concept_score: number;
  exam_score: number;
  predicted_score: number;
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
    diff_html?: string | null;
    correction?: string | null;
    complete_answer?: string | null;
    emoji?: string | null;
    feedback?: {
      is_correct?: boolean;
      score_percent?: number;
      bubble_color?: string;
      error_type?: string | null;
    } | null;
  };
  session_summary?: SessionSummaryData;
  score_prediction?: ScorePrediction;
  mermaid_diagram?: {
    title: string;
    code: string;
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  text_diagram?: {
    title: string;
    code: string;
    diagram_type: "tree" | "arrow" | "table" | "ascii";
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  youtube_video?: {
    search_query: string;
    title: string;
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  google_image?: {
    search_query: string;
    title: string;
    trigger: "correction" | "teaching" | "user_request";
  } | null;
  // Fetched media results
  youtube_results?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    embedUrl: string;
    channel: string;
    duration: string;
    viewCount: number;
  }>;
  image_results?: Array<{
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    source: string;
    sourceUrl: string;
  }>;
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
    voice_enabled?: boolean;
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
 *
 * secondsPerTick is the DELTA accrued since the last write for this visit.
 * action drives the backend session lifecycle: 'heartbeat' (open),
 * 'pause' (left mid-session), or 'complete' (all goals finished).
 */
export const updateTopicTime = async (
  topicId: number,
  secondsPerTick: number,
  action: "heartbeat" | "pause" | "complete" = "heartbeat",
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
      session_time_seconds: secondsPerTick,
      action,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update time" }));
    throw new Error(error.error || "Failed to update time spent");
  }
};
