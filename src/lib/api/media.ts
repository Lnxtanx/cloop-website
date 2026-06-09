/**
 * API client for media search (YouTube videos, Google images)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  url: string;
  embedUrl: string;
}

export interface GoogleImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width?: number;
  height?: number;
  sourceUrl: string;
  source: string;
}

export interface MediaSearchResponse {
  success: boolean;
  query: string;
  results: YouTubeVideo[] | GoogleImage[];
  total: number;
}

export interface CombinedMediaResponse {
  success: boolean;
  query: string;
  videos?: YouTubeVideo[];
  images?: GoogleImage[];
}

const getToken = (): string => {
  return localStorage.getItem("cloop_token") ?? "";
};

/**
 * Search YouTube videos
 */
export const searchYouTubeVideos = async (
  query: string,
  maxResults: number = 3
): Promise<MediaSearchResponse> => {
  const token = getToken();
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/media/youtube?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to search YouTube" }));
    throw new Error(error.error || "Failed to search YouTube");
  }

  return response.json();
};

/**
 * Search Google images
 */
export const searchGoogleImages = async (
  query: string,
  maxResults: number = 3
): Promise<MediaSearchResponse> => {
  const token = getToken();
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/media/images?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to search images" }));
    throw new Error(error.error || "Failed to search images");
  }

  return response.json();
};

/**
 * Combined media search
 */
export const searchMedia = async (
  query: string,
  type: "youtube" | "images" | "both" = "both"
): Promise<CombinedMediaResponse> => {
  const token = getToken();
  const params = new URLSearchParams({
    q: query,
    type,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/media/search?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to search media" }));
    throw new Error(error.error || "Failed to search media");
  }

  return response.json();
};

/**
 * Format view count
 */
export function formatViewCount(count: number): string {
  if (!count) return "0 views";
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
}

/**
 * Format ISO 8601 duration
 */
export function formatDuration(duration: string): string {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
