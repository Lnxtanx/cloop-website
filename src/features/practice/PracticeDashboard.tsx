import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  Clock,
  Zap,
  ArrowRight,
  Play,
  Calendar,
  CheckCircle,
  ChevronRight,
  Activity,
  Loader2
} from "lucide-react";
import {
  fetchPracticeHistory,
  fetchStandardExams,
  PracticeTest as PracticeTestType,
  StandardExam,
} from "@/lib/api/practice";
import { toast } from "sonner";

const PracticeDashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PracticeTestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [coverage, setCoverage] = useState({ percentage: 0, covered: 0, total: 0 });
  const [stats, setStats] = useState({
    totalTests: 0,
    totalTime: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("cloop_token");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

    try {
      const [historyData, examsData, profileRes, analyticsRes] = await Promise.all([
        fetchPracticeHistory(),
        fetchStandardExams(),
        fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/practice-analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const profileData = await profileRes.json();
      const analyticsData = await analyticsRes.json();
      
      setProfile(profileData);
      setHistory(historyData);
      
      // Use rich exam data from analytics if available
      if (analyticsData.exams) {
        setExams(analyticsData.exams);
      } else {
        setExams(examsData);
      }

      if (analyticsData.coverage) {
        setCoverage(analyticsData.coverage);
      }

      const totalTests = historyData.length;
      const totalTime = historyData.reduce((acc, t) => acc + (t.time_taken_sec || 0), 0);

      setStats({ totalTests, totalTime });
    } catch (error) {
      toast.error("Failed to load practice data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  };

  const recentTests = history.slice(0, 4);

  if (loading) {
    return (
      <DashboardLayout title="Practice Home">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Practice Home">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        
        {/* 1. Personalized Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Hi {profile?.name || "Learner"},
            </h2>
            <p className="text-gray-500 mt-1 font-medium">Ready to master your competitive exams?</p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/test-your-self")}
            className="bg-purple-600 hover:bg-purple-700 font-bold px-8 h-12 rounded-2xl gap-2 shadow-lg shadow-purple-100"
          >
            <Play className="w-4 h-4 fill-current" /> Start Practice
          </Button>
        </div>

        {/* 2. Performance Overview Row - NOW 100% REAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none bg-purple-600 text-white shadow-xl shadow-purple-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200 mb-4">Activity Overview</p>
              <div className="flex items-end gap-10">
                <div>
                  <p className="text-4xl font-black">{stats.totalTests}</p>
                  <p className="text-[10px] font-bold text-purple-200 uppercase mt-1">Sessions Completed</p>
                </div>
                <div>
                  <p className="text-4xl font-black">{formatTime(stats.totalTime)}</p>
                  <p className="text-[10px] font-bold text-purple-200 uppercase mt-1">Practice Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 bg-white shadow-sm">
             <CardContent className="p-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Exam Prep Roadmap</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Syllabus Covered</span>
                      <span className="text-xs font-bold text-purple-600">{coverage.percentage}%</span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all duration-1000" style={{ width: `${coverage.percentage}%` }} />
                   </div>
                   <p className="text-[10px] text-gray-400 leading-relaxed">
                      You have covered {coverage.covered} out of {coverage.total} core chapters in your standard syllabus.
                   </p>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Exam Target
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam) => (
                  <Card
                    key={exam.id || exam.exam_type}
                    className="border-purple-100 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer bg-gradient-to-br from-white to-purple-50/50 group"
                    onClick={() => navigate(`/dashboard/statistics?exam=${exam.exam_type || exam.code}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/80 rounded-md px-2 py-0.5">
                          Target Exam
                        </span>
                        <Target className="w-4 h-4 text-purple-300 group-hover:text-purple-500 transition-colors" />
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors text-sm truncate">
                          {exam.name}
                        </h4>
                        <div className="mt-1.5 flex items-center justify-between">
                           <p className="text-xs font-bold text-purple-600">
                             Predicted Score: {exam.predicted_score || 0}%
                           </p>
                           <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Recent Tests
                </h3>
              </div>
              <div className="space-y-3">
                {recentTests.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No tests taken yet.</p>
                ) : (
                  recentTests.map((test) => (
                    <div 
                      key={test.id}
                      onClick={() => navigate(`/dashboard/test-your-self?reportId=${test.id}`)}
                      className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-[10px] group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {test.exam_type[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{test.exam_type}: {test.subject}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{formatDate(test.created_at)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-purple-400" />
                    </div>
                  ))
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full rounded-xl text-xs font-bold text-gray-500 border-gray-100 hover:bg-gray-50"
                onClick={() => navigate("/dashboard/test-your-self?tab=history")}
              >
                View Full History
              </Button>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PracticeDashboard;
