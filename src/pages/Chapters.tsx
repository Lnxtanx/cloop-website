import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchChapters } from "@/lib/api/chapters";

interface Chapter {
  id: number;
  title: string;
  description?: string;
  completion_percent: number;
  total_topics: number;
  completed_topics: number;
  created_at?: string;
}

const statusConfig = {
  completed: { label: "Completed", icon: CheckCircle, color: "bg-success/10 text-success" },
  "in-progress": { label: "In Progress", icon: Play, color: "bg-primary/10 text-primary" },
};

const Chapters = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectIdRaw = searchParams.get("subjectId");
  const subjectName = searchParams.get("subjectName");
  const subjectId = subjectIdRaw ? subjectIdRaw.split(":")[0] : null;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChapters = useCallback(async () => {
    if (!subjectId) {
      setError("Missing subject");
      setLoading(false);
      return;
    }

    const parsedId = Number(subjectId);
    if (Number.isNaN(parsedId)) {
      setError("Invalid subject ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchChapters(parsedId);
      setChapters(data.chapters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load chapters";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    const token = localStorage.getItem("cloop_token");

    if (!token || !subjectId) {
      navigate("/login");
      return;
    }

    loadChapters();
  }, [subjectId, navigate, loadChapters]);

  const getChapterStatus = (chapter: Chapter): "completed" | "in-progress" => {
    if (chapter.completion_percent >= 100 && chapter.total_topics > 0 && chapter.completed_topics >= chapter.total_topics) return "completed";
    return "in-progress";
  };

  const handleChapterClick = (chapter: Chapter) => {
    navigate(`/topics?chapterId=${chapter.id}&chapterTitle=${encodeURIComponent(chapter.title)}&subjectName=${encodeURIComponent(subjectName || "")}`);
  };

  const totalTopics = chapters.reduce((sum, ch) => sum + ch.total_topics, 0);
  const completedTopics = chapters.reduce((sum, ch) => sum + ch.completed_topics, 0);
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout title="Chapters">
        <div className="p-8 text-center">Loading chapters...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chapters">
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> {subjectName}
            </h2>
            <p className="text-muted-foreground mt-1">{totalTopics} topics · {chapters.length} chapters</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Progress</span>
            <span className="text-sm font-bold text-primary">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">{completedTopics} of {totalTopics} topics completed</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <Button variant="outline" size="sm" className="mt-3 ml-0" onClick={loadChapters}>Reload</Button>
          </div>
        )}

        {/* Chapters List */}
        <div className="space-y-3">
          {chapters.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">No chapters available for this subject</div>
          ) : (
            chapters.map((ch, i) => {
              const status = getChapterStatus(ch);
              const cfg = statusConfig[status];
              return (
                <Card
                  key={ch.id}
                  className="border-border transition-all hover:shadow-md cursor-pointer"
                  onClick={() => handleChapterClick(ch)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${status === "in-progress" ? "hero-gradient" : status === "completed" ? "bg-success/10" : "bg-muted"}`}>
                      <span className={`text-sm font-bold ${status === "in-progress" ? "text-primary-foreground" : status === "completed" ? "text-success" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{ch.title}</h4>
                        <Badge variant="secondary" className={`text-[10px] ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {ch.description && <p className="text-xs text-muted-foreground">{ch.description}</p>}
                          <div className="flex items-center gap-3 mt-2">
                        <Progress value={ch.total_topics > 0 ? (ch.completed_topics / ch.total_topics) * 100 : 0} className="h-1.5 flex-1 max-w-[200px]" />
                        <span className="text-xs text-muted-foreground">
                          {ch.completed_topics}/{ch.total_topics}
                        </span>
                      </div>
                    </div>
                    {status === "in-progress" && <Button size="sm" className="hero-gradient border-0 shrink-0">Continue</Button>}
                    {status === "completed" && <Button size="sm" variant="outline" className="shrink-0">Review</Button>}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chapters;
