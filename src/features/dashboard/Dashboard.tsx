import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, Loader2, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import PracticeDashboard from "@/features/practice/PracticeDashboard";

interface GenerationStatus {
  status: "pending" | "in_progress" | "completed" | "failed";
  chapters_generated?: boolean;
  topics_generated?: boolean;
  goals_generated?: boolean;
  error_message?: string;
}

interface UserSubject {
  subject_id: number;
  subject?: {
    name?: string;
    category?: string;
  };
  completion_percent?: number;
  total_chapters?: number;
  completed_chapters?: number;
  generation_status?: GenerationStatus | null;
}

interface UserProfile {
  name?: string;
  grade_level?: string;
  board?: string;
  user_subjects?: UserSubject[];
  num_lessons?: number;
}

const Dashboard = () => {
  const { mode } = usePracticeMode();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || `Profile fetch failed (${response.status})`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to fetch profile data.";
        console.error("Profile fetch error", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Polling for live curriculum generation progress (self-terminating)
  useEffect(() => {
    if (!profile) return;

    // Check if any subject is currently generating
    const hasGeneratingSubjects = profile.user_subjects?.some((item) => {
      const status = item.generation_status?.status;
      return status === "pending" || status === "in_progress";
    });

    if (!hasGeneratingSubjects) return;

    const token = localStorage.getItem("cloop_token");
    if (!token) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Polling profile failed:", err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [profile]);

  // Handle Practice Mode Home
  if (mode === "PRACTICE") {
    return <PracticeDashboard />;
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8d33ff]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="p-8 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  const subjects = profile?.user_subjects ?? [];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-16 sm:pb-12">
        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hi {profile?.name ? profile.name.split(" ")[0] : "Learner"},
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#8d33ff] font-bold mt-1">
            <button 
              onClick={() => navigate("/dashboard/statistics")}
              className="hover:underline cursor-pointer"
            >
              Your Learning Dashboard
            </button>
            {profile?.grade_level && <span> | Class {profile.grade_level}</span>}
            {profile?.board && <span> {profile.board}</span>}
          </p>
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#8d33ff]" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">Learning Progress Overview</h3>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-purple-50/50 rounded-2xl sm:rounded-3xl border border-purple-100">
              <p className="text-base sm:text-lg text-gray-500 font-medium">No subjects enrolled yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subjects.map((item: UserSubject) => {
                const safeSubjectId = String(item.subject_id).split(":")[0];
                const pct = Math.round(item.completion_percent || 0);
                const isNotStarted = pct === 0;

                const genStatus = item.generation_status?.status;
                const isGenerating = genStatus === "pending" || genStatus === "in_progress";

                return (
                  <Card
                    key={item.subject_id}
                    className={`rounded-2xl sm:rounded-3xl border-purple-200 transition-all duration-300 flex flex-col h-full overflow-hidden group ${
                      isGenerating
                        ? "opacity-80 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 cursor-not-allowed animate-pulse"
                        : "hover:shadow-xl hover:border-purple-300 cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50"
                    }`}
                    onClick={() => {
                      if (isGenerating) return;
                      navigate(
                        `/chapters?subjectId=${encodeURIComponent(safeSubjectId)}&subjectName=${encodeURIComponent(item.subject?.name || "Untitled")}`
                      );
                    }}
                  >
                    <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                      <div className="mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-purple-800 bg-purple-200 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-widest inline-flex items-center gap-1.5">
                          {isGenerating && <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-800" />}
                          {item.subject?.category || "General"}
                          {isGenerating && " (Generating)"}
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 sm:mb-6 group-hover:text-[#8d33ff] transition-colors leading-tight">{item.subject?.name || "Untitled"}</h4>

                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-8 flex-1">
                        <div>
                          <div className="flex justify-between text-[10px] sm:text-xs mb-1.5 sm:mb-2">
                            <span className="font-bold text-gray-500 uppercase tracking-tighter">Concept Mastery:</span>
                            <span className={`font-extrabold ${isNotStarted ? "text-gray-400" : "text-[#8d33ff]"}`}>
                              {isNotStarted ? "Not Started" : `${pct}%`}
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5 sm:h-2 bg-white/50" />
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-xs pb-1.5 sm:pb-2 border-b border-purple-200/50">
                          <span className="font-bold text-gray-500 uppercase tracking-tighter">Chapters:</span>
                          <span className="font-bold text-gray-900">{item.completed_chapters || 0} / {item.total_chapters || 0}</span>
                        </div>
                      </div>

                      {isGenerating ? (
                        <Button
                          disabled
                          className="w-full h-10 sm:h-12 bg-purple-100 text-purple-400 font-bold transition-all rounded-lg sm:rounded-xl gap-2 mt-auto text-xs sm:text-sm shadow-sm cursor-not-allowed"
                        >
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-purple-400" /> Generating Chapters...
                        </Button>
                      ) : (
                        <Button
                          className="w-full h-10 sm:h-12 bg-white text-[#8d33ff] font-bold hover:bg-[#8d33ff] hover:text-white transition-all rounded-lg sm:rounded-xl gap-2 mt-auto text-xs sm:text-sm shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Start Learning Session
                        </Button>
                      )}
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
};

export default Dashboard;
