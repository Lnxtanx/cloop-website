/**
 * API client for practice tests (NEET/IIT-JEE)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface PracticeQuestion {
  id: number;
  question_text: string;
  options: string[];
  user_answer?: string | null;
  correct_answer?: string;
  is_correct?: boolean;
  explanation?: string;
}

export interface PracticeTest {
  id: number;
  user_id: number;
  exam_type: string;
  subject: string;
  total_questions: number;
  score?: number;
  time_taken_sec?: number;
  status: "in_progress" | "completed";
  created_at: string;
  completed_at?: string;
  questions?: PracticeQuestion[];
}

export interface GenerateTestResponse {
  test_id: number;
  exam_type: string;
  subject: string;
  questions: PracticeQuestion[];
  time_limit_sec: number;
}

export interface SubmitTestResponse {
  score: number;
  total_questions: number;
  time_taken_sec: number;
  questions: PracticeQuestion[];
}

/**
 * Generate a new practice test
 * POST /api/practice-tests/generate
 */
export const generatePracticeTest = async (
  examType: string,
  subject: string
): Promise<GenerateTestResponse> => {
  const token = localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/practice-tests/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      exam_type: examType,
      subject: subject,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to generate test" }));
    throw new Error(error.error || "Failed to generate practice test");
  }

  return response.json();
};

/**
 * Submit practice test answers
 * POST /api/practice-tests/:id/submit
 */
export const submitPracticeTest = async (
  testId: number,
  answers: Array<{ question_id: number; user_answer: string | null }>,
  timeTakenSec: number
): Promise<SubmitTestResponse> => {
  const token = localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/practice-tests/${testId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      answers: answers,
      time_taken_sec: timeTakenSec,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to submit test" }));
    throw new Error(error.error || "Failed to submit practice test");
  }

  return response.json();
};

/**
 * Fetch practice test history
 * GET /api/practice-tests/history
 */
export const fetchPracticeHistory = async (): Promise<PracticeTest[]> => {
  const token = localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/practice-tests/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch history" }));
    throw new Error(error.error || "Failed to fetch practice history");
  }

  return response.json();
};

/**
 * Fetch detailed result of a specific test
 * GET /api/practice-tests/:id
 */
export const fetchPracticeTestDetails = async (testId: number): Promise<PracticeTest> => {
  const token = localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/practice-tests/${testId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch test details" }));
    throw new Error(error.error || "Failed to fetch practice test details");
  }

  return response.json();
};
