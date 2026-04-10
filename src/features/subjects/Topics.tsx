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
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    const selectedUserId = parsedUser?.user_id;

    if (!selectedUserId) {
      navigate("/login");
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
    if (minutes > 0) return `${minutes} min`;
    return `${seconds}s`;
  };

  const getCompletionColor = (percent: number) => {
    if (percent >= 80) return "text-purple-700";
    if (percent >= 50) return "text-purple-600";
    return "text-purple-500";
  };

  const user = localStorage.getItem("cloop_user") ? JSON.parse(localStorage.getItem("cloop_user")!) : null;
  const userId = user?.user_id;

  if (loading) {
    return (
      <DashboardLayout title="Topics">
        <div className="p-8 text-center">Loading topics...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Topics">
        <div className="p-8 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Topics">
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{chapterTitle}</h2>
            <p className="text-muted-foreground text-sm">{subjectName}</p>
          </div>
        </div>

        {/* Progress Summary */}
        {chapter && (() => {
          const completedCount = topics.filter(t => t.is_completed).length;
          const totalCount = topics.length || chapter.total_topics;
          const computedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-100 to-purple-50">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Chapter Progress</span>
                    <span className="text-lg font-bold text-purple-700">{computedPercent}%</span>
                  </div>
                  <Progress value={computedPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {completedCount} of {totalCount} topics completed
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Topics List */}
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <Card
              key={topic.id}
              className={`border-gray-200 hover:border-purple-300 transition-all hover:shadow-md cursor-pointer ${
                topic.is_completed ? "bg-purple-50/50" : "bg-white"
              }`}
              onClick={() => handleTopicPress(topic)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Status Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    topic.is_completed ? "bg-purple-100" : "bg-purple-50"
                  }`}
                >
                  <span className={`text-sm font-bold ${topic.is_completed ? "text-purple-700" : "text-purple-600"}`}>
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${topic.is_completed ? "text-purple-700" : ""}`}>
                      {topic.title}
                    </h4>
                    {topic.is_completed && <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full">Completed</span>}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      ⏱️ {formatTimeSpent(topic.time_spent_seconds)}
                    </span>
                    {topic.content && <span className="flex items-center gap-1">📄 Has content</span>}
                  </div>

                  {/* Progress Bar */}
                  {topic.completion_percent > 0 && (
                    <div className="mt-2 space-y-1">
                      <Progress value={topic.completion_percent} className="h-1.5" />
                      <p className={`text-xs font-medium ${getCompletionColor(topic.completion_percent)}`}>
                        {Math.round(topic.completion_percent)}% complete
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Bookmark Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId) handleToggleSave(topic.id);
                    }}
                    disabled={saving === topic.id}
                    className="w-8 h-8"
                  >
                    {savedTopicIds.has(topic.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-purple-600" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Play Button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicPress(topic);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" /> Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {topics.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No topics found for this chapter</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Topics;
