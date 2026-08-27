import { useState, useEffect } from "react";
import {
  Play,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  ChevronUp,
  X,
  Tv,
} from "lucide-react";
import {
  searchYouTubeVideos,
  searchGoogleImages,
  YouTubeVideo,
  GoogleImage,
  formatDuration,
} from "@/lib/api/media";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaCardProps {
  type: "youtube" | "image";
  searchQuery?: string;
  title?: string;
  trigger?: "correction" | "teaching" | "user_request";
  // Pre-fetched data (for persisted messages)
  thumbnail?: string;
  url?: string;
  embedUrl?: string;
  channel?: string;
  source?: string;
  duration?: string;
  viewCount?: number | string;
  hideAvatar?: boolean;
}

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    channel?: string;
    duration?: string;
    viewCount?: number;
    embedUrl?: string;
    description?: string;
    publishedAt?: string;
  };
  hideAvatar?: boolean;
}

interface ImageCardProps {
  image: {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    source?: string;
    sourceUrl?: string;
    width?: number;
    height?: number;
  };
  hideAvatar?: boolean;
}

// ─── Embed URL Helper ────────────────────────────────────────────────────────

function getEmbedUrl(url: string, videoId?: string) {
  if (!url) return "";
  if (url.includes("/embed/")) return url;

  let id = videoId;
  if (!id || id === "prefetched") {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      id = match[2];
    }
  }

  if (id && id !== "prefetched") {
    return `https://www.youtube.com/embed/${id}`;
  }

  return url;
}

// ─── Video Card (Compact Bar + Inline Expand + Focused Modal) ───────────────

function VideoCard({ video, hideAvatar = false }: VideoCardProps) {
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const embedUrl = getEmbedUrl(video.embedUrl || video.url, video.id);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const cardContent = (
    <div
      style={{
        maxWidth: hideAvatar ? "100%" : "90%",
        minWidth: 280,
        width: isInlineExpanded ? 520 : "fit-content",
        borderRadius: 14,
        overflow: "hidden",
        border: "1.5px solid #e9d5ff",
        background: "#ffffff",
        boxShadow: "0 2px 10px rgba(124, 58, 237, 0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Inline Expanded Player Mode */}
      {isInlineExpanded ? (
        <div>
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              background: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
              borderBottom: "1px solid #e9d5ff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
              <Tv style={{ width: 14, height: 14, color: "#7e22ce", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#581c87",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={video.title}
              >
                {video.title}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "#ffffff",
                  border: "1px solid #d8b4fe",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6b21a8",
                  cursor: "pointer",
                }}
                title="Open Fullscreen Modal"
              >
                <Maximize2 style={{ width: 12, height: 12 }} />
                <span className="hidden sm:inline">Expand</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInlineExpanded(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "#ffffff",
                  border: "1px solid #d8b4fe",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6b21a8",
                  cursor: "pointer",
                }}
                title="Collapse Player"
              >
                <ChevronUp style={{ width: 12, height: 12 }} />
                <span className="hidden sm:inline">Collapse</span>
              </button>
            </div>
          </div>

          {/* 16:9 Iframe Container */}
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
            {embedUrl ? (
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#fff" }}>
                Video preview unavailable
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              fontSize: 11,
              color: "#6b7280",
              background: "#fdfcff",
            }}
          >
            <span>{video.channel || "YouTube"}</span>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "#7e22ce",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} />
              Open on YouTube
            </a>
          </div>
        </div>
      ) : (
        /* Compact Bar Mode (Default Text-First UI) */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            background: "#faf5ff",
          }}
        >
          {/* Left Thumbnail with Play badge */}
          <div
            onClick={() => setIsInlineExpanded(true)}
            style={{
              position: "relative",
              width: 76,
              height: 46,
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              cursor: "pointer",
              background: "#000",
            }}
            title="Click to play video"
          >
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#374151" }} />
            )}

            {/* Play Badge Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                <Play style={{ width: 11, height: 11, color: "#fff", marginLeft: 2, fill: "#fff" }} />
              </div>
            </div>

            {video.duration && (
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  background: "rgba(0,0,0,0.8)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          {/* Title & Channel Info */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#7e22ce",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                🎬 Video Explanation
              </span>
              {video.channel && (
                <span style={{ fontSize: 10, color: "#9ca3af" }}>• {video.channel}</span>
              )}
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1e1b4b",
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={video.title}
            >
              {video.title}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setIsInlineExpanded(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 20,
                background: "#7e22ce",
                color: "#ffffff",
                border: "none",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(126, 34, 206, 0.2)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6b21a8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7e22ce")}
              title="Watch video inline"
            >
              <Play style={{ width: 11, height: 11, fill: "#fff" }} />
              <span>Watch</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #d8b4fe",
                color: "#6b21a8",
                cursor: "pointer",
              }}
              title="Watch in Fullscreen Modal"
            >
              <Maximize2 style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {hideAvatar ? (
        <div style={{ marginBottom: 4 }}>{cardContent}</div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {/* AI Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(135deg, #000000, #404040)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            C.
          </div>
          {cardContent}
        </div>
      )}

      {/* Focused Modal Popup */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 780,
              background: "#18181b",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              border: "1px solid #27272a",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid #27272a",
                background: "#09090b",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {video.title}
                </h3>
                <span style={{ fontSize: 11, color: "#a1a1aa" }}>{video.channel}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "#27272a",
                    color: "#ffffff",
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink style={{ width: 12, height: 12 }} />
                  YouTube
                </a>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#27272a",
                    border: "none",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  title="Close (Esc)"
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* 16:9 Modal Video Player */}
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
              {embedUrl ? (
                <iframe
                  src={`${embedUrl}?autoplay=1`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Image Card (Compact Bar + Lightbox Modal) ──────────────────────────────

function ImageCard({ image, hideAvatar = false }: ImageCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const cardContent = (
    <div
      style={{
        maxWidth: hideAvatar ? "100%" : "85%",
        minWidth: 260,
        borderRadius: 14,
        overflow: "hidden",
        border: "1.5px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
      }}
    >
      {/* Thumbnail */}
      <div
        onClick={() => !hasError && setIsModalOpen(true)}
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          overflow: "hidden",
          background: "#f1f5f9",
          flexShrink: 0,
          cursor: hasError ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Click to view full image"
      >
        {hasError ? (
          <ImageIcon style={{ width: 20, height: 20, color: "#9ca3af" }} />
        ) : (
          <img
            src={image.thumbnail || image.url}
            alt={image.title}
            onError={() => setHasError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
          🖼️ Reference Visual {image.source ? `• ${image.source}` : ""}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={image.title}
        >
          {image.title}
        </div>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: "5px 10px",
          borderRadius: 8,
          background: "#f1f5f9",
          border: "1px solid #cbd5e1",
          fontSize: 11,
          fontWeight: 600,
          color: "#334155",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        View
      </button>
    </div>
  );

  return (
    <>
      {hideAvatar ? (
        <div style={{ marginBottom: 4 }}>{cardContent}</div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {/* AI Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(135deg, #000000, #404040)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            C.
          </div>
          {cardContent}
        </div>
      )}

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            padding: 20,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#ffffff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{image.title}</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: "50%",
                }}
              >
                <X style={{ width: 18, height: 18, color: "#64748b" }} />
              </button>
            </div>

            <div style={{ padding: 16, textAlign: "center", overflow: "auto", maxHeight: "75vh" }}>
              <img
                src={image.url || image.thumbnail}
                alt={image.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main MediaCard Component ─────────────────────────────────────────────

export default function MediaCard({
  type,
  searchQuery,
  title,
  trigger,
  thumbnail,
  url,
  embedUrl,
  channel,
  source,
  duration,
  viewCount,
  hideAvatar = false,
}: MediaCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<YouTubeVideo[] | GoogleImage[]>([]);

  useEffect(() => {
    // If pre-fetched data is passed, use it directly without network call
    if (thumbnail || url) {
      setLoading(false);
      return;
    }

    const fetchMedia = async () => {
      if (!searchQuery) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (type === "youtube") {
          const response = await searchYouTubeVideos(searchQuery, 1);
          setMedia(response.results);
        } else {
          const response = await searchGoogleImages(searchQuery, 1);
          setMedia(response.results);
        }
      } catch (err) {
        console.error(`[MediaCard] Failed to fetch ${type}:`, err);
        setError("Failed to load media");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [searchQuery, type, thumbnail, url]);

  // Pre-fetched direct render
  if ((thumbnail || url) && !loading) {
    if (type === "youtube") {
      return (
        <VideoCard
          hideAvatar={hideAvatar}
          video={{
            id: "prefetched",
            title: title || "Educational Video",
            thumbnail: thumbnail || "",
            url: url || "",
            channel: channel || "YouTube",
            duration: duration,
            viewCount: typeof viewCount === "number" ? viewCount : 0,
            embedUrl: embedUrl || url || "",
          }}
        />
      );
    } else {
      return (
        <ImageCard
          hideAvatar={hideAvatar}
          image={{
            id: "prefetched",
            title: title || "Reference Visual",
            thumbnail: thumbnail || url || "",
            url: url || "",
            source: source || "Web",
          }}
        />
      );
    }
  }

  // Compact Pill Skeleton for loading
  if (loading) {
    const skeleton = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: "#f8fafc",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
        }}
      >
        <Loader2 style={{ width: 14, height: 14, color: "#7e22ce", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
          {type === "youtube" ? "Finding relevant video..." : "Searching for visuals..."}
        </span>
      </div>
    );

    if (hideAvatar) {
      return <div style={{ marginBottom: 8 }}>{skeleton}</div>;
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #000000, #404040)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          C.
        </div>
        {skeleton}
      </div>
    );
  }

  if (error || media.length === 0) {
    return null;
  }

  return (
    <>
      {type === "youtube"
        ? (media as YouTubeVideo[]).map((video) => <VideoCard key={video.id} video={video} hideAvatar={hideAvatar} />)
        : (media as GoogleImage[]).map((image) => <ImageCard key={image.id} image={image} hideAvatar={hideAvatar} />)}
    </>
  );
}
