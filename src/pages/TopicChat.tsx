import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Bell, BarChart2, ChevronDown, ChevronUp,
  Clock, Home, Loader2, LogOut, MessageCircle, Send,
  Trophy, User, Video,
} from "lucide-react";
import {
  fetchTopicChatMessages, sendTopicChatMessage, updateTopicTime,
  TopicChatMessage, TopicGoal, TopicChatResponse,
  SendMessageResponse, SessionSummaryData, ScorePrediction,
} from "@/lib/api/topic-chat";

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV = [
  { icon: Home,         label: "Home",       path: "/dashboard" },
  { icon: Video,        label: "Sessions",   path: "/dashboard/sessions" },
  { icon: BarChart2,    label: "Statistics", path: "/dashboard/statistics" },
  { icon: MessageCircle,label: "Chat",       path: "/dashboard/chat" },
  { icon: User,         label: "Profile",    path: "/dashboard/profile" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function mergeMessages(a: TopicChatMessage[], b: TopicChatMessage[]) {
  const m = new Map<number, TopicChatMessage>();
  [...a, ...b].forEach((x) => m.set(x.id, x));
  return [...m.values()].sort(
    (x, y) => new Date(x.created_at).getTime() - new Date(y.created_at).getTime()
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
          return <span key={i} style={{ fontWeight: 600, color: "#10b981" }}>{p.replace(/<\/?ins>/g, "")}</span>;
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
        background: "linear-gradient(135deg,hsl(174,58%,42%),hsl(200,60%,50%))",
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
        background: "linear-gradient(135deg,hsl(174,58%,42%),hsl(200,60%,50%))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 10, fontWeight: 700,
      }}>C.</div>
      <div style={{ maxWidth: "65%" }}>
        <div style={{
          padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
          background: "hsl(174,40%,94%)", color: "hsl(210,20%,12%)",
          fontSize: 14, lineHeight: 1.55,
        }}>
          {msg.message}
        </div>
        {msg.options && msg.options.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {msg.options.map((o) => (
              <button key={o.value} onClick={() => onOption(o.value)} style={{
                textAlign: "left", padding: "8px 14px", borderRadius: 12,
                border: "1.5px solid hsl(174,40%,80%)", background: "#fff",
                fontSize: 13, color: "hsl(210,20%,12%)", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(174,40%,94%)")}
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

function CorrectionBubble({ msg }: { msg: TopicChatMessage }) {
  const answer = msg.complete_answer ?? msg.completeAnswer ?? msg.feedback?.content ?? null;
  const feedback = msg.feedback ?? null;
  const isCorrect = feedback?.is_correct ?? false;
  const score = feedback?.score_percent ?? null;
  const errorType = feedback?.error_type ?? null;

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
      <div style={{ position: "relative", maxWidth: "68%" }}>

        {/* Score pill — sits above the bubble */}
        {score !== null && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            justifyContent: "flex-end", marginBottom: 4,
          }}>
            {errorType && !isCorrect && (
              <span style={{ fontSize: 10, color: "#9ca3af", background: "#f3f4f6", borderRadius: 8, padding: "2px 7px" }}>
                {errorType}
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px",
              background: isCorrect ? "#d1fae5" : score >= 60 ? "#fef9c3" : "#fee2e2",
              color: isCorrect ? "#059669" : score >= 60 ? "#b45309" : "#dc2626",
            }}>
              {isCorrect ? "✓" : "✗"} {score}%
            </span>
          </div>
        )}

        <div style={{
          background: "#fff",
          border: `1.5px solid ${isCorrect ? "#a7f3d0" : score !== null && score >= 60 ? "#fde68a" : "#fecaca"}`,
          borderRadius: 16, padding: 14, minWidth: 220,
        }}>
          {msg.diff_html ? <DiffText html={msg.diff_html} /> : <span style={{ fontSize: 14 }}>{msg.message}</span>}
          {answer && !isCorrect && (
            <div style={{
              marginTop: 10, padding: 10, background: "#ecfdf5",
              border: "1px solid #a7f3d0", borderRadius: 10,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>Correct Answer:</p>
              <p style={{ fontSize: 13, color: "#047857" }}>{answer}</p>
            </div>
          )}
        </div>

        {msg.emoji && (
          <span style={{
            position: "absolute", bottom: -10, right: 14,
            fontSize: 18, background: "#fff", borderRadius: "50%",
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
  // Use real predicted_score from backend if available, otherwise estimate
  const predicted = data.predicted_score != null
    ? Math.round(Number(data.predicted_score))
    : Math.min(100, Math.round(score + 15));
  const low = score < 35;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div style={{
        borderRadius: 18, padding: 18, width: 280,
        background: low ? "#fef2f2" : "#f0fdf4",
      }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <Trophy style={{ width: 36, height: 36, color: low ? "#ef4444" : "#10b981", margin: "0 auto 6px" }} />
          <p style={{ fontSize: 26, fontWeight: 800, color: low ? "#ef4444" : "#059669" }}>Score — {score}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: low ? "#f87171" : "#34d399" }}>Predicted — {predicted}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Total",   val: data.total_questions   ?? 0, bg: "#f3e8ff", c: "#7c3aed" },
            { label: "Correct", val: data.correct_answers   ?? 0, bg: "#d1fae5", c: "#059669" },
            { label: "Wrong",   val: data.incorrect_answers ?? 0, bg: "#fee2e2", c: "#dc2626" },
          ].map(({ label, val, bg, c }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: "10px 4px", textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: c }}>{val}</p>
              <p style={{ fontSize: 10, color: "#6b7280" }}>{label}</p>
            </div>
          ))}
        </div>
        {(data.top_error_types?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>🚀 Common Mistakes</p>
            {data.top_error_types!.slice(0, 3).map((e, i) => <p key={i} style={{ fontSize: 12, color: "#6b7280" }}>• {e.type}</p>)}
          </div>
        )}
        {data.has_weak_areas && (data.weak_goals?.length ?? 0) > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>💡 Areas to Improve</p>
            {data.weak_goals!.map((g, i) => <p key={i} style={{ fontSize: 12, color: "#6b7280" }}>• {g.goal_title}</p>)}
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
  const color = pred >= 75 ? "#059669" : pred >= 50 ? "#d97706" : "#dc2626";
  const bg = pred >= 75 ? "#f0fdf4" : pred >= 50 ? "#fffbeb" : "#fef2f2";
  const border = pred >= 75 ? "#a7f3d0" : pred >= 50 ? "#fde68a" : "#fecaca";
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div style={{
        borderRadius: 16, padding: 16, minWidth: 240, maxWidth: 300,
        background: bg, border: `1.5px solid ${border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Trophy style={{ width: 18, height: 18, color }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(210,20%,12%)" }}>
            {data.goal_title ? `Goal: ${data.goal_title}` : "Goal Complete"}
          </span>
        </div>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 30, fontWeight: 800, color }}>{pred}%</span>
          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Predicted Score</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Concept", val: concept, bg2: "#eff6ff", c2: "#2563eb" },
            { label: "Exam",    val: exam,    bg2: "#f5f3ff", c2: "#7c3aed" },
          ].map(({ label, val, bg2, c2 }) => (
            <div key={label} style={{ background: bg2, borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: c2 }}>{val}%</p>
              <p style={{ fontSize: 10, color: "#6b7280" }}>{label}</p>
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
    <div style={{ background: "hsl(174,40%,94%)", borderBottom: "1px solid hsl(174,40%,85%)", flexShrink: 0 }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 40, border: "none", background: "transparent", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy style={{ width: 15, height: 15, color: "hsl(174,58%,42%)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(210,20%,12%)" }}>Learning Goals</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{doneCount}/{goals.length}</span>
        </div>
        {open
          ? <ChevronUp style={{ width: 15, height: 15, color: "hsl(174,58%,42%)" }} />
          : <ChevronDown style={{ width: 15, height: 15, color: "hsl(174,58%,42%)" }} />}
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
                  border: `2px solid ${completed ? "#34d399" : active ? "hsl(174,58%,42%)" : "#d1d5db"}`,
                  background: completed ? "#ecfdf5" : active ? "#fff" : "hsl(174,40%,90%)",
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {completed
                        ? <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 9 }}>✓</span></div>
                        : active
                          ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid hsl(174,58%,42%)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "hsl(174,58%,42%)" }} /></div>
                          : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #d1d5db" }} />
                      }
                      <span style={{ fontSize: 11, fontWeight: 700, color: completed ? "#059669" : active ? "hsl(174,58%,42%)" : "#9ca3af" }}>{i + 1}</span>
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
                        <div style={{ height: "100%", width: `${score}%`, background: completed ? "#10b981" : "hsl(174,58%,42%)", borderRadius: 2, transition: "width 0.4s ease" }} />
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
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,hsl(174,58%,42%),hsl(200,60%,50%))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 10, fontWeight: 700,
      }}>C.</div>
      <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: "hsl(174,40%,94%)" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 150, 300].map((d, i) => (
            <div key={i} className="animate-bounce" style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "hsl(174,58%,42%)", animationDelay: `${d}ms`,
            }} />
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

  // Derive user initials from JWT token
  const userInitials = (() => {
    try {
      const token = localStorage.getItem("cloop_token");
      if (!token) return "?";
      const payload = JSON.parse(atob(token.split(".")[1]));
      const name: string = payload.name ?? payload.email ?? "";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase() || "?";
    } catch { return "?"; }
  })();

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
      setMessages(mergeMessages(data.messages ?? [], data.aiMessages ?? []));
      setGoals(loadedGoals);
      // Topic is done if the topic flag is set OR all goals are completed
      const allGoalsDone = loadedGoals.length > 0 && loadedGoals.every(goalIsCompleted);
      setDone(data.topic.is_completed ?? allGoalsDone);
      setBaseTime(data.topic.time_spent_seconds ?? 0);
      setElapsed(0);
    } catch (e: unknown) {
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
    setMessages((p) => [...p, { id: tid, message: msg, sender: "user", created_at: new Date().toISOString() }]);
    try {
      const res: SendMessageResponse = await sendTopicChatMessage(
        Number(topicId!),
        { message: msg, session_time_seconds: baseTime + elapsed }
      );
      if (res.goals) {
        setGoals(res.goals);
        // Also set done if all goals are now completed (use chat_goal_progress)
        if (res.goals.every(goalIsCompleted)) setDone(true);
      }
      if (res.all_goals_completed) setDone(true);

      const corr = res.userCorrection;
      if (corr) {
        setMessages((p) => p.map((m) => m.id === tid
          ? { ...m, message_type: "user_correction", diff_html: corr.diff_html ?? corr.correction, emoji: corr.emoji }
          : m
        ));
      }

      // Handle score_prediction from new phase-based pipeline
      // When AI signals next_step_type = "predict_score", backend returns res.score_prediction
      if (res.score_prediction) {
        const sp: ScorePrediction = res.score_prediction;
        // Enrich with goal title if missing
        const goalTitle = sp.goal_title ?? goals.find((g) => g.id === sp.goal_id)?.title;
        const syntheticPred: TopicChatMessage = {
          id: Date.now() + 8888,
          sender: "ai",
          message: "score_prediction",
          message_type: "score_prediction",
          created_at: new Date().toISOString(),
          score_prediction: { ...sp, goal_title: goalTitle },
        };
        setMessages((p) => {
          const seen = new Set(p.map((m) => m.id));
          return seen.has(syntheticPred.id) ? p : [...p, syntheticPred];
        });
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

      setMessages((p) => {
        const merged = [...p, ...aiMsgs.map((m: TopicChatMessage) => ({ ...m, id: m.id ?? Date.now() + Math.random() })), ...extras];
        const seen = new Set<number>();
        return merged.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      });
      inputRef.current?.focus();
    } catch {
      setMessages((p) => p.filter((m) => m.id !== tid));
      setInput(msg);
    } finally {
      setSending(false);
      // Always restore focus to input so user can type immediately
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const renderMsg = (msg: TopicChatMessage) => {
    if (msg.message_type === "score_prediction") {
      const sp = msg.score_prediction;
      if (!sp) return null;
      return <ScorePredictionCard key={msg.id} data={sp} />;
    }
    if (msg.message_type === "session_summary") {
      // Data can live in msg.session_summary (preferred), msg itself, or parsed from diff_html
      const summaryCandidate: SessionSummaryData = msg;
      const data: SessionSummaryData =
        msg.session_summary ??
        (typeof msg.score_percent !== "undefined" ? summaryCandidate : null) ??
        (() => { try { return JSON.parse(msg.diff_html ?? "{}"); } catch { return {}; } })();
      return <SummaryCard key={msg.id} data={data} />;
    }
    if (msg.message_type === "user_correction" || msg.diff_html)
      return <CorrectionBubble key={msg.id} msg={msg} />;
    if (msg.sender === "user")
      return <UserBubble key={msg.id} msg={msg} />;
    return <AIBubble key={msg.id} msg={msg} onOption={(v) => send(v)} />;
  };

  const logout = () => {
    localStorage.removeItem("cloop_token");
    localStorage.removeItem("cloop_user");
    navigate("/login");
  };

  // ── Render ──
  // position:fixed + inset:0 = ALWAYS exactly the viewport.
  // No parent height issues, no SidebarProvider min-h-svh conflict.
  // Sidebar is a plain flex column. Chat panel is a flex column.
  // The messages div gets flex:1 + overflowY:auto — it ALWAYS works
  // because its parent has a definite pixel height from the fixed container.

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", fontFamily: "Inter,system-ui,sans-serif", background: "#f9fafb" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <div style={{
        width: 240, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "#fff", borderRight: "1px solid #e5e7eb",
      }}>
        {/* Logo */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,hsl(174,58%,42%),hsl(200,60%,50%))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>C</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "hsl(174,58%,42%)" }}>Cloop</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active ? "hsl(174,40%,94%)" : "transparent",
                color: active ? "hsl(174,58%,42%)" : "#6b7280",
                fontSize: 14, fontWeight: active ? 600 : 400,
                width: "100%", textAlign: "left",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon style={{ width: 17, height: 17 }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "10px 8px" }}>
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10, border: "none",
            cursor: "pointer", background: "transparent",
            color: "#9ca3af", fontSize: 14, width: "100%", textAlign: "left",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut style={{ width: 17, height: 17 }} />
            Log out
          </button>
        </div>
      </div>

      {/* ── RIGHT CHAT PANEL ─────────────────────────────────────────── */}
      {/* display:flex + flexDirection:column. This div has a definite height
          because its parent (position:fixed + inset:0) is always viewport height.
          So flex children below can use flex:1 reliably. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>

        {/* Header */}
        <div style={{
          flexShrink: 0, height: 52, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 20px",
          borderBottom: "1px solid #e5e7eb", background: "#fff",
        }}>
          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button onClick={() => navigate(-1)} style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: "transparent", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <ArrowLeft style={{ width: 16, height: 16, color: "#374151" }} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {loading ? "Loading…" : topicTitle}
              </p>
              {(subjectName || chapterTitle) && (
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {subjectName}{chapterTitle ? ` → ${chapterTitle}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Right: timer + done badge + bell + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "hsl(174,40%,94%)", borderRadius: 20, padding: "4px 12px",
            }}>
              <Clock style={{ width: 12, height: 12, color: "hsl(174,58%,42%)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(174,58%,42%)", fontVariantNumeric: "tabular-nums" }}>
                {fmt(baseTime + elapsed)}
              </span>
            </div>

            {done && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#d1fae5", borderRadius: 20, padding: "4px 10px" }}>
                ✓ Completed
              </span>
            )}

            <button style={{
              position: "relative", width: 32, height: 32, borderRadius: 8,
              border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Bell style={{ width: 16, height: 16, color: "#9ca3af" }} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #fff" }} />
            </button>

            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,hsl(174,58%,42%),hsl(200,60%,50%))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{userInitials}</div>
          </div>
        </div>

        {/* Goals bar */}
        {!loading && goals.length > 0 && (
          <GoalsBar goals={goals} open={goalsOpen} onToggle={() => setGoalsOpen((p) => !p)} />
        )}

        {/* Messages — flex:1 fills remaining height, overflowY:auto scrolls */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 12px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            {loading && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "80px 0", color: "#9ca3af", fontSize: 14 }}>
                <Loader2 className="animate-spin" style={{ width: 18, height: 18, color: "hsl(174,58%,42%)" }} />
                Loading topic…
              </div>
            )}

            {!loading && messages.length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "80px 0" }}>
                Starting your session…
              </p>
            )}

            {error && (
              <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {messages.map((m) => renderMsg(m))}
            {sending && <TypingDots />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar — flexShrink:0 always sticks to bottom */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #e5e7eb", background: "#fff", padding: "14px 20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {done ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "hsl(174,58%,42%)", marginBottom: 10 }}>
                  🎉 You've completed this topic!
                </p>
                <button onClick={() => navigate(-1)} style={{
                  width: "100%", padding: "10px 0", borderRadius: 12,
                  border: "1.5px solid #e5e7eb", background: "#fff",
                  fontSize: 13, cursor: "pointer", color: "#374151",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                >
                  ← Back to Topics
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); void send(); }}
                style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  placeholder="Type your answer…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !sending) { e.preventDefault(); void send(); } }}
                  disabled={sending}
                  style={{
                    flex: 1, borderRadius: 26, border: "1.5px solid #e5e7eb",
                    background: "#f9fafb", padding: "11px 20px",
                    fontSize: 14, outline: "none", color: "#111827",
                    opacity: sending ? 0.6 : 1,
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "hsl(174,58%,42%)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(174,58%,85%)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button type="submit" disabled={sending || !input.trim()} style={{
                  width: 42, height: 42, borderRadius: "50%", border: "none",
                  background: sending || !input.trim()
                    ? "#d1d5db"
                    : "linear-gradient(135deg,hsl(174,58%,42%),hsl(200,60%,50%))",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                  flexShrink: 0, transition: "background 0.15s",
                }}>
                  {sending
                    ? <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                    : <Send style={{ width: 16, height: 16 }} />}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
