import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Volume2, Play, Image as ImageIcon, BarChart2, FileText, Maximize2, ChevronUp, ChevronDown, Sparkles, Brain, Check, X } from "lucide-react";
import { TopicChatMessage } from "@/lib/api/topic-chat";
import { DiffText } from "./DiffText";
import MermaidDiagram from "@/components/MermaidDiagram";
import TextDiagram from "@/components/TextDiagram";
import MediaCard from "@/components/MediaCard";
import { ExamDefinitionCard } from "./ChatCards";
import TopicVideoCard from "./TopicVideoCard";
import { TopicMediaItem } from "@/lib/topicMedia";

/**
 * Lightweight inline markdown renderer for chat messages.
 * Handles: **bold**, *italic*, `code`, and \n line breaks.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      nodes.push(...splitNewlines(before, key));
      key += before.split("\n").length;
    }

    if (match[2]) {
      nodes.push(<strong key={`b${key++}`} style={{ fontWeight: 700 }}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={`i${key++}`}>{match[3]}</em>);
    } else if (match[4]) {
      nodes.push(
        <code
          key={`c${key++}`}
          style={{
            background: "#ede9fe",
            color: "#5b21b6",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: "0.9em",
            fontFamily: "monospace",
          }}
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(...splitNewlines(text.slice(lastIndex), key));
  }

  return nodes;
}

function splitNewlines(text: string, startKey: number): React.ReactNode[] {
  const parts = text.split("\n");
  const result: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i > 0) result.push(<br key={`br${startKey + i}`} />);
    if (part) result.push(part);
  });
  return result;
}

// Detect raw diagram syntax that leaked into a message body (a rendering miss).
// We never want unparsed mermaid/ASCII arrows shown as garbage text — if the model
// failed to put the diagram in its structured block, hide it rather than print it.
export function isRawDiagramText(text: string): boolean {
  if (!text) return false;
  // Node statements like [Label] --> B[Label] or flow of --> arrows
  if (/--[>-]|==>|\.\.->/.test(text) && /\[[^\]]+\]/.test(text)) return true;
  // Blocks of repeated mermaid-ish tokens (A --> B --> C --> D)
  const arrows = (text.match(/--[>-]/g) || []).length;
  if (arrows >= 2) return true;
  // Unicode arrow chains the renderer can't parse (→)
  if ((text.match(/→/g) || []).length >= 2 && /\[[^\]]+\]/.test(text)) return true;
  return false;
}

export function UserBubble({ msg }: { msg: TopicChatMessage }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <div
        style={{
          maxWidth: isMobile ? "85%" : "70%",
          padding: isMobile ? "10px 14px" : "13px 18px",
          borderRadius: "18px 18px 4px 18px",
          background: "#ffffff",
          border: "1.5px solid #7c3aed",
          color: "#0f172a",
          fontSize: 15.5,
          fontWeight: 500,
          lineHeight: 1.6,
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
        }}
      >
        {renderInlineMarkdown(msg.message || "")}
      </div>
    </div>
  );
}

export interface AIAttachments {
  mermaidDiagram?: {
    code: string;
    title?: string;
    trigger?: "correction" | "teaching" | "user_request" | "visual_explanation";
  } | null;
  textDiagram?: {
    code: string;
    title?: string;
    diagramType?: "ascii" | "tree" | "arrow" | "table";
    trigger?: "correction" | "teaching" | "user_request" | "visual_explanation";
  } | null;
  youtubeVideo?: {
    title?: string;
    searchQuery?: string;
    url?: string;
    embedUrl?: string;
    thumbnail?: string;
    channel?: string;
    duration?: string;
    viewCount?: number | string;
    trigger?: "correction" | "teaching" | "user_request" | "visual_explanation";
  } | null;
  googleImage?: {
    title?: string;
    searchQuery?: string;
    url?: string;
    thumbnail?: string;
    source?: string;
    trigger?: "correction" | "teaching" | "user_request" | "visual_explanation";
  } | null;
  examDefinition?: {
    term: string;
    definition: string;
    plain_english?: string;
    formula?: string | null;
    units?: string | null;
    title?: string;
  } | null;
  topicVideo?: TopicMediaItem | null;
}

export function AIBubble({
  msg,
  attachments,
  onOption,
  onSpeak,
  isSpeaking,
  hideAvatar = false,
  topicVideo,
}: {
  msg: TopicChatMessage;
  attachments?: AIAttachments;
  onOption: (v: string) => void;
  onSpeak?: (msg: TopicChatMessage) => void;
  isSpeaking?: boolean;
  hideAvatar?: boolean;
  topicVideo?: TopicMediaItem | null;
}) {
  const isMobile = useIsMobile();
  const currentTopicVideo = topicVideo ?? attachments?.topicVideo ?? null;
  // Extract all available media options
  const diagram = attachments?.mermaidDiagram || msg.mermaid_diagram || (msg.metadata?.mermaid_diagram?.code ? {
    code: msg.metadata.mermaid_diagram.code,
    title: msg.metadata.mermaid_diagram.title || "Concept Diagram",
    trigger: msg.metadata.mermaid_diagram.trigger || "teaching",
  } : null);

  const textDiag = attachments?.textDiagram || (msg.text_diagram ? {
    code: msg.text_diagram.code,
    title: msg.text_diagram.title,
    diagramType: msg.text_diagram.diagram_type,
    trigger: msg.text_diagram.trigger,
  } : null) || (msg.metadata?.text_diagram?.code ? {
    code: msg.metadata.text_diagram.code,
    title: msg.metadata.text_diagram.title || "Quick Reference",
    diagramType: msg.metadata.text_diagram.diagram_type || "ascii",
    trigger: msg.metadata.text_diagram.trigger || "teaching",
  } : null);

  const video = attachments?.youtubeVideo || (msg.youtube_video ? {
    title: msg.youtube_video.title,
    searchQuery: msg.youtube_video.search_query,
    url: (msg as any).videos?.[0]?.url,
    embedUrl: (msg as any).videos?.[0]?.embedUrl,
    thumbnail: (msg as any).videos?.[0]?.thumbnail,
    channel: (msg as any).videos?.[0]?.channel,
    duration: (msg as any).videos?.[0]?.duration,
    viewCount: (msg as any).videos?.[0]?.viewCount,
    trigger: msg.youtube_video.trigger,
  } : (msg as any).videos?.[0] ? {
    title: (msg as any).videos[0].title || "Educational Video",
    url: (msg as any).videos[0].url,
    embedUrl: (msg as any).videos[0].embedUrl,
    thumbnail: (msg as any).videos[0].thumbnail,
    channel: (msg as any).videos[0].channel,
    duration: (msg as any).videos[0].duration,
  } : null);

  const image = attachments?.googleImage || (msg.google_image ? {
    title: msg.google_image.title,
    searchQuery: msg.google_image.search_query,
    url: (msg as any).images?.[0]?.url,
    thumbnail: (msg as any).images?.[0]?.thumbnail,
    source: (msg as any).images?.[0]?.source,
    trigger: msg.google_image.trigger,
  } : (msg as any).images?.[0] ? {
    title: (msg as any).images[0].title || "Visual Reference",
    url: (msg as any).images[0].url,
    thumbnail: (msg as any).images[0].thumbnail,
    source: (msg as any).images[0].source,
  } : null);

  const hasDiagram = !!diagram?.code;
  const hasTextDiagram = !!textDiag?.code;
  const hasVideo = !!(video?.url || video?.embedUrl || video?.title || video?.searchQuery);
  const hasImage = !!(image?.url || image?.thumbnail || image?.title || image?.searchQuery);
  const examDef = attachments?.examDefinition || (msg.metadata?.exam_definition ? msg.metadata.exam_definition : null) || msg.exam_definition;
  const hasExamDef = !!(examDef?.term && examDef?.definition);

  const hasAnyMedia = hasDiagram || hasVideo || hasImage || hasTextDiagram || hasExamDef;

  // Active media tab state: default to diagram if triggered for visual explanation
  const [activeMedia, setActiveMedia] = useState<"diagram" | "video" | "image" | "text_diagram" | "exam_definition" | null>(() => {
    if (diagram?.trigger === "visual_explanation" || msg.mermaid_diagram?.trigger === "visual_explanation") {
      return "diagram";
    }
    return null;
  });

  const toggleMedia = (tab: "diagram" | "video" | "image" | "text_diagram" | "exam_definition") => {
    setActiveMedia((prev) => (prev === tab ? null : tab));
  };

  const bubbleCard = (
    <div
      style={{
        maxWidth: hideAvatar ? "100%" : (isMobile ? "100%" : "85%"),
        minWidth: isMobile ? 0 : (currentTopicVideo ? 360 : 280),
        width: currentTopicVideo ? (isMobile ? "100%" : "100%") : "fit-content",
        borderRadius: 18,
        background: "#ffffff",
        border: "1.5px solid #e9d5ff",
        boxShadow: "0 2px 12px rgba(124, 58, 237, 0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
      }}
    >
      {/* 0. Dedicated Topic Concept Animation / Video (if matched for this topic) */}
      {currentTopicVideo && (
        <TopicVideoCard media={currentTopicVideo} defaultExpanded={true} />
      )}

      {/* 1. Main Text & TTS Audio Row */}
      <div
        style={{
          padding: isMobile ? "10px 12px" : "14px 20px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          background: "#ffffff",
        }}
      >
        <div style={{ flex: 1, color: "#1e1b4b", fontSize: isMobile ? 15 : 16.5, lineHeight: 1.65 }}>
          {isRawDiagramText(msg.message || "") ? null : renderInlineMarkdown(msg.message || "")}
        </div>

        {onSpeak && msg.message && msg.message.trim() && (
          <button
            type="button"
            onClick={() => onSpeak(msg)}
            style={{
              background: isSpeaking ? "#f3e8ff" : "transparent",
              border: "none",
              color: isSpeaking ? "#7e22ce" : "#9ca3af",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              flexShrink: 0,
              marginTop: -2,
              transition: "all 0.2s ease",
            }}
            className="hover:bg-purple-50 hover:text-purple-700 focus:outline-none"
            title={isSpeaking ? "Stop listening" : "Listen to explanation"}
          >
            {isSpeaking ? (
              <span className="flex gap-0.5 items-center justify-center h-4 w-4">
                <span className="w-0.5 h-2 bg-purple-700 rounded animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-0.5 h-3.5 bg-purple-700 rounded animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-0.5 h-2.5 bg-purple-700 rounded animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* 2. Interactive Media Options Pills Bar (In-Bubble) */}
      {hasAnyMedia && (
        <div
          style={{
            padding: "0 14px 10px 14px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {/* Diagram Pill */}
          {hasDiagram && (
            <button
              type="button"
              onClick={() => toggleMedia("diagram")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: activeMedia === "diagram" ? 700 : 600,
                cursor: "pointer",
                border: activeMedia === "diagram" ? "1.5px solid #a855f7" : "1px solid #e9d5ff",
                background: activeMedia === "diagram" ? "#f3e8ff" : "#faf5ff",
                color: activeMedia === "diagram" ? "#6b21a8" : "#7e22ce",
                boxShadow: activeMedia === "diagram" ? "0 1px 4px rgba(168, 85, 247, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
              title="Toggle Concept Diagram"
            >
              <BarChart2 style={{ width: 13, height: 13 }} />
              <span>Concept Diagram</span>
              {activeMedia === "diagram" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7e22ce" }} />
              )}
            </button>
          )}

          {/* YouTube Video Pill */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => toggleMedia("video")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: activeMedia === "video" ? 700 : 600,
                cursor: "pointer",
                border: activeMedia === "video" ? "1.5px solid #ef4444" : "1px solid #fecaca",
                background: activeMedia === "video" ? "#fee2e2" : "#fff5f5",
                color: activeMedia === "video" ? "#b91c1c" : "#dc2626",
                boxShadow: activeMedia === "video" ? "0 1px 4px rgba(239, 68, 68, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
              title="Toggle YouTube Video"
            >
              <Play style={{ width: 12, height: 12, fill: activeMedia === "video" ? "#b91c1c" : "#dc2626" }} />
              <span>YouTube Video</span>
              {video?.duration && (
                <span style={{ fontSize: 11, opacity: 0.85 }}>• {video.duration}</span>
              )}
              {activeMedia === "video" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b91c1c" }} />
              )}
            </button>
          )}

          {/* Google Image Pill */}
          {hasImage && (
            <button
              type="button"
              onClick={() => toggleMedia("image")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: activeMedia === "image" ? 700 : 600,
                cursor: "pointer",
                border: activeMedia === "image" ? "1.5px solid #3b82f6" : "1px solid #bfdbfe",
                background: activeMedia === "image" ? "#eff6ff" : "#f8fafc",
                color: activeMedia === "image" ? "#1d4ed8" : "#2563eb",
                boxShadow: activeMedia === "image" ? "0 1px 4px rgba(59, 130, 246, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
              title="Toggle Visual Reference"
            >
              <ImageIcon style={{ width: 13, height: 13 }} />
              <span>Google Image</span>
              {activeMedia === "image" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1d4ed8" }} />
              )}
            </button>
          )}

          {/* Text Diagram Pill */}
          {hasTextDiagram && (
            <button
              type="button"
              onClick={() => toggleMedia("text_diagram")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: activeMedia === "text_diagram" ? 700 : 600,
                cursor: "pointer",
                border: activeMedia === "text_diagram" ? "1.5px solid #a21caf" : "1px solid #f5d0fe",
                background: activeMedia === "text_diagram" ? "#fdf4ff" : "#faf5ff",
                color: activeMedia === "text_diagram" ? "#86198f" : "#a21caf",
                boxShadow: activeMedia === "text_diagram" ? "0 1px 4px rgba(162, 28, 175, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
              title="Toggle Quick Reference Diagram"
            >
              <FileText style={{ width: 13, height: 13 }} />
              <span>Quick Reference</span>
              {activeMedia === "text_diagram" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#86198f" }} />
              )}
            </button>
          )}

          {/* Write This Down (Exam Definition) Pill */}
          {hasExamDef && (
            <button
              type="button"
              onClick={() => toggleMedia("exam_definition")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: activeMedia === "exam_definition" ? 700 : 600,
                cursor: "pointer",
                border: activeMedia === "exam_definition" ? "1.5px solid #db2777" : "1px solid #fbcfe8",
                background: activeMedia === "exam_definition" ? "#fdf2f8" : "#fdf2f8",
                color: activeMedia === "exam_definition" ? "#9d174d" : "#db2777",
                boxShadow: activeMedia === "exam_definition" ? "0 1px 4px rgba(219, 39, 119, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
              title="Toggle Write This Down"
            >
              <span>✍️ Write this down</span>
              {activeMedia === "exam_definition" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#9d174d" }} />
              )}
            </button>
          )}
        </div>
      )}

      {/* 3. Integrated Inline Preview Drawer (Docked inside Bubble) */}
      {activeMedia && (
        <div
          style={{
            borderTop: "1px solid #e9d5ff",
            background: "#faf5ff",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Drawer Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#581c87" }}>
              {activeMedia === "diagram" && (diagram?.title || "Concept Diagram")}
              {activeMedia === "video" && (video?.title || "Video Explanation")}
              {activeMedia === "image" && (image?.title || "Visual Reference")}
              {activeMedia === "text_diagram" && (textDiag?.title || "Quick Reference")}
              {activeMedia === "exam_definition" && (examDef?.term || "Write this down")}
            </span>
            <button
              type="button"
              onClick={() => setActiveMedia(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                borderRadius: 6,
                border: "1px solid #d8b4fe",
                background: "#ffffff",
                fontSize: 10,
                fontWeight: 600,
                color: "#6b21a8",
                cursor: "pointer",
              }}
              title="Collapse preview"
            >
              <ChevronUp style={{ width: 11, height: 11 }} />
              <span>Hide</span>
            </button>
          </div>

          {/* Render Active Component */}
          {activeMedia === "diagram" && diagram?.code && (
            <MermaidDiagram
              code={diagram.code}
              title={diagram.title || "Concept Diagram"}
              trigger={diagram.trigger || "teaching"}
              hideAvatar={true}
            />
          )}

          {activeMedia === "video" && (
            <MediaCard
              type="youtube"
              title={video?.title || "Educational Video"}
              searchQuery={video?.searchQuery}
              url={video?.url}
              embedUrl={video?.embedUrl}
              thumbnail={video?.thumbnail}
              channel={video?.channel}
              duration={video?.duration}
              viewCount={video?.viewCount}
              trigger={video?.trigger || "teaching"}
              hideAvatar={true}
            />
          )}

          {activeMedia === "image" && (
            <MediaCard
              type="image"
              title={image?.title || "Visual Reference"}
              searchQuery={image?.searchQuery}
              url={image?.url}
              thumbnail={image?.thumbnail}
              source={image?.source}
              trigger={image?.trigger || "teaching"}
              hideAvatar={true}
            />
          )}

          {activeMedia === "text_diagram" && textDiag?.code && (
            <TextDiagram
              code={textDiag.code}
              title={textDiag.title || "Quick Reference"}
              diagramType={textDiag.diagramType || "ascii"}
              trigger={textDiag.trigger || "teaching"}
              hideAvatar={true}
            />
          )}

          {activeMedia === "exam_definition" && examDef?.term && examDef?.definition && (
            <ExamDefinitionCard
              data={{
                term: examDef.term,
                definition: examDef.definition,
                plain_english: examDef.plain_english || "",
                formula: examDef.formula || null,
                units: examDef.units || null,
              }}
              defaultOpen
            />
          )}
        </div>
      )}

      {/* 4. Multiple Choice Options (if present) */}
      {Array.isArray(msg.options) && msg.options.some((o) => o && ((o.value ?? o.text) || "").trim()) ? (
        <div
          style={{
            padding: "10px 14px 12px 14px",
            borderTop: "1px solid #f3e8ff",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {msg.options
            .filter((o) => o && ((o.text ?? o.value) || "").trim())
            .map((o) => {
              const optAny = o as any;
              const optionLabel: string = typeof optAny === "string" ? optAny : (optAny?.text || optAny?.value || "");
              const optionAnswer = optionLabel.trim();
              return (
                <button
                  key={optionLabel}
                  onClick={() => onOption(optionAnswer)}
                  style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #e9d5ff",
                    background: "#faf5ff",
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: "#4c1d95",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ede9fe";
                    e.currentTarget.style.borderColor = "#c084fc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#faf5ff";
                    e.currentTarget.style.borderColor = "#e9d5ff";
                  }}
                >
                  {optionLabel}
                </button>
              );
            })}
        </div>
      ) : null}
    </div>
  );

  if (hideAvatar) {
    return bubbleCard;
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
      {/* AI Tutor Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 11,
          fontWeight: 800,
          marginTop: 2,
          boxShadow: "0 2px 6px rgba(124, 58, 237, 0.2)",
        }}
      >
        C.
      </div>
      {bubbleCard}
    </div>
  );
}

export function CorrectionBubble({ msg }: { msg: TopicChatMessage }) {
  const isMobile = useIsMobile();
  const originalText = msg.message?.trim() || "";
  // Only show a "Corrections" annotation when diff_html is a real <del>/<ins>
  // strikethrough. A plain-text diff_html is grader commentary (e.g. "The student's
  // answer does not address...") that must NEVER surface in the corrections box.
  const hasDiff = !!(msg.diff_html && msg.diff_html.trim() && /<del>|<ins>/.test(msg.diff_html));
  // The clean corrected answer. On live responses it rides on `complete_answer`; it is
  // only ever shown as an annotation below the user's own words — never as a replacement
  // for the user's raw text, so the transcript stays trustworthy.
  const correctedText = msg.complete_answer?.trim() || "";
  // The model emits emoji together with a label (e.g. "😊 correct"), but we want to
  // show ONLY the emoji glyph(s) in the bubble — strip any trailing words.
  const emojiOnly = (msg.emoji || "").match(
    /(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\u200d\p{Extended_Pictographic})*|\p{Emoji_Component}(?!\p{Number})|\u200b\u200b?)+/gu
  )?.join("") || (msg.emoji || "").trim();

  const feedback = msg.feedback;
  const isCorrect = msg.is_correct ?? feedback?.is_correct;
  const scorePct = feedback?.score_percent ?? msg.score_percent;
  const feedbackNote = feedback?.content ?? null;

  let bubbleBackground = "#ffffff";
  let bubbleBorder = "#7c3aed";
  let textColor = "#0f172a";

  if (isCorrect === true) {
    bubbleBackground = "#f0fdf4";
    bubbleBorder = "#86efac";
    textColor = "#14532d";
  } else if (isCorrect === false) {
    bubbleBackground = "#fef2f2";
    bubbleBorder = "#fca5a5";
    textColor = "#7f1d1d";
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
      <div style={{ position: "relative", maxWidth: isMobile ? "85%" : "70%" }}>
        <div
          style={{
            background: bubbleBackground,
            border: `1.5px solid ${bubbleBorder}`,
            borderRadius: "18px 18px 4px 18px",
            padding: isMobile ? "10px 14px" : "13px 18px",
            minWidth: isMobile ? 0 : 220,
            boxShadow:
              isCorrect !== undefined && isCorrect !== null
                ? "0 2px 8px rgba(0, 0, 0, 0.04)"
                : "0 2px 8px rgba(124, 58, 237, 0.08)",
          }}
        >
          {/* Primary: the student's ORIGINAL words, verbatim. The AI's rewrite is
              presented as a clearly-labelled "Corrections" annotation beneath it. */}
          <span style={{ fontSize: 15.5, lineHeight: 1.6, fontWeight: 500, color: textColor }}>
            {renderInlineMarkdown(originalText || correctedText)}
          </span>

          {hasDiff && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 12px",
                background: bubbleBackground === "#f0fdf4" ? "#ecfdf5" : "#fff1f2",
                border: `1px solid ${isCorrect === true ? "#a7f3d0" : "#fecdd3"}`,
                borderRadius: 8,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Corrections:
              </p>
              <DiffText html={msg.diff_html!} />
            </div>
          )}
        </div>

        {emojiOnly && (
          <span
            style={{
              position: "absolute",
              bottom: -8,
              right: 12,
              fontSize: 18,
              background: bubbleBackground,
              borderRadius: "50%",
              padding: "1px 3px",
              lineHeight: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            {emojiOnly}
          </span>
        )}
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 mb-4 animate-in fade-in duration-300">
      {/* Cloop AI Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 11,
          fontWeight: 800,
          boxShadow: "0 2px 6px rgba(124, 58, 237, 0.2)",
          marginBottom: 2,
        }}
      >
        C.
      </div>

      {/* Typing Bubble with 3 Waving Dots */}
      <div
        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-purple-200/80 shadow-xs"
        style={{
          minHeight: 38,
        }}
      >
        <span
          className="typing-dot-wave inline-block w-2 h-2 rounded-full bg-purple-600"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="typing-dot-wave inline-block w-2 h-2 rounded-full bg-purple-600"
          style={{ animationDelay: "180ms" }}
        />
        <span
          className="typing-dot-wave inline-block w-2 h-2 rounded-full bg-purple-600"
          style={{ animationDelay: "360ms" }}
        />
      </div>
    </div>
  );
}

export function CompactThoughtBadge({
  thoughtMeta,
  attachments,
}: {
  thoughtMeta?: {
    duration_ms?: number;
    reasoning?: string;
    phase?: string;
    tools_called?: string[];
  } | null;
  attachments?: AIAttachments | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasTools = !!(
    attachments?.mermaidDiagram ||
    attachments?.textDiagram ||
    attachments?.youtubeVideo ||
    attachments?.googleImage ||
    attachments?.examDefinition ||
    (thoughtMeta?.tools_called && thoughtMeta.tools_called.length > 0)
  );

  const durationSec = thoughtMeta?.duration_ms
    ? (thoughtMeta.duration_ms / 1000).toFixed(1)
    : null;

  const badgeLabel = durationSec
    ? `Thought for ${durationSec}s`
    : "Thinking";

  return (
    <div className="mb-1 self-start">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100/70 hover:bg-slate-200/70 border border-slate-200/60 transition-colors"
        style={{ height: 22 }}
        title="View tutor reasoning and tools"
      >
        <Sparkles className="w-3 h-3 text-purple-600" />
        <span className="font-mono">{badgeLabel}</span>
        {hasTools && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-1.5 p-2.5 rounded-lg bg-slate-50/95 border border-slate-200/80 text-[11.5px] text-slate-600 max-w-md shadow-xs animate-in fade-in duration-150">
          <div className="flex flex-col gap-1.5 font-mono text-[11px] text-slate-500">
            {thoughtMeta?.phase && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Phase:</span>
                <span className="font-semibold text-purple-700">{thoughtMeta.phase}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Syllabus Grounding:</span>
              <span className="text-emerald-700">Verified & Grounded</span>
            </div>
            {hasTools && (
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                <span className="text-slate-400">Tools:</span>
                {attachments?.mermaidDiagram && (
                  <span className="px-1.5 py-0.5 bg-purple-100/80 text-purple-700 rounded text-[10px]">
                    Concept Diagram
                  </span>
                )}
                {attachments?.youtubeVideo && (
                  <span className="px-1.5 py-0.5 bg-red-100/80 text-red-700 rounded text-[10px]">
                    Video Reference
                  </span>
                )}
                {attachments?.googleImage && (
                  <span className="px-1.5 py-0.5 bg-blue-100/80 text-blue-700 rounded text-[10px]">
                    Visual Image
                  </span>
                )}
                {attachments?.examDefinition && (
                  <span className="px-1.5 py-0.5 bg-pink-100/80 text-pink-700 rounded text-[10px]">
                    Exam Definition
                  </span>
                )}
              </div>
            )}
            {thoughtMeta?.reasoning && (
              <p className="mt-1 text-slate-600 font-sans italic text-[11.5px] border-l-2 border-purple-300 pl-2">
                "{thoughtMeta.reasoning}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
