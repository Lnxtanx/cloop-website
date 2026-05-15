import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronDown, ChevronUp,
  Clock, Loader2, Send,
  Trophy,
} from "lucide-react";
import {
  fetchTopicChatMessages, sendTopicChatMessage, updateTopicTime,
  TopicChatMessage, TopicGoal, TopicChatResponse,
  SendMessageResponse, SessionSummaryData, ScorePrediction,
} from "@/lib/api/topic-chat";
import DashboardLayout from "@/layouts/DashboardLayout";

// ─── Small helpers ────────────────────────────────────────────────────────────

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function mergeMessages(userMsgs: TopicChatMessage[], aiMsgs: TopicChatMessage[]) {
  const m = new Map<string | number, TopicChatMessage>();
  
  // Combine all messages
  const all = [...(userMsgs || []), ...(aiMsgs || [])];
  
  all.forEach((x, index) => {
    // Handle missing or non-numeric IDs to prevent Map collisions on NaN
    const id = (x.id !== undefined && x.id !== null && !isNaN(Number(x.id))) 
      ? Number(x.id) 
      : `temp-${index}-${x.created_at || Date.now()}`;
      
    if (!m.has(id)) {
      m.set(id, x);
    } else {
      const existing = m.get(id)!;
      // Heuristic to keep the "better" version of the message
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

// ─── Diff text ────────────────────────────────────────────────────────────────

function DiffText({ html }: { html: string }) {
  const parts = html.replace(/<\/?p>/g, "").split(/(<del>.*?<\/del>|<ins>.*?<\/ins>)/g);
  return (
    <span style={{ fontSize: 14, lineHeight: 1.6 }}>
      {parts.map((p, i) => {
        if (p.startsWith("<del>"))
          return <span key={i} style={{ textDecoration: "line-through", color: "#ef4444" }}>{p.replace(/<\/?del>/g, "")}</span>;
        if (p.startsWith("<ins>"))
          return <span key={i} style={{ fontWeight: 600, color: "#16a34a" }}>{p.replace(/<\/?ins>/g, "")}</span>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

// ─── Message components ───────────────────────────────────────────────────────

function UserBubble({ msg }: { msg: TopicChatMessage }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <div style={{
        maxWidth: "65%", padding: "10px 16px", borderRadius: "18px 18px 4px 18px",
        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
        color: "#fff", fontSize: 14, lineHeight: 1.55,
      }}>
        {msg.message}
      </div>
    </div>
  );
}

function AIBubble({ msg, onOption }: { msg: TopicChatMessage; onOption: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 10, fontWeight: 700,
      }}>C.</div>
      <div style={{ maxWidth: "65%" }}>
        <div style={{
          padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
          background: "#f3f4f6", color: "#111827",
          fontSize: 14, lineHeight: 1.55,
        }}>
          {msg.message}
        </div>
        {msg.options && msg.options.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {msg.options.map((o) => (
              <button key={o.value} onClick={() => onOption(o.value)} style={{
                textAlign: "left", padding: "8px 14px", borderRadius: 12,
                border: "1.5px solid #e5e7eb", background: "#fff",
                fontSize: 13, color: "#111827", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
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

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "");
}

function CorrectionBubble({ msg }: { msg: TopicChatMessage }) {

  const originalText = msg.message ?? "";
  const hasDiff = !!(msg.diff_html && msg.diff_html.trim());
  const diffPlain = hasDiff ? stripTags(msg.diff_html!) : "";
  // Only use diff as primary display if it covers ≥60% of the original answer length
  const diffCoversFullText = hasDiff && originalText.length > 0
    ? diffPlain.length >= originalText.length * 0.6
    : hasDiff;

  // Determine bubble color based on correctness
  const feedback = msg.feedback;
  const isCorrect = msg.is_correct ?? feedback?.is_correct;
  
  let bubbleBackground = "#fff";  // Default (no feedback)
  let bubbleBorder = "#e5e7eb";    // Default border

  if (isCorrect === true) {
    // All correct → Green bubble
    bubbleBackground = "#dcfce7";
    bubbleBorder = "#86efac";
  } else if (isCorrect === false) {
    // Wrong/Incorrect → Red bubble
    bubbleBackground = "#fee2e2";
    bubbleBorder = "#fca5a5";
  }
  // else: no feedback, keep white

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
      <div style={{ position: "relative", maxWidth: "68%" }}>

        <div style={{
          background: bubbleBackground,
          border: `1.5px solid ${bubbleBorder}`,
          borderRadius: 16, padding: 14, minWidth: 220,
        }}>
          {/* Primary text: full diff if it covers the whole answer, else raw answer text */}
          {hasDiff ? (
            diffCoversFullText ? (
              <DiffText html={msg.diff_html!} />
            ) : (
              <>
                <span style={{ fontSize: 14 }}>{originalText}</span>
                {/* If diff is a fragment (only changed words), show it as an annotation */}
                <div style={{
                  marginTop: 8, padding: "6px 10px",
                  background: "#fafafa", border: "1px solid #e5e7eb",
                  borderRadius: 8,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Corrections:
                  </p>
                  <DiffText html={msg.diff_html!} />
                </div>
              </>
            )
          ) : (
            // No diff_html - show plain text in bubble (fallback for messages without corrections)
            <span style={{ fontSize: 14 }}>{originalText}</span>
          )}
        </div>

        {msg.emoji && (
          <span style={{
            position: "absolute", bottom: -10, right: 14,
            fontSize: 18, background: bubbleBackground, borderRadius: "50%",
            padding: "1px 2px", lineHeight: 1,
          }}>
            {msg.emoji}
          </span>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ data }: { data: SessionSummaryData }) {
  const score = Number(data.score_percent ?? data.overall_score_percent ?? data.performance_percent ?? 0);
  const predicted = data.predicted_score != null ? Math.round(Number(data.predicted_score)) : Math.min(100, Math.round(score + 15));
  const low = score < 35;
  return (
    <div className="flex justify-start mb-4">
      <div className={`rounded-2xl p-5 w-72 ${low ? "bg-red-50" : "bg-green-50"}`}>
        <div className="text-center mb-4">
          <Trophy className={`w-9 h-9 mx-auto mb-1.5 ${low ? "text-red-500" : "text-green-600"}`} />
          <p className={`text-2xl font-extrabold ${low ? "text-red-600" : "text-green-700"}`}>Score — {score}</p>
          <p className={`text-sm font-semibold ${low ? "text-red-400" : "text-green-500"}`}>Predicted — {predicted}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Total", val: data.total_questions ?? 0, bg: "bg-purple-100", c: "text-purple-700" },
            { label: "Correct", val: data.correct_answers ?? 0, bg: "bg-green-100", c: "text-green-700" },
            { label: "Wrong", val: data.incorrect_answers ?? 0, bg: "bg-red-100", c: "text-red-600" },
          ].map(({ label, val, bg, c }) => (
            <div key={label} className={`${bg} rounded-xl py-2.5 text-center`}>
              <p className={`text-lg font-extrabold ${c}`}>{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        {(data.top_error_types?.length ?? 0) > 0 && (
          <div className="mb-2">
            <p className="text-xs font-bold text-gray-700 mb-1">🚀 Common Mistakes</p>
            {data.top_error_types!.slice(0, 3).map((e, i) => <p key={i} className="text-xs text-gray-500">• {e.type}</p>)}
          </div>
        )}
        {data.has_weak_areas && (data.weak_goals?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1">💡 Areas to Improve</p>
            {data.weak_goals!.map((g, i) => <p key={i} className="text-xs text-gray-500">• {g.goal_title}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score prediction card (mid-session, per-goal) ───────────────────────────

function ScorePredictionCard({ data }: { data: ScorePrediction }) {
  const pred = Math.round(data.predicted_score);
  const concept = Math.round((data.concept_score ?? 0) * 100);
  const exam = Math.round((data.exam_score ?? 0) * 100);
  const color = pred >= 75 ? "text-green-700" : pred >= 50 ? "text-amber-600" : "text-red-600";
  const bg = pred >= 75 ? "bg-green-50 border-green-200" : pred >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  return (
    <div className="flex justify-start mb-4">
      <div className={`rounded-2xl p-4 min-w-[240px] max-w-[300px] border ${bg}`}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-bold text-gray-800">{data.goal_title ? `Goal: ${data.goal_title}` : "Goal Complete"}</span>
        </div>
        <div className="text-center mb-3">
          <span className={`text-3xl font-extrabold ${color}`}>{pred}%</span>
          <p className="text-xs text-gray-500 mt-1">Predicted Score</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Concept", val: concept, bg2: "bg-blue-50", c2: "text-blue-700" },
            { label: "Exam", val: exam, bg2: "bg-purple-50", c2: "text-purple-700" },
          ].map(({ label, val, bg2, c2 }) => (
            <div key={label} className={`${bg2} rounded-xl py-2 text-center`}>
              <p className={`text-base font-extrabold ${c2}`}>{val}%</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Goals bar ────────────────────────────────────────────────────────────────

function goalIsCompleted(g: TopicGoal): boolean {
  // Backend returns goals with chat_goal_progress array (same as mobile)
  // Fall back to top-level is_completed if present
  return g.chat_goal_progress?.[0]?.is_completed ?? g.is_completed ?? false;
}

function GoalsBar({ goals, open, onToggle }: { goals: TopicGoal[]; open: boolean; onToggle: () => void }) {
  const doneCount = goals.filter(goalIsCompleted).length;
  return (
    <div style={{ background: "#f3e8ff", borderBottom: "1px solid #e9d5ff", flexShrink: 0 }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 40, border: "none", background: "transparent", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy style={{ width: 15, height: 15, color: "#7c3aed" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Learning Goals</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{doneCount}/{goals.length}</span>
        </div>
        {open
          ? <ChevronUp style={{ width: 15, height: 15, color: "#7c3aed" }} />
          : <ChevronDown style={{ width: 15, height: 15, color: "#7c3aed" }} />}
      </button>
      {open && (
        <div style={{ overflowX: "auto", paddingBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, padding: "0 16px", width: "max-content" }}>
            {goals.map((g, i) => {
              const completed = goalIsCompleted(g);
              const active = !completed && (i === 0 || goalIsCompleted(goals[i - 1]));
              const progress = g.chat_goal_progress?.[0];
              const numQ: number = progress?.num_questions ?? 0;
              const numC: number = progress?.num_correct ?? 0;
              const score = progress?.score_percent
                ?? (numQ > 0 ? Math.round((numC / numQ) * 100) : 0);
              // Phase heuristic: if goal has ≥2 questions and not yet complete, likely in exam phase
              const phase: "concept" | "exam" | null = active
                ? numQ >= 2 ? "exam" : "concept"
                : null;

              return (
                <div key={g.id} style={{
                  width: 116, borderRadius: 12, padding: 10,
                  border: `2px solid ${completed ? "#a78bfa" : active ? "#7c3aed" : "#d1d5db"}`,
                  background: completed ? "#f3e8ff" : active ? "#fafafa" : "#f9fafb",
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {completed
                        ? <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 9 }}>✓</span></div>
                        : active
                          ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed" }} /></div>
                          : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #d1d5db" }} />
                      }
                      <span style={{ fontSize: 11, fontWeight: 700, color: completed ? "#7c3aed" : active ? "#7c3aed" : "#9ca3af" }}>{i + 1}</span>
                    </div>
                    {/* Phase badge — only on active goal */}
                    {phase && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "2px 5px",
                        background: phase === "exam" ? "#eff6ff" : "#f0fdf4",
                        color: phase === "exam" ? "#2563eb" : "#16a34a",
                      }}>
                        {phase === "exam" ? "EXAM" : "CONCEPT"}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#374151", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {g.title || g.description}
                  </p>
                  {score > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 3, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                        <div style={{ height: "100%", width: `${score}%`, background: completed ? "#a78bfa" : "#7c3aed", borderRadius: 2, transition: "width 0.4s ease" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>{score}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">C</div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-gray-100">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TopicChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicId   = searchParams.get("topicId");
  const topicTitle   = searchParams.get("topicTitle")   ?? "Topic Chat";
  const chapterTitle = searchParams.get("chapterTitle") ?? "";
  const subjectName  = searchParams.get("subjectName")  ?? "";

  const [messages, setMessages] = useState<TopicChatMessage[]>([]);
  const [goals,    setGoals]    = useState<TopicGoal[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");
  const [goalsOpen, setGoalsOpen] = useState(true);
  const [baseTime,  setBaseTime]  = useState(0);
  const [elapsed,   setElapsed]   = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Timer
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  // Auto-save time
  useEffect(() => {
    if (done || !topicId) return;
    const id = setInterval(() => {
      updateTopicTime(Number(topicId), baseTime + elapsed).catch(() => null);
    }, 30_000);
    return () => clearInterval(id);
  }, [elapsed, topicId, done, baseTime]);

  const scrollDown = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

  useEffect(() => { scrollDown(); }, [messages, sending]);

  // Load
  const load = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    setError("");
    try {
      const data: TopicChatResponse = await fetchTopicChatMessages(Number(topicId));
      const loadedGoals = data.goals ?? [];
      const rawMessages = mergeMessages(data.messages ?? [], data.aiMessages ?? []);

      // Normalize messages for consistent rendering
      const normalized = rawMessages.map((msg: any) => {
        // Fix missing sender: Trust explicit sender, otherwise fallback based on heuristics
        let sender = msg.sender;
        if (!sender) {
          if (msg.message_type === "user_correction" || msg.diff_html) {
            sender = "user";
          } else {
            // Default to AI if we can't determine
            sender = "ai";
          }
        }
        
        // Fix missing message_type
        let messageType = msg.message_type;
        if (!messageType && msg.diff_html) {
          messageType = "user_correction";
        }
        if (!messageType && msg.score_percent != null) {
          messageType = "session_summary";
        }

        return { ...msg, sender, message_type: messageType };
      });

      // DEBUG: Log loaded messages
      console.log("📦 Loaded messages:", normalized.map(m => ({
        id: m.id,
        sender: m.sender,
        type: m.message_type,
        messagePreview: m.message?.slice(0, 60),
        hasDiff: !!m.diff_html,
        hasOptions: !!m.options?.length,
      })));

      setMessages(normalized);
      setGoals(loadedGoals);
      // Topic is done if the topic flag is set OR all goals are completed
      const allGoalsDone = loadedGoals.length > 0 && loadedGoals.every(goalIsCompleted);
      setDone(data.topic.is_completed ?? allGoalsDone);
      setBaseTime(data.topic.time_spent_seconds ?? 0);
      setElapsed(0);

      console.log("✅ Session loaded:", {
        messageCount: normalized.length,
        goalsCount: loadedGoals.length,
        isCompleted: data.topic.is_completed,
        allGoalsDone,
        baseTime: data.topic.time_spent_seconds,
      });
    } catch (e: unknown) {
      console.error("❌ Failed to load topic chat:", e);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [topicId]);

  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (!token || !topicId) { navigate("/login"); return; }
    void load();
  }, [topicId, navigate, load]);

  // Send
  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    const tid = Date.now();
    
    console.log("📤 Sending message:", msg.slice(0, 80));
    setMessages((p) => [...p, { id: tid, message: msg, sender: "user", created_at: new Date().toISOString() }]);
    
    try {
      const res: SendMessageResponse = await sendTopicChatMessage(
        Number(topicId!),
        { message: msg, session_time_seconds: baseTime + elapsed }
      );

      console.log("📥 Received response:", {
        aiMessageCount: res.messages?.length ?? res.aiMessages?.length ?? 0,
        hasCorrection: !!res.userCorrection,
        hasSummary: !!res.session_summary,
        goalsCount: res.goals?.length,
      });

      if (res.goals) {
        setGoals(res.goals);
        // Also set done if all goals are now completed (use chat_goal_progress)
        if (res.goals.every(goalIsCompleted)) setDone(true);
      }
      if (res.all_goals_completed) setDone(true);

      // Update the temporary user message ID if the backend returned the real one
      let realUserId = tid;
      if (res.userMessage && res.userMessage.id) {
        realUserId = res.userMessage.id;
        setMessages((p) => p.map((m) => m.id === tid ? { ...m, id: realUserId } : m));
      }

      const corr = res.userCorrection;
      if (corr) {
        console.log("✏️ Applying correction:", corr);
        setMessages((p) => p.map((m) => m.id === realUserId || m.id === tid
          ? {
              ...m,
              id: realUserId,
              message_type: "user_correction",
              diff_html: corr.diff_html ?? corr.correction ?? null,
              emoji: corr.emoji ?? null,
              complete_answer: corr.complete_answer ?? null,
              feedback: corr.feedback ?? null,
            }
          : m
        ));
      }

      // Patch AI messages: if a session_summary message exists but lacks the data field,
      // attach res.session_summary to it (backend puts data at top level, not inside message)
      const rawAiMsgs = (res.messages ?? res.aiMessages ?? []).filter((m): m is TopicChatMessage => m.sender === "ai");
      const aiMsgs = rawAiMsgs.map((m) => {
        if (m.message_type === "session_summary" && !m.session_summary && res.session_summary) {
          return { ...m, session_summary: res.session_summary };
        }
        return m;
      });

      const extras: TopicChatMessage[] = [];
      const hasSummaryMsg = aiMsgs.some((m: TopicChatMessage) => m.message_type === "session_summary");
      if (res.session_summary && !hasSummaryMsg) {
        extras.push({
          id: Date.now() + 9999, sender: "ai", message: "Session Summary",
          message_type: "session_summary", session_summary: res.session_summary,
          created_at: new Date().toISOString(),
        });
      }

      console.log("🔄 Adding messages:", {
        aiMessages: aiMsgs.length,
        extras: extras.length,
      });

      setMessages((p) => {
        const merged = [...p, ...aiMsgs.map((m: TopicChatMessage) => ({ ...m, id: m.id ?? Date.now() + Math.random() })), ...extras];
        const seen = new Set<number>();
        return merged.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      });
      inputRef.current?.focus();
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      setMessages((p) => p.filter((m) => m.id !== tid));
      setInput(msg);
    } finally {
      setSending(false);
      // Always restore focus to input so user can type immediately
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const renderMsg = (msg: TopicChatMessage) => {
    // DEBUG: Log rendering
    if (msg.message_type !== "score_prediction") {
      console.log("🎨 Rendering message:", {
        id: msg.id,
        sender: msg.sender,
        type: msg.message_type,
        preview: msg.message?.slice(0, 40),
      });
    }

    if (msg.message_type === "score_prediction") return null;
    
    if (msg.message_type === "session_summary") {
      const summaryCandidate: SessionSummaryData = msg;
      const data: SessionSummaryData =
        msg.session_summary ??
        (typeof msg.score_percent !== "undefined" ? summaryCandidate : null) ??
        (() => { try { return JSON.parse(msg.diff_html ?? "{}"); } catch { return {}; } })();
      
      if (!data.score_percent && !data.total_questions) {
        console.warn("⚠️ Session summary has no valid data:", msg);
      }
      return <SummaryCard key={msg.id} data={data} />;
    }
    
    if (msg.message_type === "user_correction" || msg.diff_html) {
      return <CorrectionBubble key={msg.id} msg={msg} />;
    }
    
    if (msg.sender === "user") {
      return <UserBubble key={msg.id} msg={msg} />;
    }
    
    // Default to AI for safety (handles missing sender)
    return <AIBubble key={msg.id} msg={msg} onOption={(v) => send(v)} />;
  };

  // ── Render ──
  const pageTitle = loading ? "Loading…" : topicTitle;
  const subTitle = (subjectName || chapterTitle) ? `${subjectName}${chapterTitle ? ` → ${chapterTitle}` : ""}` : "";

  return (
    <DashboardLayout title={pageTitle} mainClassName="flex flex-col p-0 overflow-hidden">
      {/* Topic info header with timer */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-purple-50 border-b border-purple-200">
        <div className="min-w-0 flex-1">
          {subTitle && (
            <p className="text-xs text-purple-600 truncate">{subTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-purple-100 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 tabular-nums">
              {fmt(baseTime + elapsed)}
            </span>
          </div>
          {done && (
            <span className="text-xs font-semibold text-purple-700 bg-purple-100 rounded-full px-3 py-1">
              ✓ Done
            </span>
          )}
        </div>
      </div>

      {/* Goals bar */}
      {!loading && goals.length > 0 && (
        <GoalsBar goals={goals} open={goalsOpen} onToggle={() => setGoalsOpen((p) => !p)} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {loading && (
            <div className="flex justify-center items-center gap-2 py-20 text-gray-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              Loading topic…
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-20">
              Starting your session…
            </p>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {error}
            </div>
          )}
          {messages.map((m) => renderMsg(m))}
          {sending && <TypingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          {done ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-purple-600 mb-3">
                🎉 You've completed this topic!
              </p>
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                ← Back to Topics
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); void send(); }}
              className="flex gap-3 items-center"
            >
              <input
                ref={inputRef}
                type="text"
                autoFocus
                placeholder="Type your answer…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !sending) {
                    e.preventDefault();
                    void send();
                  }
                }}
                disabled={sending}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-shadow cursor-pointer"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
