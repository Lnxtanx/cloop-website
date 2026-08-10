import React from "react";
import { Volume2 } from "lucide-react";
import { TopicChatMessage } from "@/lib/api/topic-chat";
import { DiffText, stripTags } from "./DiffText";

export function UserBubble({ msg }: { msg: TopicChatMessage }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <div
        style={{
          maxWidth: "65%",
          padding: "10px 16px",
          borderRadius: "18px 18px 4px 18px",
          background: "linear-gradient(135deg, #09090b, #27272a)",
          color: "#fff",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {msg.message}
      </div>
    </div>
  );
}

export function AIBubble({
  msg,
  onOption,
  onSpeak,
  isSpeaking,
}: {
  msg: TopicChatMessage;
  onOption: (v: string) => void;
  onSpeak?: (msg: TopicChatMessage) => void;
  isSpeaking?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
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
      <div style={{ maxWidth: "65%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "18px 18px 18px 4px",
              background: "#f3f4f6",
              color: "#111827",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {msg.message}
          </div>
          {onSpeak && msg.message && msg.message.trim() && (
            <button
              type="button"
              onClick={() => onSpeak(msg)}
              style={{
                background: "transparent",
                border: "none",
                color: isSpeaking ? "#000000" : "#9ca3af",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "all 0.2s",
              }}
              className="hover:bg-zinc-100 hover:text-black focus:outline-none shrink-0"
              title={isSpeaking ? "Stop listening" : "Listen to response"}
            >
              {isSpeaking ? (
                <span className="flex gap-0.5 items-center justify-center h-4 w-4">
                  <span className="w-0.5 h-2 bg-black rounded animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-3.5 bg-black rounded animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-2.5 bg-black rounded animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {msg.options && msg.options.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {msg.options.map((o) => (
              <button
                key={o.value}
                onClick={() => onOption(o.value)}
                style={{
                  textAlign: "left",
                  padding: "8px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  color: "#111827",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                {o.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CorrectionBubble({ msg }: { msg: TopicChatMessage }) {
  const originalText = msg.message ?? "";
  const hasDiff = !!(msg.diff_html && msg.diff_html.trim());
  const diffPlain = hasDiff ? stripTags(msg.diff_html!) : "";
  const diffCoversFullText = hasDiff && originalText.length > 0 ? diffPlain.length >= originalText.length * 0.6 : hasDiff;

  const feedback = msg.feedback;
  const isCorrect = msg.is_correct ?? feedback?.is_correct;
  const scorePct = feedback?.score_percent ?? msg.score_percent;
  const feedbackNote = feedback?.content ?? null;

  let bubbleBackground = "#fff";
  let bubbleBorder = "#e5e7eb";

  if (isCorrect === true) {
    bubbleBackground = "#dcfce7";
    bubbleBorder = "#86efac";
  } else if (isCorrect === false) {
    bubbleBackground = "#fee2e2";
    bubbleBorder = "#fca5a5";
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
      <div style={{ position: "relative", maxWidth: "68%" }}>
        <div
          style={{
            background: bubbleBackground,
            border: `1.5px solid ${bubbleBorder}`,
            borderRadius: 16,
            padding: 14,
            minWidth: 220,
          }}
        >
          {hasDiff ? (
            diffCoversFullText ? (
              <DiffText html={msg.diff_html!} />
            ) : (
              <>
                <span style={{ fontSize: 14 }}>{originalText}</span>
                <div
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    background: "#fafafa",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Corrections:
                  </p>
                  <DiffText html={msg.diff_html!} />
                </div>
              </>
            )
          ) : (
            <span style={{ fontSize: 14 }}>{originalText}</span>
          )}
        </div>

        {msg.emoji && (
          <span
            style={{
              position: "absolute",
              bottom: -10,
              right: 14,
              fontSize: 18,
              background: bubbleBackground,
              borderRadius: "50%",
              padding: "1px 2px",
              lineHeight: 1,
            }}
          >
            {msg.emoji}
          </span>
        )}
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold flex-shrink-0">C</div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-gray-100">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
