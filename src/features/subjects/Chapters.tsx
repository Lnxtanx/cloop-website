import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
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
  completed: { label: "Completed", icon: CheckCircle, color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "In Progress", icon: Play, color: "bg-blue-50 text-blue-600" },
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
      navigate("/");
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
        <div className="p-6 sm:p-8 text-center text-sm text-muted-foreground">Loading chapters...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chapters">
      <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl mx-auto pb-16 sm:pb-0">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="w-8 h-8 sm:w-10 sm:h-10">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2 truncate">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" /> 
              <span className="truncate">{subjectName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              {totalTopics} topics · {chapters.length} chapters
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2 sm:space-y-3 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs sm:text-sm">Progress</span>
            <span className="text-xs sm:text-sm font-bold text-blue-600">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5 sm:h-2" />
          <p className="text-[11px] sm:text-xs text-muted-foreground">{completedTopics} of {totalTopics} topics completed</p>
        </div>

        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm">
            {error}
            <Button variant="outline" size="sm" className="mt-2 sm:mt-3 ml-0 text-xs" onClick={loadChapters}>Reload</Button>
          </div>
        )}

        {/* Chapters List */}
        <div className="space-y-2 sm:space-y-3">
          {chapters.length === 0 ? (
            <div className="text-center text-muted-foreground p-6 sm:p-8 text-sm">No chapters available for this subject</div>
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
                  <CardContent className="p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${status === "in-progress" ? "bg-blue-100" : status === "completed" ? "bg-blue-200" : "bg-gray-100"}`}>
                      <span className={`text-xs sm:text-sm font-bold ${status === "in-progress" ? "text-blue-700" : status === "completed" ? "text-blue-800" : "text-gray-500"}`}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <h4 className="font-semibold text-xs sm:text-sm truncate">{ch.title}</h4>
                        <Badge variant="secondary" className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {ch.description && <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{ch.description}</p>}
                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                        <Progress value={ch.total_topics > 0 ? (ch.completed_topics / ch.total_topics) * 100 : 0} className="h-1 sm:h-1.5 flex-1 max-w-[120px] sm:max-w-[200px]" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {ch.completed_topics}/{ch.total_topics}
                        </span>
                      </div>
                    </div>
                    {status === "in-progress" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0 shrink-0 text-[10px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3">Continue</Button>
                    )}
                    {status === "completed" && (
                      <Button size="sm" variant="outline" className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50 text-[10px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3">Review</Button>
                    )}
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
