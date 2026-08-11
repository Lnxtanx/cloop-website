import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock, Loader2, Send,
  X, Mic, MicOff, Volume2, VolumeX,
} from "lucide-react";
import {
  fetchTopicChatMessages, sendTopicChatMessage, updateTopicTime,
  TopicChatMessage, TopicGoal, TopicChatResponse,
  SendMessageResponse, SessionSummaryData, ScorePrediction,
} from "@/lib/api/topic-chat";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import DashboardLayout from "@/layouts/DashboardLayout";
import MermaidDiagram from "@/components/MermaidDiagram";
import TextDiagram from "@/components/TextDiagram";
import MediaCard from "@/components/MediaCard";
import { useToast } from "@/hooks/use-toast";

// Sub-components
import { UserBubble, AIBubble, CorrectionBubble, TypingDots } from "./components/ChatBubbles";
import { SummaryCard, SessionSummaryCard, ScorePredictionCard, InternetLinkCard, GoalRevisionCard, LearningReportCard, AISummaryCard } from "./components/ChatCards";
import { GoalsBar } from "./components/GoalsBar";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function mergeMessages(userMsgs: TopicChatMessage[], aiMsgs: TopicChatMessage[]) {
  const m = new Map<string | number, TopicChatMessage>();
  const all = [...(userMsgs || []), ...(aiMsgs || [])];

  all.forEach((x, index) => {
    const id = (x.id !== undefined && x.id !== null && !isNaN(Number(x.id)))
      ? Number(x.id)
      : `temp-${index}-${x.created_at || Date.now()}`;

    if (!m.has(id)) {
      m.set(id, x);
    } else {
      const existing = m.get(id)!;
      const xScore = (x.diff_html ? 2 : 0) + (x.sender ? 1 : 0) + (x.message_type ? 1 : 0);
      const existingScore = (existing.diff_html ? 2 : 0) + (existing.sender ? 1 : 0) + (existing.message_type ? 1 : 0);

      if (xScore >= existingScore) {
        m.set(id, x);
      }
    }
  });

  return [...m.values()].sort(
    (x, y) => new Date(x.created_at || 0).getTime() - new Date(y.created_at || 0).getTime()
  );
}

export default function TopicChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTopicId = searchParams.get("topicId");
  const topicId = rawTopicId ? Number(rawTopicId) : 0;
  const topicTitle = searchParams.get("topicTitle") ?? "Topic Chat";
  const chapterTitle = searchParams.get("chapterTitle") ?? "";
  const subjectName = searchParams.get("subjectName") ?? "";

  const [messages, setMessages] = useState<TopicChatMessage[]>([]);
  const [goals, setGoals] = useState<TopicGoal[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [goalsOpen, setGoalsOpen] = useState(true);
  const [baseTime, setBaseTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  // Voice Assistant Hook
  const handleAutoSend = useCallback(async (text: string) => {
    await handleSend(text);
  }, []);

  const {
    isVoiceEnabled,
    setIsVoiceEnabled,
    speakingMessageId,
    isListening,
    isWaitingToSend,
    isSpeechSupported,
    toggleListening,
    cancelAutoSend,
    speak,
  } = useVoiceAssistant({
    setInput,
    inputRef,
    onAutoSend: handleAutoSend,
    autoListenAfterSpeak: false,
  });

  // Timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(baseTime + Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [baseTime]);

  // Load chat
  const loadChat = useCallback(async () => {
    if (!topicId) {
      setError("No topicId specified.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res: TopicChatResponse = await fetchTopicChatMessages(topicId);
      const combined = mergeMessages(res.messages || [], res.aiMessages || []);
      setMessages(combined);
      setGoals(res.goals || []);
      setBaseTime(res.topic?.time_spent_seconds ?? 0);
      setDone(res.topic?.is_completed ?? false);
    } catch (e: any) {
      setError(e.message || "Failed to load chat.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [topicId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // Save time on unmount / navigate away
  const saveTime = useCallback(() => {
    if (!topicId || elapsed <= 0) return;
    updateTopicTime(topicId, elapsed).catch(() => {});
  }, [topicId, elapsed]);

  useEffect(() => {
    const handleUnload = () => saveTime();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      saveTime();
    };
  }, [saveTime]);

  // Send message
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending || done || !topicId) return;

    if (!overrideText) setInput("");
    setSending(true);

    const tempUserMsg: TopicChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      message: text,
      message_type: "text",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res: SendMessageResponse = await sendTopicChatMessage(topicId, {
        message: text,
        session_time_seconds: elapsed,
      });

      if (res.goals) setGoals(res.goals);
      if (res.all_goals_completed) setDone(true);

      if (res.userCorrection) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempUserMsg.id
              ? {
                  ...m,
                  id: res.userMessage?.id || m.id,
                  message_type: "user_correction",
                  diff_html: res.userCorrection?.diff_html,
                  emoji: res.userCorrection?.emoji,
                  feedback: res.userCorrection?.feedback,
                }
              : m
          )
        );
      }

      const newAiMsgs = res.aiMessages || res.messages || [];
      if (newAiMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newAiMsgs]);

        // Speak aloud if Voice is enabled
        if (isVoiceEnabled && newAiMsgs[0]?.message) {
          speak({
            id: newAiMsgs[0].id,
            message: newAiMsgs[0].message,
            message_type: newAiMsgs[0].message_type,
          });
        }
      }
    } catch (e: any) {
      toast({
        title: "Failed to send message",
        description: e.message || "Please check your internet connection.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <DashboardLayout title={topicTitle} mainClassName="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden bg-slate-50">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f8fafc" }}>
        {/* Sub-header Bar with Voice Toggle & Timer */}
        <div
          style={{
            padding: "10px 20px",
            background: "#faf5ff",
            borderBottom: "1px solid #e9d5ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {subjectName} {chapterTitle ? `• ${chapterTitle}` : ""}
            </div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: "#581c87", margin: 0 }} className="truncate">
              {topicTitle}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* Voice Toggle */}
            <button
              type="button"
              onClick={() => setIsVoiceEnabled((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: isVoiceEnabled ? "#7e22ce" : "#f3e8ff",
                color: isVoiceEnabled ? "#ffffff" : "#6b21a8",
              }}
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isVoiceEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            {/* Timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: "#f3e8ff",
                color: "#6b21a8",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Clock style={{ width: 14, height: 14, color: "#7e22ce" }} />
              {fmt(elapsed)}
            </div>

            <button
              onClick={() => {
                saveTime();
                navigate(-1);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e9d5ff",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 16, height: 16, color: "#6b21a8" }} />
            </button>
          </div>
        </div>

        {/* Goals Bar */}
        {!loading && goals.length > 0 && <GoalsBar goals={goals} open={goalsOpen} onToggle={() => setGoalsOpen((p) => !p)} />}

        {/* Chat Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
              <p style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>Loading topic chat...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#ef4444", fontWeight: 700, marginBottom: 12 }}>{error}</p>
              <button
                onClick={loadChat}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              {messages.map((msg, idx) => {
                // User Correction / Diff
                if (msg.message_type === "user_correction" || (msg.sender === "user" && msg.diff_html)) {
                  return <CorrectionBubble key={msg.id ?? idx} msg={msg} />;
                }

                // Pure User Message
                if (msg.sender === "user") {
                  return <UserBubble key={msg.id ?? idx} msg={msg} />;
                }

                // Session Summary Card (end-of-session metrics)
                if (msg.message_type === "session_summary") {
                  let summaryData = (msg as any).session_summary;
                  if (!summaryData && msg.diff_html) {
                    try { summaryData = JSON.parse(msg.diff_html); } catch {}
                  }
                  if (summaryData) {
                    return <SessionSummaryCard key={msg.id ?? idx} data={summaryData} message={msg.message} />;
                  }
                }

                // Score Prediction Card
                if (msg.message_type === "score_prediction" && msg.metadata?.score_prediction) {
                  return <ScorePredictionCard key={msg.id ?? idx} data={msg.metadata.score_prediction} />;
                }

                // Internet Link Card
                if (msg.message_type === "internet_link") {
                  return <InternetLinkCard key={msg.id ?? idx} diffHtml={msg.diff_html} />;
                }

                // Goal Revision Card
                if (msg.message_type === "goal_revision") {
                  return <GoalRevisionCard key={msg.id ?? idx} diffHtml={msg.diff_html} />;
                }

                // Session Learning Report Card / AI Summary
                if (
                  msg.message_type === "learning_report" ||
                  (msg.sender === "ai" && (msg.message?.trim().startsWith('{"summary"') || msg.message?.trim().startsWith('{"title"')))
                ) {
                  return <AISummaryCard key={msg.id ?? idx} text={msg.diff_html || msg.message} />;
                }

                if (msg.message_type === "learning_report") {
                  return <LearningReportCard key={msg.id ?? idx} diffHtml={msg.diff_html} />;
                }

                // Mermaid Diagram
                if (msg.message_type === "mermaid_diagram") {
                  let code = msg.metadata?.mermaid_diagram?.code || "";
                  let title = msg.metadata?.mermaid_diagram?.title || "Diagram";
                  if (!code && msg.diff_html) {
                    try {
                      const parsed = JSON.parse(msg.diff_html);
                      code = parsed.code || msg.diff_html;
                      if (parsed.title) title = parsed.title;
                    } catch {
                      code = msg.diff_html;
                    }
                  }
                  return <MermaidDiagram key={msg.id ?? idx} code={code} title={title} />;
                }

                // Text Diagram
                if (msg.message_type === "text_diagram") {
                  let code = msg.metadata?.text_diagram?.code || "";
                  let title = msg.metadata?.text_diagram?.title || "Quick Reference";
                  let diagramType: "ascii" | "tree" | "arrow" | "table" = msg.metadata?.text_diagram?.diagram_type || "ascii";
                  if (!code && msg.diff_html) {
                    try {
                      const parsed = JSON.parse(msg.diff_html);
                      code = parsed.code || msg.diff_html;
                      if (parsed.diagram_type) diagramType = parsed.diagram_type;
                      if (parsed.title) title = parsed.title;
                    } catch {
                      code = msg.diff_html;
                    }
                  }
                  return <TextDiagram key={msg.id ?? idx} code={code} title={title} diagramType={diagramType} />;
                }

                // Media Card (YouTube / Google Image)
                if (msg.message_type === "youtube_video" || msg.message_type === "google_image") {
                  const isVideo = msg.message_type === "youtube_video";
                  return (
                    <MediaCard
                      key={msg.id ?? idx}
                      type={isVideo ? "youtube" : "image"}
                      title={msg.message || (isVideo ? "Educational Video" : "Diagram")}
                      searchQuery={msg.message}
                    />
                  );
                }

                // Standard AI Bubble with optional inline diagram attachment
                const hasMermaidInMeta = msg.metadata?.mermaid_diagram?.code;
                const hasTextInMeta = msg.metadata?.text_diagram?.code;

                return (
                  <div key={msg.id ?? idx} className="space-y-3 mb-4">
                    <AIBubble
                      msg={msg}
                      onOption={(optVal) => handleSend(optVal)}
                      onSpeak={() =>
                        speak({
                          id: msg.id,
                          message: msg.message,
                          message_type: msg.message_type,
                        })
                      }
                      isSpeaking={speakingMessageId === msg.id}
                    />
                    {hasMermaidInMeta && (
                      <MermaidDiagram
                        code={msg.metadata.mermaid_diagram.code}
                        title={msg.metadata.mermaid_diagram.title || "Diagram"}
                      />
                    )}
                    {hasTextInMeta && (
                      <TextDiagram
                        code={msg.metadata.text_diagram.code}
                        title={msg.metadata.text_diagram.title || "Diagram"}
                        diagramType={msg.metadata.text_diagram.diagram_type || "ascii"}
                      />
                    )}
                  </div>
                );
              })}

              {sending && <TypingDots />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: done ? "8px 16px" : "16px 24px", background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "4px 0" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  background: "#f0fdf4",
                  border: "1.5px solid #bbf7d0",
                  borderRadius: 20,
                  boxShadow: "0 1px 4px rgba(22, 101, 52, 0.06)",
                }}
              >
                <span style={{ color: "#166534", fontWeight: 700, margin: 0, fontSize: 13 }}>
                  🎉 Session Complete! All learning goals achieved.
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                cancelAutoSend();
                handleSend();
              }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  cancelAutoSend();
                }}
                placeholder={
                  isWaitingToSend
                    ? "Sending in 1.5s... Click Mic or type to edit"
                    : isListening
                      ? "Listening... Speak now"
                      : "Type your answer..."
                }
                disabled={sending || loading}
                style={{
                  flex: 1,
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 22,
                  border: "1.5px solid #cbd5e1",
                  outline: "none",
                  fontSize: 14,
                }}
              />

              {/* Mic / Talk to AI button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={sending}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "none",
                    background: isWaitingToSend
                      ? "#f59e0b"
                      : isListening
                        ? "#ef4444"
                        : "#f1f5f9",
                    color: isWaitingToSend || isListening ? "#ffffff" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  className={isListening || isWaitingToSend ? "animate-pulse" : ""}
                  title={
                    isWaitingToSend
                      ? "Click to cancel auto-send and edit"
                      : isListening
                        ? "Stop listening"
                        : "Talk to AI"
                  }
                >
                  {isWaitingToSend ? <X className="w-5 h-5" /> : isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <button
                type="submit"
                disabled={sending || loading || !input.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: "#000000",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: sending || !input.trim() ? 0.5 : 1,
                }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
