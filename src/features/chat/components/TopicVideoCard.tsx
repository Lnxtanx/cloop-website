import { useState, useEffect, useRef } from "react";
import { Play, Maximize2, ChevronUp, Volume2, VolumeX } from "lucide-react";
import { TopicMediaItem } from "@/lib/topicMedia";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopicVideoCardProps {
  media: TopicMediaItem;
  defaultExpanded?: boolean;
}

export default function TopicVideoCard({
  media,
  defaultExpanded = true,
}: TopicVideoCardProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play with voice/audio
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try unmuted autoplay first
    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsMuted(false);
        })
        .catch(() => {
          // If browser blocks unmuted autoplay without previous user interaction,
          // play muted and immediately unmute on first user click anywhere.
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});

          const handleUserInteraction = () => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              setIsMuted(false);
              videoRef.current.play().catch(() => {});
            }
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("keydown", handleUserInteraction);
            window.removeEventListener("touchstart", handleUserInteraction);
          };

          window.addEventListener("click", handleUserInteraction, { once: true });
          window.addEventListener("keydown", handleUserInteraction, { once: true });
          window.addEventListener("touchstart", handleUserInteraction, { once: true });
        });
    }
  }, [media.url]);

  // Native Full Screen request
  const handleFullScreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    } else if ((el as any).msRequestFullscreen) {
      (el as any).msRequestFullscreen();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "14px 14px 0 0",
        background: "#ffffff",
        borderBottom: "1.5px solid #e9d5ff",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(124, 58, 237, 0.04)",
      }}
    >
      {/* ─── Clean Header Bar (No Badge, Clean Heading Only) ─────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "8px 12px" : "10px 16px",
          background: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
          borderBottom: isExpanded ? "1px solid #e9d5ff" : "none",
        }}
      >
        <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
          <h3
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : 15.5,
              fontWeight: 700,
              color: "#3b0764",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={media.title}
          >
            {media.title}
          </h3>
        </div>

        {/* Action Controls: Full Screen & Hide */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {isExpanded && (
            <button
              type="button"
              onClick={handleFullScreen}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 9px",
                borderRadius: 8,
                background: "#ffffff",
                border: "1px solid #d8b4fe",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#6b21a8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Full Screen"
            >
              <Maximize2 style={{ width: 12, height: 12 }} />
              <span>Full Screen</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 9px",
              borderRadius: 8,
              background: "#ffffff",
              border: "1px solid #d8b4fe",
              fontSize: 11.5,
              fontWeight: 600,
              color: "#6b21a8",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title={isExpanded ? "Collapse video" : "Watch video"}
          >
            {isExpanded ? (
              <>
                <ChevronUp style={{ width: 12, height: 12 }} />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Play style={{ width: 11, height: 11, fill: "#6b21a8" }} />
                <span>Watch Animation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Video Player Container ──────────────────────────────────── */}
      {isExpanded && (
        <div
          style={{
            position: "relative",
            width: "100%",
            background: "#000000",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%", // 16:9 standard aspect ratio
              height: 0,
              background: "#000000",
            }}
          >
            <video
              ref={videoRef}
              src={media.url}
              autoPlay
              controls
              playsInline
              preload="auto"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000000",
              }}
            >
              Your browser does not support the video tag.
            </video>

            {/* Tap to Unmute Overlay Button (shows only if browser blocked initial unmuted autoplay) */}
            {isMuted && (
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  position: "absolute",
                  bottom: 50,
                  right: 14,
                  zIndex: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "rgba(107, 33, 168, 0.9)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(4px)",
                }}
                title="Unmute Audio"
              >
                <VolumeX style={{ width: 14, height: 14 }} />
                <span>Tap to Unmute</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
