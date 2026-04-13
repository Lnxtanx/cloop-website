export interface SignupResponse {
  user: {
    user_id: number;
    email: string;
    name: string;
    created_at: string;
    num_chats: number;
    num_lessons: number;
  };
  guestId?: string;
}

export interface SignupData {
  name: string;
  guestId?: string;
  grade_level?: string;
  board?: string;
  subjects?: string[];
  preferred_language?: string;
  study_goal?: string;
}

export interface SignupOptions {
  grades: string[];
  boards: Array<{ id: number; code: string; name: string; description?: string }>;
  subjects: Array<{ id: number; code?: string; name: string; category?: string }>;
  languages: Array<{ id: number; code: string; name: string; native_name?: string; is_active?: boolean }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export const getSignupOptions = async (): Promise<SignupOptions> => {
  const response = await fetch(`${API_BASE_URL}/api/signup/options`, { method: "GET", headers: { "Content-Type": "application/json" } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch signup options");
  }
  return response.json();
};

export const signupUser = async (userData: SignupData): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Signup failed");
  }
  return response.json();
};
