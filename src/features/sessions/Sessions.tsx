import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Search, Bookmark, CheckCircle2, Clock, ChevronRight, Loader2, FolderOpen, X, Play, Target, Sparkles, TrendingUp } from "lucide-react";
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

type FilterType = "incomplete" | "completed" | "saved";

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

export default function Sessions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("incomplete");
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
  
  const tabs = [
    { label: "In Progress", value: "incomplete" as FilterType },
    { label: "Mastered Concepts", value: "completed" as FilterType },
    { label: "Saved Topics", value: "saved" as FilterType },
  ];

  const handleSaveToggle = async (e: React.MouseEvent, topicId: number, currentlySaved: boolean) => {
    e.stopPropagation();
    if (!userId) return;

    if (currentlySaved) {
      handleUnsave(topicId);
    } else {
      try {
        const res = await fetch(`${API}/api/saved-topics/save`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ userId, topicId }),
        });
        if (res.ok) {
          fetchSaved();
        }
      } catch (err) {
        console.error("Save error", err);
      }
    }
  };

  const isTopicSaved = (topicId: number) => savedTopics.some(t => t.topic_id === topicId);

  const navigateToTopic = (topicId: number) => {
    navigate(`/topic-chat?topicId=${topicId}`);
  };

  return (
    <DashboardLayout title="Sessions">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            Learning Sessions & Concept Tracking
          </h2>
          <p className="text-base text-[#8d33ff] font-bold mt-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Monitor your progress and master every concept
          </p>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === tab.value 
                    ? "bg-white text-[#8d33ff] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts or sessions..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-[#8d33ff] focus:border-transparent text-sm font-medium shadow-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Active Sessions List */}
        <div className="space-y-4">
          {loading || (filter === "saved" && savedLoading) ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#8d33ff]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-purple-50/50 rounded-3xl border border-purple-100 space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-purple-100">
                <FolderOpen className="w-8 h-8 text-purple-200" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-gray-900 mb-1">
                  {filter === "saved" ? "No saved topics yet" : "No learning sessions yet"}
                </h4>
                <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">
                  {filter === "saved" 
                    ? "Bookmark concepts during your study sessions to find them here"
                    : "Start a session to begin concept diagnosis and mastery tracking"}
                </p>
              </div>
              {filter !== "saved" && (
                <Button 
                    onClick={() => navigate("/dashboard")}
                    className="h-12 px-8 bg-[#8d33ff] hover:bg-[#7a2de0] text-white rounded-xl text-base font-bold shadow-lg shadow-purple-200"
                >
                    Start Learning Session
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((session) => {
                const saved = session._saved || isTopicSaved(session.topic_id);
                return (
                  <div key={session.topic_id}
                    onClick={() => navigateToTopic(session.topic_id)}
                    className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-[#8d33ff] hover:shadow-lg hover:shadow-purple-50 transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      session.is_completed ? "bg-green-100" : "bg-purple-100"
                    }`}>
                      {session.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-[#8d33ff]" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-extrabold text-gray-900 truncate group-hover:text-[#8d33ff] transition-colors">{session.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                        {session.subject}{session.chapter ? ` • ${session.chapter}` : ""}
                      </p>
                    </div>

                    {!session.is_completed && (
                      <div className="hidden md:block w-36 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                          <span>MASTERY</span>
                          <span className="text-[#8d33ff]">{Math.round(session.completion_percent || 0)}%</span>
                        </div>
                        <Progress value={session.completion_percent || 0} className="h-1.5 bg-gray-50" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleSaveToggle(e, session.topic_id, saved)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            saved ? "bg-amber-100 text-amber-600" : "hover:bg-gray-100 text-gray-300 hover:text-gray-500"
                          }`}
                          title={saved ? "Unsave Concept" : "Save for Revision"}
                        >
                          <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                        </button>
                        
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#8d33ff]" />
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subjects with Active Learning Data */}
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#8d33ff]" />
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900">Subjects with Active Learning Data</h3>
          </div>

          {subjects.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-500 font-medium">No active learning data available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((s: any) => {
                const score = subjectScore(s.id);
                return (
                  <Card
                    key={s.id}
                    className="rounded-3xl border-purple-200 hover:shadow-xl hover:border-[#8d33ff] transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden group"
                    onClick={() => navigate(`/chapters?subjectId=${s.id}&subjectName=${encodeURIComponent(s.name)}`)}
                  >
                    <CardContent className="p-6">
                      <h4 className="text-xl font-extrabold text-gray-900 mb-5 group-hover:text-[#8d33ff] transition-colors leading-tight">{s.name}</h4>
                      
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-between p-3.5 bg-white/60 rounded-xl border border-white">
                           <span className="text-xs font-bold text-gray-500">Predicted Score:</span>
                           <span className="text-lg font-black text-[#8d33ff]">{score}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3.5 bg-white/60 rounded-xl border border-white">
                           <span className="text-xs font-bold text-gray-500">Concept Status:</span>
                           <span className="text-xs font-extrabold text-green-600 uppercase tracking-wider">Improving</span>
                        </div>
                      </div>

                      <Button className="w-full h-11 bg-white text-[#8d33ff] font-bold hover:bg-[#8d33ff] hover:text-white transition-all rounded-xl gap-2 text-xs shadow-sm border-0">
                        <Play className="w-4 h-4 fill-current" /> Continue Learning
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
