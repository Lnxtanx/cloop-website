import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Bookmark, CheckCircle2, Clock, ChevronRight, Loader2, FolderOpen, X } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

const token = () => localStorage.getItem("cloop_token") ?? "";

const get = (path: string) =>
  fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) =>
    r.ok ? r.json() : Promise.reject(r)
  );

const getUserId = (): number | null => {
  const t = localStorage.getItem("cloop_token");
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload.userId || payload.user_id || payload.id || null;
  } catch {
    return null;
  }
};

type FilterType = "saved" | "completed" | "incomplete";

interface ChatHistoryItem {
  topic_id: number;
  title: string;
  subject: string;
  chapter: string;
  is_completed: boolean;
  completion_percent: number;
  chat_count: number;
}

interface SavedTopic {
  id: number;
  topic_id: number;
  topics: {
    title: string;
    is_completed: boolean;
    completion_percent: number;
    chapters?: { title: string };
    subjects?: { id: number; name: string };
  };
}

const scoreColor = (n: number) => (n >= 80 ? "#10B981" : n >= 60 ? "#F59E0B" : "#EF4444");

export default function Sessions() {
  const [filter, setFilter] = useState<FilterType>("saved");
  const [search, setSearch] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);

  const userId = getUserId();

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setSavedLoading(true);
    try {
      const data = await get(`/api/saved-topics?userId=${userId}`);
      setSavedTopics(Array.isArray(data) ? data : []);
    } catch {
      setSavedTopics([]);
    } finally {
      setSavedLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      get("/api/profile/chat-history"),
      get("/api/profile"),
      get("/api/profile/learning-analytics/overview"),
    ]).then(([r1, r2, r3]) => {
      if (r1.status === "fulfilled") setChatHistory(r1.value?.chatHistory ?? []);
      if (r2.status === "fulfilled") {
        const p = r2.value;
        const subs =
          p?.user_subjects?.map((us: any) => us.subject).filter(Boolean) ??
          p?.subjects ?? [];
        setSubjects(subs);
      }
      if (r3.status === "fulfilled") setOverview(r3.value);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (filter === "saved") fetchSaved();
  }, [filter, fetchSaved]);

  const handleUnsave = async (topicId: number) => {
    if (!userId) return;
    setSavedTopics((prev) => prev.filter((t) => t.topic_id !== topicId));
    try {
      await fetch(`${API}/api/saved-topics/unsave`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userId, topicId }),
      });
    } catch {
      fetchSaved();
    }
  };

  const subjectScore = (id: number) => {
    if (!overview?.by_subject) return 15;
    const s = overview.by_subject.find((s: any) => s.subject_id === id);
    return s ? Math.min(100, Math.round((s.average_score || 0) + 15)) : 15;
  };

  const getFiltered = (): any[] => {
    const q = search.toLowerCase();
    if (filter === "saved") {
      return savedTopics
        .map((st) => ({
          topic_id: st.topic_id,
          title: st.topics.title,
          subject: st.topics.subjects?.name ?? "Unknown",
          chapter: st.topics.chapters?.title ?? "",
          is_completed: st.topics.is_completed,
          completion_percent: st.topics.completion_percent,
          chat_count: 0,
          _saved: true,
        }))
        .filter((s) => !q || s.title.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q));
    }
    return chatHistory
      .filter((s) => {
        if (q && !s.title.toLowerCase().includes(q) && !s.subject.toLowerCase().includes(q)) return false;
        if (filter === "completed") return s.is_completed;
        if (filter === "incomplete") return !s.is_completed;
        return true;
      });
  };

  const filtered = getFiltered();
  const sectionLabel = filter === "saved" ? "Saved Sessions" : filter === "completed" ? "Completed Sessions" : "Incomplete Sessions";

  const navigateToTopic = (topicId: number) => {
    window.location.href = `/topic-chat?topicId=${topicId}`;
  };

  return (
    <DashboardLayout title="Sessions">
      <div style={{ maxWidth: 860, margin: "0 auto" }} className="animate-fade-in">

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#EDE9FE", borderRadius: 20, padding: "8px 16px", marginBottom: 20,
        }}>
          <Search style={{ width: 18, height: 18, color: "#9CA3AF", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Topics"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: 14, color: "#1F2937",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <X style={{ width: 16, height: 16, color: "#8B5CF6" }} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {(["saved", "completed", "incomplete"] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 20px", borderRadius: 20, border: "1px solid",
              borderColor: filter === f ? "hsl(174,58%,42%)" : "#E5E7EB",
              background: filter === f ? "hsl(174,58%,42%)" : "#fff",
              color: filter === f ? "#fff" : "#6B7280",
              fontWeight: 500, fontSize: 14, cursor: "pointer",
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Section heading */}
        <p style={{ fontSize: 20, fontWeight: 700, color: "#1F2937", marginBottom: 16 }}>{sectionLabel}</p>

        {/* Session cards */}
        {loading || (filter === "saved" && savedLoading) ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "hsl(174,58%,42%)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", marginBottom: 32 }}>
            <FolderOpen style={{ width: 56, height: 56, color: "#D1D5DB" }} />
            <p style={{ fontWeight: 600, fontSize: 16, color: "#6B7280", marginTop: 16, marginBottom: 6 }}>
              No {filter} sessions
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>Your {filter} sessions will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {filtered.map((session) =>
              filter === "saved" ? (
                /* Saved card */
                <div key={session.topic_id}
                  style={{
                    background: "#fff", borderRadius: 16, padding: "14px 16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                  onClick={() => navigateToTopic(session.topic_id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUnsave(session.topic_id); }}
                    style={{
                      width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    <Bookmark style={{ width: 20, height: 20, color: "hsl(174,58%,42%)", fill: "hsl(174,58%,42%)" }} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: "#1F2937", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.title}
                    </p>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>{session.subject}</p>
                  </div>
                  <ChevronRight style={{ width: 18, height: 18, color: "#9CA3AF", flexShrink: 0 }} />
                </div>
              ) : (
                /* Completed / Incomplete card */
                <div key={session.topic_id}
                  style={{
                    background: "#fff", borderRadius: 16, padding: 16,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)", cursor: "pointer",
                  }}
                  onClick={() => navigateToTopic(session.topic_id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: session.is_completed ? 0 : 10 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {session.is_completed ? (
                        <CheckCircle2 style={{ width: 22, height: 22, color: "#10B981" }} />
                      ) : (
                        <Clock style={{ width: 22, height: 22, color: "hsl(174,58%,42%)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, color: "#1F2937", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.title}
                      </p>
                      <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>
                        {session.subject}{session.chapter ? ` — ${session.chapter}` : ""}
                      </p>
                    </div>
                    <ChevronRight style={{ width: 18, height: 18, color: "#9CA3AF", flexShrink: 0 }} />
                  </div>
                  {!session.is_completed && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#6B7280" }}>In progress: {Math.round(session.completion_percent || 0)}%</span>
                        <span style={{ fontSize: 12, color: "#6B7280" }}>{session.chat_count || 0} sessions</span>
                      </div>
                      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          width: `${session.completion_percent || 0}%`,
                          background: "hsl(174,58%,42%)",
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Enrolled Subjects */}
        <p style={{ fontSize: 20, fontWeight: 700, color: "#1F2937", marginBottom: 16 }}>Enrolled Subjects</p>
        {subjects.length === 0 ? (
          <p style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No subjects enrolled</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
            {subjects.map((s: any) => {
              const score = subjectScore(s.id);
              return (
                <div key={s.id}
                  onClick={() => window.location.href = `/chapters?subjectId=${s.id}&subjectName=${encodeURIComponent(s.name)}`}
                  style={{
                    background: "#fff", borderRadius: 16, padding: "14px 10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)", cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", margin: "0 auto 8px",
                    background: "hsl(174,40%,90%)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 20, fontWeight: 800, color: "hsl(174,58%,35%)",
                  }}>
                    {s.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#1F2937", margin: "0 0 4px" }}>{s.name}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: scoreColor(score), margin: 0 }}>
                    Predicted Score: {score}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
