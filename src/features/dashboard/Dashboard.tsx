import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Loader2 } from "lucide-react";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import PracticeDashboard from "@/features/practice/PracticeDashboard";

interface UserSubject {
  id: number;
  subject_id: number;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  category?: string;
  grade_level?: string;
  completion_percent?: number;
  total_chapters?: number;
  completed_chapters?: number;
}

interface UserProfile {
  id: number;
  user_id: number;
  name: string;
  grade_level: string;
  board: string;
  user_subjects: UserSubject[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { mode } = usePracticeMode();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("cloop_token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("cloop_token");
        localStorage.removeItem("cloop_user");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Practice Mode Home
  if (mode === "PRACTICE") {
    return <PracticeDashboard />;
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
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

  const subjects = [...(profile?.user_subjects ?? [])].sort((a, b) => (a.id || 0) - (b.id || 0));

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-16 sm:pb-12">
        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hi {profile?.name ? profile.name.split(" ")[0] : "Learner"},
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-black font-semibold mt-1">
            <button 
              onClick={() => navigate("/dashboard/statistics")}
              className="hover:underline cursor-pointer"
            >
              Your Learning Dashboard
            </button>
            {profile?.grade_level && (
              <span> | {profile.grade_level.toLowerCase().startsWith('class') || profile.grade_level.toLowerCase().startsWith('grade') ? profile.grade_level : `Class ${profile.grade_level}`}</span>
            )}
            {profile?.board && <span> {profile.board}</span>}
          </p>
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-zinc-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">Learning Progress Overview</h3>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-zinc-50 rounded-2xl sm:rounded-3xl border border-zinc-200">
              <p className="text-base sm:text-lg text-gray-500 font-medium">No subjects enrolled yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subjects.map((item: UserSubject) => {
                const safeSubjectId = String(item.subject_id).split(":")[0];
                const pct = Math.round(item.completion_percent || 0);
                const isNotStarted = pct === 0;

                return (
                  <Card
                    key={item.subject_id}
                    className="rounded-2xl sm:rounded-3xl transition-all duration-300 flex flex-col h-full overflow-hidden group border-zinc-200 hover:shadow-xl hover:border-black cursor-pointer bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white"
                    onClick={() => {
                      navigate(
                        `/chapters?subjectId=${encodeURIComponent(safeSubjectId)}&subjectName=${encodeURIComponent(item.subject?.name || "Untitled")}`
                      );
                    }}
                  >
                    <CardContent className="p-5 sm:p-7 flex flex-col justify-between flex-1 space-y-6">
                      <div>
                        {/* Subject Header Info */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 bg-white/10 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md">
                            {item.category || "Academic"}
                          </span>
                        </div>

                        {/* Subject Title */}
                        <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-zinc-200 transition-colors leading-tight">
                          {item.subject?.name || "Untitled Subject"}
                        </h4>

                        {/* Concept Mastery Metric */}
                        <div className="mt-6 space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                            <span className="text-zinc-400 uppercase tracking-wider text-[10px] sm:text-[11px]">Concept Mastery:</span>
                            <span className={isNotStarted ? "text-zinc-400" : "text-white"}>
                              {isNotStarted ? "Not Started" : `${pct}%`}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-white to-zinc-400 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Chapters Completed */}
                        <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-bold text-zinc-400 uppercase tracking-tighter text-[11px]">Chapters:</span>
                          <span className="font-bold text-white">{item.completed_chapters || 0} / {item.total_chapters || 0}</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-2">
                        <Button
                          className="w-full bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl gap-2 shadow-lg shadow-black/20 transition-all group-hover:scale-[1.02]"
                        >
                          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Start Learning Session
                        </Button>
                      </div>
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
