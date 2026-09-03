import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { UserBubble, AIBubble, CorrectionBubble, TypingDots, AIAttachments, isRawDiagramText } from "./components/ChatBubbles";
import { SummaryCard, SessionSummaryCard, ScorePredictionCard, InternetLinkCard, GoalRevisionCard, LearningReportCard, AISummaryCard, ConceptCard, RevisionSheetCard } from "./components/ChatCards";
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

function extractAIAttachments(items: TopicChatMessage[]): AIAttachments {
  const attachments: AIAttachments = {};

  items.forEach((m) => {
    // 1. Mermaid Diagram
    if (m.message_type === "mermaid_diagram" || m.metadata?.mermaid_diagram?.code || m.mermaid_diagram?.code) {
      let code = m.metadata?.mermaid_diagram?.code || m.mermaid_diagram?.code || "";
      let title = m.metadata?.mermaid_diagram?.title || m.mermaid_diagram?.title || "Concept Diagram";
      let trigger = m.metadata?.mermaid_diagram?.trigger || m.mermaid_diagram?.trigger || "teaching";
      if (!code && m.diff_html) {
        try {
          const parsed = JSON.parse(m.diff_html);
          code = parsed.code || m.diff_html;
          if (parsed.title) title = parsed.title;
          if (parsed.trigger) trigger = parsed.trigger;
        } catch {
          code = m.diff_html;
        }
      }
      if (code) {
        attachments.mermaidDiagram = { code, title, trigger };
      }
    }

    // 2. Text Diagram
    if (m.message_type === "text_diagram" || m.metadata?.text_diagram?.code || m.text_diagram?.code) {
      let code = m.metadata?.text_diagram?.code || m.text_diagram?.code || "";
      let title = m.metadata?.text_diagram?.title || m.text_diagram?.title || "Quick Reference";
      let diagramType = m.metadata?.text_diagram?.diagram_type || m.text_diagram?.diagram_type || "ascii";
      let trigger = m.metadata?.text_diagram?.trigger || m.text_diagram?.trigger || "teaching";
      if (!code && m.diff_html) {
        try {
          const parsed = JSON.parse(m.diff_html);
          code = parsed.code || m.diff_html;
          if (parsed.diagram_type) diagramType = parsed.diagram_type;
          if (parsed.title) title = parsed.title;
          if (parsed.trigger) trigger = parsed.trigger;
        } catch {
          code = m.diff_html;
        }
      }
      if (code) {
        attachments.textDiagram = { code, title, diagramType, trigger };
      }
    }

    // 2.5 Exam Definition ("Write this down")
    if (m.message_type === "exam_definition" || m.metadata?.exam_definition || m.exam_definition) {
      let defData = m.metadata?.exam_definition || m.exam_definition || null;
      if (!defData && m.diff_html) {
        try {
          const parsed = JSON.parse(m.diff_html);
          if (parsed.term && parsed.definition) defData = parsed;
          else if (parsed.exam_definition) defData = parsed.exam_definition;
        } catch { /* ignore */ }
      }
      if (defData?.term && defData?.definition) {
        attachments.examDefinition = {
          term: defData.term,
          definition: defData.definition,
          plain_english: defData.plain_english || "",
          formula: defData.formula || null,
          units: defData.units || null,
          title: defData.term || "Write this down",
        };
      }
    }

    // 3. YouTube Video
    if (m.message_type === "youtube_video" || m.youtube_video || (m as any).videos?.[0]) {
      let mediaData: any = null;
      if (m.diff_html) {
        try {
          mediaData = JSON.parse(m.diff_html);
        } catch {}
      }
      const videoObj = (m as any).videos?.[0];
      const title = mediaData?.title || videoObj?.title || m.youtube_video?.title || m.message || "Educational Video";
      const url = mediaData?.url || videoObj?.url;
      const embedUrl = mediaData?.embedUrl || videoObj?.embedUrl;
      const thumbnail = mediaData?.thumbnail || videoObj?.thumbnail;
      const channel = mediaData?.channel || videoObj?.channel;
      const duration = mediaData?.duration || videoObj?.duration;
      const viewCount = mediaData?.viewCount || videoObj?.viewCount;
      const searchQuery = mediaData?.search_query || m.youtube_video?.search_query || m.message;
      const trigger = m.youtube_video?.trigger;
      attachments.youtubeVideo = { title, url, embedUrl, thumbnail, channel, duration, viewCount, searchQuery, trigger };
    }

    // 4. Google Image
    if (m.message_type === "google_image" || m.google_image || (m as any).images?.[0]) {
      let mediaData: any = null;
      if (m.diff_html) {
        try {
          mediaData = JSON.parse(m.diff_html);
        } catch {}
      }
      const imageObj = (m as any).images?.[0];
      const title = mediaData?.title || imageObj?.title || m.google_image?.title || m.message || "Visual Reference";
      const url = mediaData?.url || imageObj?.url || mediaData?.thumbnail || imageObj?.thumbnail;
      const thumbnail = mediaData?.thumbnail || imageObj?.thumbnail || url;
      const source = mediaData?.source || imageObj?.source;
      const searchQuery = mediaData?.search_query || m.google_image?.search_query || m.message;
      const trigger = m.google_image?.trigger;
      attachments.googleImage = { title, url, thumbnail, source, searchQuery, trigger };
    }
  });

  return attachments;
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
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [baseTime, setBaseTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumRef = useRef(0);
  const doneRef = useRef(false);

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
    defaultVoiceEnabled: false,
  });

  // ─── Session timer ────────────────────────────────────────────────
  // The page keeps a running delta accumulator (`accumRef`) + the wall-clock
  // seconds since the current tick (`startTimeRef`). Only freshly-accrued
  // seconds are ever sent to the backend (`sessionDelta()`), avoiding the
  // double-counting that happened when cumulative `elapsed` was re-sent.
  const sessionDelta = useCallback(() => {
    return accumRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  // Persist accrued seconds and reset the baseline so they aren't sent twice.
  const saveTime = useCallback(
    (action: "heartbeat" | "pause" | "complete" = "heartbeat") => {
      if (!topicId) return;
      if (doneRef.current && action === "heartbeat") return;
      const delta = sessionDelta();
      if (delta <= 0) {
        if (action === "complete" || action === "pause") {
          updateTopicTime(topicId, 0, action).catch(() => {});
        }
        return;
      }
      updateTopicTime(topicId, delta, action)
        .then(() => {
          // Reset the running baseline now that these seconds are persisted.
          accumRef.current = 0;
          startTimeRef.current = Date.now();
        })
        .catch(() => {});
    },
    [topicId, sessionDelta]
  );

  // Timer: update displayed time every second; heartbeat every 30s. Stops when
  // the topic is completed.
  useEffect(() => {
    startTimeRef.current = Date.now();
    const tick = setInterval(() => {
      if (doneRef.current) return;
      setElapsed(baseTime + sessionDelta());
    }, 1000);
    const heartbeat = setInterval(() => {
      if (!doneRef.current) saveTime("heartbeat");
    }, 30000);
    timerRef.current = tick;
    return () => {
      if (tick) clearInterval(tick);
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [baseTime, saveTime, sessionDelta]);

  // ─── Load chat ─────────────────────────────────────────────────────
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
      const alreadyDone = res.topic?.is_completed ?? false;
      setDone(alreadyDone);
      doneRef.current = alreadyDone;
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

  // Pause on unmount / navigate away (stop unless already completed)
  useEffect(() => {
    const handleUnload = () => {
      if (!doneRef.current) saveTime("pause");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (!doneRef.current) saveTime("pause");
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
        voice_enabled: isVoiceEnabled,
      });

      if (res.goals) setGoals(res.goals);
      if (res.all_goals_completed) {
        saveTime("complete");
        setDone(true);
        doneRef.current = true;
      }

      if (res.userCorrection) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempUserMsg.id
              ? {
                  ...m,
                  id: res.userMessage?.id || m.id,
                  message_type: "user_correction",
                  diff_html: res.userCorrection?.diff_html,
                  complete_answer: res.userCorrection?.complete_answer,
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
        const firstTextMsg = newAiMsgs.find((m) => m.message && m.message_type !== "mermaid_diagram" && m.message_type !== "youtube_video" && m.message_type !== "google_image");
        if (isVoiceEnabled && firstTextMsg?.message) {
          speak({
            id: firstTextMsg.id,
            message: firstTextMsg.message,
            message_type: firstTextMsg.message_type,
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
            padding: isMobile ? "8px 12px" : "12px 24px",
            background: "#ffffff",
            borderBottom: "1px solid #e9d5ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? 8 : 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 800, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {subjectName} {chapterTitle ? `• ${chapterTitle}` : ""}
            </div>
            <h1 style={{ fontSize: isMobile ? 15 : 18.5, fontWeight: 800, color: "#1e1b4b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {topicTitle}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 12, flexShrink: 0 }}>
            {/* Voice Toggle */}
            <button
              type="button"
              onClick={() => setIsVoiceEnabled((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 0 : 6,
                padding: isMobile ? "6px" : "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                width: isMobile ? 32 : "auto",
                height: isMobile ? 32 : "auto",
                background: isVoiceEnabled ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "#f3e8ff",
                color: isVoiceEnabled ? "#ffffff" : "#6b21a8",
                boxShadow: isVoiceEnabled ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
              title={isVoiceEnabled ? "Voice On" : "Voice Off"}
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {!isMobile && <span>{isVoiceEnabled ? "Voice On" : "Voice Off"}</span>}
            </button>

            {/* Timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 6,
                padding: isMobile ? "4px 10px" : "6px 14px",
                borderRadius: 20,
                background: "#f3e8ff",
                color: "#6b21a8",
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                border: "1px solid #e9d5ff",
              }}
            >
              <Clock style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, color: "#7e22ce" }} />
              {fmt(elapsed)}
            </div>

            <button
              onClick={() => {
                if (doneRef.current) saveTime("complete");
                else saveTime("pause");
                navigate(-1);
              }}
              style={{
                width: isMobile ? 30 : 34,
                height: isMobile ? 30 : 34,
                borderRadius: "50%",
                border: "1px solid #e9d5ff",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3e8ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              title="Exit Chat"
            >
              <X style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: "#6b21a8" }} />
            </button>
          </div>
        </div>

        {/* Goals Bar */}
        {!loading && goals.length > 0 && <GoalsBar goals={goals} open={goalsOpen} onToggle={() => setGoalsOpen((p) => !p)} />}

        {/* Chat Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px 10px" : "24px 28px" }}>
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
                style={{ padding: "8px 18px", borderRadius: 8, background: "#7e22ce", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              {(() => {
                // Group consecutive AI messages into a single AI response turn
                type ChatGroup =
                  | { type: "user_correction"; msg: TopicChatMessage; id: string | number }
                  | { type: "user"; msg: TopicChatMessage; id: string | number }
                  | { type: "session_summary"; msg: TopicChatMessage; id: string | number }
                  | { type: "standalone"; msg: TopicChatMessage; id: string | number }
                  | { type: "ai_group"; items: TopicChatMessage[]; id: string | number };

                const groups: ChatGroup[] = [];
                let currentAiGroup: TopicChatMessage[] = [];

                const flushAiGroup = () => {
                  if (currentAiGroup.length > 0) {
                    groups.push({
                      type: "ai_group",
                      items: [...currentAiGroup],
                      id: currentAiGroup[0].id || `ai-group-${groups.length}`,
                    });
                    currentAiGroup = [];
                  }
                };

                messages.forEach((msg, idx) => {
                  const id = msg.id ?? idx;
                  if (msg.message_type === "user_correction" || (msg.sender === "user" && msg.diff_html)) {
                    flushAiGroup();
                    groups.push({ type: "user_correction", msg, id });
                    return;
                  }
                  if (msg.sender === "user") {
                    flushAiGroup();
                    groups.push({ type: "user", msg, id });
                    return;
                  }
                  if (msg.message_type === "session_summary") {
                    flushAiGroup();
                    groups.push({ type: "session_summary", msg, id });
                    return;
                  }
                  if (
                    msg.message_type === "learning_report" ||
                    msg.message_type === "session_frame" ||
                    msg.message_type === "hook_prediction" ||
                    msg.message_type === "concept_card" ||
                    msg.message_type === "revision_sheet" ||
                    (msg.sender === "ai" && (msg.message?.trim().startsWith('{"summary"') || msg.message?.trim().startsWith('{"title"')))
                  ) {
                    flushAiGroup();
                    groups.push({ type: "standalone", msg, id });
                    return;
                  }
                  currentAiGroup.push(msg);
                });

                flushAiGroup();

                return groups.map((group) => {
                  if (group.type === "user_correction") {
                    return <CorrectionBubble key={group.id} msg={group.msg} />;
                  }
                  if (group.type === "user") {
                    return <UserBubble key={group.id} msg={group.msg} />;
                  }
                  if (group.type === "session_summary") {
                    let summaryData = (group.msg as any).session_summary;
                    if (!summaryData && group.msg.diff_html) {
                      try { summaryData = JSON.parse(group.msg.diff_html); } catch {}
                    }
                    if (summaryData) {
                      return <SessionSummaryCard key={group.id} data={summaryData} message={group.msg.message} />;
                    }
                    return null;
                  }
                  if (group.type === "standalone") {
                    const stMsg = group.msg;
                    // Try to resolve the rich data from the attached block OR from diff_html JSON
                    const resolve = (key: "session_frame" | "exam_definition" | "concept_card" | "revision_sheet") => {
                      const attached = stMsg[key];
                      if (attached) return attached;
                      if (stMsg.diff_html) {
                        try {
                          const parsed = JSON.parse(stMsg.diff_html) as Record<string, unknown> | null;
                          if (parsed && typeof parsed === "object") {
                            // Case 1: stored as { key: data }
                            if (parsed[key]) return parsed[key];
                            // Case 2: stored as the data object directly (has a characteristic field)
                            if (["term", "concept", "key_points", "topic", "objectives"].some((k) => k in parsed)) {
                              return parsed;
                            }
                          }
                        } catch { /* ignore parse failures */ }
                      }
                      return null;
                    };

                    // session_frame: used internally as a phase marker by the backend.
                    // It is NOT shown as a card — the opening turn stays 2 clean AI
                    // bubbles (intro + question). Objectives live in the Goals bar.
                    if (stMsg.message_type === "session_frame") {
                      return null;
                    }
                    if (stMsg.message_type === "concept_card") {
                      return <ConceptCard key={group.id} data={resolve("concept_card") || {}} />;
                    }
                    if (stMsg.message_type === "revision_sheet") {
                      return <RevisionSheetCard key={group.id} data={resolve("revision_sheet") || {}} />;
                    }
                    // hook_prediction & other non-card blocks: no standalone card
                    if (stMsg.message_type === "hook_prediction") {
                      return null;
                    }
                    return <AISummaryCard key={group.id} text={stMsg.diff_html || stMsg.message} />;
                  }

                  // AI Group: Unified Turn with in-bubble visual options & media drawer
                  const turnAttachments = extractAIAttachments(group.items);

                  // Find all text / conversation messages in this AI group
                  const textMessages = group.items.filter(
                    (m) =>
                      m.message_type !== "mermaid_diagram" &&
                      m.message_type !== "text_diagram" &&
                      m.message_type !== "youtube_video" &&
                      m.message_type !== "google_image" &&
                      m.message_type !== "score_prediction" &&
                      m.message_type !== "internet_link" &&
                      m.message_type !== "goal_revision" &&
                      m.message_type !== "exam_definition" &&
                      !isRawDiagramText(m.message || "")
                  );

                  // Fallback if all items in this group were media/cards only
                  const messagesToRender = textMessages.length > 0 ? textMessages : [group.items[0]];

                  // Special standalone cards (score prediction, goal revision, internet link)
                  const specialCards = group.items.filter(
                    (m) =>
                      m.message_type === "score_prediction" ||
                      m.message_type === "internet_link" ||
                      m.message_type === "goal_revision"
                  );

                  return (
                    <div
                      key={group.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 20,
                      }}
                    >
                      {/* AI Tutor Avatar */}
                      <div
                        style={{
                          width: 30,
                          height: 30,
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

                      {/* Unified Content Column */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: isMobile ? "calc(100% - 42px)" : "82%", minWidth: isMobile ? 0 : 280, flex: 1 }}>
                        {messagesToRender.map((msg, idx) => {
                          // Attach turn visual aids to the first message (or if msg has its own attachments)
                          const msgAttachments = idx === 0 ? turnAttachments : extractAIAttachments([msg]);

                          return (
                            <AIBubble
                              key={msg.id ?? `ai-msg-${idx}`}
                              msg={msg}
                              attachments={msgAttachments}
                              onOption={(optVal) => handleSend(optVal)}
                              onSpeak={() =>
                                speak({
                                  id: msg.id,
                                  message: msg.message,
                                  message_type: msg.message_type,
                                })
                              }
                              isSpeaking={speakingMessageId === msg.id}
                              hideAvatar={true}
                            />
                          );
                        })}

                        {specialCards.map((m, idx) => {
                          if (m.message_type === "score_prediction" && m.metadata?.score_prediction) {
                            return <ScorePredictionCard key={m.id ?? idx} data={m.metadata.score_prediction} />;
                          }
                          if (m.message_type === "internet_link") {
                            return <InternetLinkCard key={m.id ?? idx} diffHtml={m.diff_html} />;
                          }
                          if (m.message_type === "goal_revision") {
                            return <GoalRevisionCard key={m.id ?? idx} diffHtml={m.diff_html} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                });
              })()}

              {sending && <TypingDots />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: done ? (isMobile ? "8px 10px" : "10px 20px") : (isMobile ? "10px 10px" : "16px 24px"), background: "#ffffff", borderTop: "1px solid #e9d5ff", boxShadow: "0 -1px 4px rgba(0,0,0,0.02)" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 20px",
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
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  cancelAutoSend();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    cancelAutoSend();
                    handleSend();
                  }
                }}
                placeholder={
                  isWaitingToSend
                    ? "Sending in 1.5s... Click Mic or type to edit"
                    : isListening
                      ? "Listening... Speak now"
                      : "Type your answer... (Shift+Enter for new line)"
                }
                disabled={sending || loading}
                rows={1}
                style={{
                  flex: 1,
                  maxHeight: 120,
                  minHeight: isMobile ? 44 : 50,
                  padding: isMobile ? "12px 14px" : "14px 22px",
                  borderRadius: isMobile ? 22 : 25,
                  border: "1.5px solid #d8b4fe",
                  outline: "none",
                  fontSize: isMobile ? 15 : 16.5,
                  background: "#faf5ff",
                  color: "#1e1b4b",
                  resize: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#7e22ce")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d8b4fe")}
              />

              {/* Mic / Talk to AI button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={sending}
                  style={{
                    width: isMobile ? 38 : 44,
                    height: isMobile ? 38 : 44,
                    borderRadius: "50%",
                    border: "none",
                    background: isWaitingToSend
                      ? "#f59e0b"
                      : isListening
                        ? "#ef4444"
                        : "#f3e8ff",
                    color: isWaitingToSend || isListening ? "#ffffff" : "#7e22ce",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: isListening ? "0 0 12px rgba(239, 68, 68, 0.4)" : "none",
                    transition: "all 0.2s ease",
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
                  width: isMobile ? 38 : 44,
                  height: isMobile ? 38 : 44,
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: sending || !input.trim() ? 0.45 : 1,
                  boxShadow: sending || !input.trim() ? "none" : "0 2px 8px rgba(124, 58, 237, 0.3)",
                  transition: "all 0.2s ease",
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
