import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Search, Bookmark, CheckCircle2, Clock, ChevronRight, Loader2, FolderOpen, X, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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

const scoreColor = (n: number) => (n >= 80 ? "#8B5CF6" : n >= 60 ? "#A78BFA" : "#C4B5FD");

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
              padding: "8px 20px", borderRadius: 20, border: "1.5px solid",
              borderColor: filter === f ? "#7c3aed" : "#E5E7EB",
              background: filter === f ? "#7c3aed" : "#fff",
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
            <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#7c3aed" }} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {filtered.map((session) => (
              <div key={session.topic_id}
                style={{
                  background: session._saved ? "#fff" : session.is_completed ? "#f3e8ff" : "#fff",
                  borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)", cursor: "pointer",
                  border: session._saved ? "1px solid #E5E7EB" : "1.5px solid #c4b5fd",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.2s",
                }}
                onClick={() => navigateToTopic(session.topic_id)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: session._saved ? "#ede9fe" : session.is_completed ? "#7c3aed" : "#f3e8ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {session._saved ? (
                    <Bookmark style={{ width: 20, height: 20, color: "#7c3aed", fill: "#7c3aed" }} />
                  ) : session.is_completed ? (
                    <CheckCircle2 style={{ width: 22, height: 22, color: "#fff" }} />
                  ) : (
                    <Clock style={{ width: 22, height: 22, color: "#7c3aed" }} />
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
                {!session.is_completed && !session._saved && (
                  <div style={{ flexShrink: 0, width: 120 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>{Math.round(session.completion_percent || 0)}%</span>
                    </div>
                    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${session.completion_percent || 0}%`,
                        background: "linear-gradient(90deg, #8B5CF6, #7c3aed)",
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>
                )}
                {session._saved && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUnsave(session.topic_id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0,
                    }}
                  >
                    <X style={{ width: 18, height: 18, color: "#9CA3AF" }} />
                  </button>
                )}
                <ChevronRight style={{ width: 18, height: 18, color: "#9CA3AF", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}

        {/* Enrolled Subjects */}
        <p style={{ fontSize: 20, fontWeight: 700, color: "#1F2937", marginBottom: 16 }}>Enrolled Subjects</p>
        {subjects.length === 0 ? (
          <p style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No subjects enrolled</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((s: any) => {
              const score = subjectScore(s.id);
              return (
                <Card
                  key={s.id}
                  className="border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50"
                  onClick={() => window.location.href = `/chapters?subjectId=${s.id}&subjectName=${encodeURIComponent(s.name)}`}
                >
                  <CardContent className="p-5">
                    <h4 className="font-semibold mt-1 mb-2">{s.name}</h4>
                    <p style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score), margin: "0 0 8px" }}>
                      Predicted Score: {score}%
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">
                        Click to view chapters
                      </span>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 p-1">
                        <Play className="w-3 h-3" /> Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
