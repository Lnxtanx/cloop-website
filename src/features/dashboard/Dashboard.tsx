import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, Loader2 } from "lucide-react";
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
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
      <div className="space-y-6 animate-fade-in">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold">
            Hi {profile?.name || "Learner"}
            {profile?.grade_level ? `, Class ${profile.grade_level}` : ""}
            {profile?.board ? ` | ${profile.board}` : ""}
          </h2>
          <p className="text-muted-foreground mt-1">Let's get started!</p>
        </div>

        {/* Enrolled Subjects */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Enrolled Subjects</h3>
            <span className="text-sm text-muted-foreground">({subjects.length})</span>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No subjects enrolled yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map((item: UserSubject) => {
                const safeSubjectId = String(item.subject_id).split(":")[0];
                return (
                  <Card
                    key={item.subject_id}
                    className="border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50"
                    onClick={() =>
                      navigate(
                        `/chapters?subjectId=${encodeURIComponent(safeSubjectId)}&subjectName=${encodeURIComponent(item.subject?.name || "Untitled")}`
                      )
                    }
                  >
                    <CardContent className="p-5">
                      <span className="text-xs font-semibold text-purple-800 bg-purple-200 rounded-full px-2.5 py-0.5">
                        {item.subject?.category || "General"}
                      </span>
                      <h4 className="font-semibold mt-3 mb-1">{item.subject?.name || "Untitled"}</h4>
                      <p className="text-xs text-gray-600 mb-3">
                        {item.completed_chapters || 0} / {item.total_chapters || 0} chapters
                      </p>
                      <Progress value={item.completion_percent || 0} className="h-1.5" />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-600">
                          {Math.round(item.completion_percent || 0)}% complete
                        </span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 p-1">
                          <Play className="w-3 h-3" /> Start
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
