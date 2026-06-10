import { useState, useEffect } from "react";
import { Play, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  searchYouTubeVideos,
  searchGoogleImages,
  YouTubeVideo,
  GoogleImage,
  formatViewCount,
  formatDuration,
} from "@/lib/api/media";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaCardProps {
  type: "youtube" | "image";
  searchQuery?: string;
  title?: string;
  trigger?: "correction" | "teaching" | "user_request";
  // Pre-fetched data (for persisted messages)
  thumbnail?: string;
  url?: string;
  channel?: string;
  source?: string;
}

interface VideoCardProps {
  video: YouTubeVideo;
}

interface ImageCardProps {
  image: GoogleImage;
}

// ─── Video Card ─────────────────────────────────────────────────────────────

function getEmbedUrl(url: string, videoId?: string) {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  
  let id = videoId;
  if (!id || id === "prefetched") {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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

function VideoCard({ video }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getEmbedUrl(video.embedUrl || video.url, video.id);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 16,
      }}
    >
      {/* AI Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
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

      {/* Video Card */}
      <div
        style={{
          maxWidth: "85%",
          minWidth: 280,
          borderRadius: 16,
          overflow: "hidden",
          border: "1.5px solid #e9d5ff",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)",
        }}
      >
        {/* Thumbnail or Video Player */}
        <div
          style={{
            position: "relative",
            minHeight: 180,
            background: "#000",
          }}
        >
          {isPlaying && embedUrl ? (
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                width: "100%",
                height: 180,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Play overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(255,0,0,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Play style={{ width: 28, height: 28, color: "#fff", marginLeft: 4 }} />
                </div>
              </div>
              {/* Duration badge */}
              {video.duration && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.8)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px" }}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 4,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.title}
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            <span>{video.channel}</span>
            <span>•</span>
            <span>{formatViewCount(video.viewCount)}</span>
          </div>
        </div>

        {/* Action */}
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#dc2626",
              color: "#fff",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ExternalLink style={{ width: 14, height: 14 }} />
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Image Card ─────────────────────────────────────────────────────────────

function ImageCard({ image }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 16,
      }}
    >
      {/* AI Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
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

      {/* Image Card */}
      <div
        style={{
          maxWidth: "80%",
          minWidth: 260,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", minHeight: 120, background: "#f9fafb" }}>
          {hasError ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                gap: 8,
                background: "#f9fafb",
              }}
            >
              <ImageIcon style={{ width: 28, height: 28, color: "#9ca3af" }} />
              <span style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>
                Preview not available
              </span>
            </div>
          ) : (
            <>
              {!loaded && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f9fafb",
                  }}
                >
                  <Loader2
                    style={{ width: 18, height: 18, color: "#9ca3af", animation: "spin 1s linear infinite" }}
                  />
                </div>
              )}
              <img
                src={image.thumbnail || image.url}
                alt={image.title}
                onLoad={() => setLoaded(true)}
                onError={() => setHasError(true)}
                style={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "contain",
                  display: loaded ? "block" : "none",
                  margin: "0 auto",
                }}
              />
            </>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "10px 12px" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#1f2937",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            {image.title}
          </p>
          <span style={{ fontSize: 10, color: "#6b7280" }}>
            Source: {image.source}
          </span>
        </div>

        {/* Action */}
        <div
          style={{
            padding: "8px 12px",
            borderTop: "1px solid #f3f4f6",
            background: "#fafafa",
          }}
        >
          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            <ExternalLink style={{ width: 12, height: 12 }} />
            View Full Image
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main MediaCard Component ─────────────────────────────────────────────

export default function MediaCard({ 
  type, 
  searchQuery, 
  title, 
  trigger,
  // Pre-fetched data
  thumbnail,
  url,
  channel,
  source
}: MediaCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<YouTubeVideo[] | GoogleImage[]>([]);

  useEffect(() => {
    // If we already have pre-fetched data, don't fetch again
    if (thumbnail && url) {
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
    const fetchMedia = async () => {
      if (!searchQuery) return;
      
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

  // If we have pre-fetched data, render directly
  if (thumbnail && url && !loading) {
    if (type === "youtube") {
      return (
        <VideoCard 
          video={{ 
            id: 'prefetched',
            title: title || 'Video',
            thumbnail: thumbnail,
            url: url,
            channel: channel || 'YouTube',
            viewCount: 0,
            embedUrl: url
          } as YouTubeVideo} 
        />
      );
    } else {
      return (
        <ImageCard 
          image={{ 
            id: 'prefetched',
            title: title || 'Image',
            thumbnail: thumbnail,
            url: url,
            source: source || 'Web'
          } as GoogleImage} 
        />
      );
    }
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
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
        <div
          style={{
            flex: 1,
            maxWidth: "80%",
            padding: 20,
            background: "#f9fafb",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Loader2 style={{ width: 16, height: 16, color: "#8b5cf6", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {type === "youtube" ? "Finding relevant video..." : "Searching for images..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || media.length === 0) {
    return null; // Silently fail
  }

  // Render cards
  return (
    <>
      {type === "youtube"
        ? (media as YouTubeVideo[]).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))
        : (media as GoogleImage[]).map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
    </>
  );
}

// ─── Add global styles for spin animation ────────────────────────────────────

if (typeof document !== "undefined") {
  const styleId = "mediacard-spin-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}
