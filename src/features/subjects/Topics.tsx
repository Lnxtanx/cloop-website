import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck, Play, ArrowLeft } from "lucide-react";
import { fetchTopics, saveTopic, unsaveTopic, fetchSavedTopics } from "@/lib/api/chapters";

interface Topic {
  id: number;
  title: string;
  is_completed: boolean;
  completion_percent: number;
  time_spent_seconds: number;
  content?: string;
}

interface ChapterInfo {
  id: number;
  title: string;
  completed_topics: number;
  total_topics: number;
  completion_percent: number;
}

const Topics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chapterIdRaw = searchParams.get("chapterId");
  const chapterTitle = searchParams.get("chapterTitle");
  const subjectName = searchParams.get("subjectName");
  const chapterId = chapterIdRaw ? chapterIdRaw.split(":")[0] : null;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [chapter, setChapter] = useState<ChapterInfo | null>(null);
  const [savedTopicIds, setSavedTopicIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    const user = localStorage.getItem("cloop_user");

    if (!token || !user || !chapterId) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(user);
    const selectedUserId = parsedUser?.user_id;

    if (!selectedUserId) {
      navigate("/");
      return;
    }

    loadTopics();
    loadSavedTopics(selectedUserId);
  }, [chapterId, navigate]);

  const loadTopics = async () => {
    if (!chapterId) {
      setError("Missing chapter ID");
      setLoading(false);
      return;
    }

    const parsedId = Number(chapterId);
    if (Number.isNaN(parsedId)) {
      setError("Invalid chapter ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchTopics(parsedId);
      setTopics(data.topics);
      setChapter(data.chapter);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load topics";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedTopics = async (userId: number) => {
    try {
      const saved = await fetchSavedTopics(userId);
      setSavedTopicIds(new Set(saved.map((s) => s.topic_id)));
    } catch (err: unknown) {
      console.error("Failed to load saved topics", err);
    }
  };

  const handleToggleSave = async (topicId: number) => {
    if (!userId) {
      console.warn("User not found while toggling save topic");
      return;
    }

    const isSaved = savedTopicIds.has(topicId);
    setSaving(topicId);

    const newSaved = new Set(savedTopicIds);
    if (isSaved) {
      newSaved.delete(topicId);
    } else {
      newSaved.add(topicId);
    }
    setSavedTopicIds(newSaved);

    try {
      if (isSaved) {
        await unsaveTopic(userId, topicId);
      } else {
        await saveTopic(userId, topicId);
      }
    } catch (err: unknown) {
      setSavedTopicIds(savedTopicIds); // Revert
      console.error("Failed to toggle save topic", err);
    } finally {
      setSaving(null);
    }
  };

  const handleTopicPress = (topic: Topic) => {
    navigate(
      `/topic-chat?topicId=${topic.id}&topicTitle=${encodeURIComponent(topic.title)}&chapterTitle=${encodeURIComponent(chapterTitle || "")}&subjectName=${encodeURIComponent(subjectName || "")}`
    );
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds === 0) return "Not started";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const getCompletionColor = (percent: number) => {
    if (percent >= 80) return "text-blue-700";
    if (percent >= 50) return "text-blue-600";
    return "text-blue-500";
  };

  const user = localStorage.getItem("cloop_user") ? JSON.parse(localStorage.getItem("cloop_user")!) : null;
  const userId = user?.user_id;

  if (loading) {
    return (
      <DashboardLayout title="Topics">
        <div className="p-6 sm:p-8 text-center text-sm text-muted-foreground">Loading topics...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Topics">
        <div className="p-6 sm:p-8 text-center text-red-500 text-sm">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Topics">
      <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl mx-auto pb-16 sm:pb-0">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="w-8 h-8 sm:w-10 sm:h-10">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{chapterTitle}</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">{subjectName}</p>
          </div>
        </div>

        {/* Progress Summary */}
        {chapter && (() => {
          const completedCount = topics.filter(t => t.is_completed).length;
          const totalCount = topics.length || chapter.total_topics;
          const computedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-100 to-blue-50">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">Chapter Progress</span>
                    <span className="text-sm sm:text-lg font-bold text-blue-700">{computedPercent}%</span>
                  </div>
                  <Progress value={computedPercent} className="h-1.5 sm:h-2" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {completedCount} of {totalCount} topics completed
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Topics List */}
        <div className="space-y-2 sm:space-y-3">
          {topics.map((topic, index) => (
            <Card
              key={topic.id}
              className={`border-gray-200 hover:border-blue-300 transition-all hover:shadow-md cursor-pointer ${
                topic.is_completed ? "bg-blue-50/50" : "bg-white"
              }`}
              onClick={() => handleTopicPress(topic)}
            >
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                {/* Status Icon */}
                <div
                   className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                     topic.is_completed ? "bg-blue-100" : "bg-blue-50"
                   }`}
                 >
                   <span className={`text-xs sm:text-sm font-bold ${topic.is_completed ? "text-blue-700" : "text-blue-600"}`}>
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                     <h4 className={`font-semibold text-xs sm:text-sm truncate ${topic.is_completed ? "text-blue-700" : ""}`}>
                      {topic.title}
                    </h4>
                    {topic.is_completed && <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] bg-blue-100 text-blue-700 rounded-full">Done</span>}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      ⏱️ {formatTimeSpent(topic.time_spent_seconds)}
                    </span>
                    {topic.content && <span className="hidden sm:flex items-center gap-0.5">📄 Content</span>}
                  </div>

                  {/* Progress Bar */}
                  {topic.completion_percent > 0 && (
                    <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                      <Progress value={topic.completion_percent} className="h-1 sm:h-1.5" />
                      <p className={`text-[10px] sm:text-xs font-medium ${getCompletionColor(topic.completion_percent)}`}>
                        {Math.round(topic.completion_percent)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* Bookmark Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId) handleToggleSave(topic.id);
                    }}
                    disabled={saving === topic.id}
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  >
                    {savedTopicIds.has(topic.id) ? (
                      <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    ) : (
                      <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Play Button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicPress(topic);
                    }}
                  >
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" /> Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {topics.length === 0 && (
            <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm">No topics found for this chapter</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Topics;
