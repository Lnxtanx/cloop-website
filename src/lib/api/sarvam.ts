/**
 * API client for Sarvam AI Text-to-Speech integration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

interface FetchOptions {
  token?: string;
}

/**
 * Convert text to speech using the Node.js backend's Sarvam AI endpoint
 * POST /api/voice-chat/sarvam-tts
 * Returns a base64 encoded audio string
 */
export const convertTextToSpeech = async (
  text: string,
  speaker: string = "anushka",
  language: string = "en-IN",
  options?: FetchOptions
): Promise<string> => {
  const token = options?.token || localStorage.getItem("cloop_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/voice-chat/sarvam-tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text,
      speaker,
      language,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to convert text to speech" }));
    throw new Error(error.error || "Failed to synthesize speech using Sarvam AI");
  }

  const data = await response.json();
  return data.audio; // Return base64 string
};
