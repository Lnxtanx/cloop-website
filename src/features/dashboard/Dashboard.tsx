import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, Loader2, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import PracticeDashboard from "@/features/practice/PracticeDashboard";

interface UserSubject {
  subject_id: number;
  subject?: {
    name?: string;
    category?: string;
  };
  completion_percent?: number;
  total_chapters?: number;
  completed_chapters?: number;
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
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hi {profile?.name ? profile.name.split(" ")[0] : "Learner"},
          </h2>
          <p className="text-base lg:text-lg text-[#8d33ff] font-bold mt-1">
            Your Learning Dashboard {profile?.grade_level && `| Class ${profile.grade_level}`} {profile?.board && ` ${profile.board}`}
          </p>
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#8d33ff]" />
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900">Learning Progress Overview</h3>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-20 bg-purple-50/50 rounded-3xl border border-purple-100">
              <p className="text-lg text-gray-500 font-medium">No subjects enrolled yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((item: UserSubject) => {
                const safeSubjectId = String(item.subject_id).split(":")[0];
                const pct = Math.round(item.completion_percent || 0);
                const isNotStarted = pct === 0;

                return (
                  <Card
                    key={item.subject_id}
                    className="rounded-3xl border-purple-200 hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden group flex flex-col h-full"
                    onClick={() =>
                      navigate(
                        `/chapters?subjectId=${encodeURIComponent(safeSubjectId)}&subjectName=${encodeURIComponent(item.subject?.name || "Untitled")}`
                      )
                    }
                  >
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                          <span className="text-[10px] font-black text-purple-800 bg-purple-200 rounded-full px-3 py-1 uppercase tracking-widest">
                            {item.subject?.category || "General"}
                          </span>
                      </div>
                      
                      <h4 className="text-xl font-extrabold text-gray-900 mb-6 group-hover:text-[#8d33ff] transition-colors leading-tight">{item.subject?.name || "Untitled"}</h4>
                      
                      <div className="space-y-4 mb-8 flex-1">
                          <div>
                              <div className="flex justify-between text-xs mb-2">
                                  <span className="font-bold text-gray-500 uppercase tracking-tighter">Concept Mastery:</span>
                                  <span className={`font-extrabold ${isNotStarted ? "text-gray-400" : "text-[#8d33ff]"}`}>
                                      {isNotStarted ? "Not Started" : `${pct}%`}
                                  </span>
                              </div>
                              <Progress value={pct} className="h-2 bg-white/50" />
                          </div>
                          <div className="flex justify-between text-xs pb-2 border-b border-purple-200/50">
                              <span className="font-bold text-gray-500 uppercase tracking-tighter">Chapters:</span>
                              <span className="font-bold text-gray-900">{item.completed_chapters || 0} / {item.total_chapters || 0}</span>
                          </div>
                      </div>

                      <Button 
                        className="w-full h-12 bg-white text-[#8d33ff] font-bold hover:bg-[#8d33ff] hover:text-white transition-all rounded-xl gap-2 mt-auto text-sm shadow-sm"
                      >
                        <Play className="w-4 h-4 fill-current" /> Start Learning Session
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
};

export default Dashboard;
