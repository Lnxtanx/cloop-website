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
  Loader2,
  Sparkles
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
           <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Practice Home">
      <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-12">
        
        {/* 1. Personalized Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              Hi {profile?.name ? profile.name.split(" ")[0] : "Learner"},
            </h2>
            <p className="text-base lg:text-lg text-black font-bold mt-1.5 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Ready to master your competitive exams?
            </p>
          </div>
            <Button
            onClick={() => navigate("/dashboard/test-your-self")}
            className="bg-black hover:bg-zinc-800 text-white font-black px-10 h-14 rounded-2xl gap-3 shadow-xl shadow-zinc-300 transition-all active:scale-95 text-lg"
          >
            <Play className="w-5 h-5 fill-current" /> Start Practice
          </Button>
        </div>

        {/* 2. Performance Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none bg-gradient-to-br from-black via-zinc-900 to-zinc-950 text-white shadow-2xl shadow-zinc-200 overflow-hidden relative rounded-[32px]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-32 h-32" />
            </div>
            <CardContent className="p-8 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Activity Overview</p>
              <div className="flex items-end gap-12">
                <div>
                  <p className="text-5xl font-black">{stats.totalTests}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2 tracking-widest">Sessions</p>
                </div>
                <div className="h-12 w-px bg-white/20 mb-2" />
                <div>
                  <p className="text-5xl font-black">{formatTime(stats.totalTime)}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2 tracking-widest">Focused Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-xl shadow-zinc-100 rounded-[32px]">
             <CardContent className="p-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Exam Prep Roadmap</p>
                <div className="space-y-5">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">Syllabus Covered</span>
                      <span className="text-lg font-black text-black">{coverage.percentage}%</span>
                   </div>
                       <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                       <div className="h-full bg-gradient-to-r from-black to-zinc-700 rounded-full transition-all duration-1000" style={{ width: `${coverage.percentage}%` }} />
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed font-medium">
                       You have covered <span className="text-black font-bold">{coverage.covered}</span> out of <span className="text-gray-900 font-bold">{coverage.total}</span> core chapters in your standard syllabus.
                   </p>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
                     <Target className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900">Exam Targets</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {exams.map((exam) => (
                  <Card
                    key={exam.id || exam.exam_type}
                    className="rounded-3xl border-zinc-200 hover:shadow-2xl hover:border-black transition-all duration-300 cursor-pointer bg-gradient-to-br from-zinc-100 to-zinc-50 group"
                    onClick={() => navigate(`/dashboard/statistics?exam=${exam.exam_type || exam.code}`)}
                  >
                     <CardContent className="p-7">
                       <div className="flex items-start justify-between mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-200/60 rounded-full px-3 py-1">
                          Competitive
                         </span>
                         <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                             <Target className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                         <h4 className="text-lg font-black text-gray-900 group-hover:text-black transition-colors leading-tight">
                          {exam.name}
                         </h4>
                         <div className="mt-6 p-4 bg-white/60 rounded-2xl border border-white flex items-center justify-between">
                             <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Predicted Score</p>
                                 <p className="text-xl font-black text-black">{exam.predicted_score || 0}%</p>
                            </div>
                             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-lg shadow-zinc-300">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                         </div>
                      </div>
                     </CardContent>
                  </Card>
                ))}
              </div>
           </div>

           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900">Recent Tests</h3>
              </div>

              <div className="space-y-4">
                {recentTests.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-bold italic">No tests taken yet.</p>
                  </div>
                ) : (
                  recentTests.map((test) => (
                    <div 
                      key={test.id}
                      onClick={() => navigate(`/dashboard/test-your-self?reportId=${test.id}`)}
                       className="group cursor-pointer flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-black hover:shadow-lg transition-all"
                    >
                        <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-black font-black text-[11px] group-hover:bg-black group-hover:text-white transition-colors shadow-inner">
                        {test.exam_type[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate group-hover:text-black transition-colors">{test.exam_type}: {test.subject}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{formatDate(test.created_at)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl text-xs font-black text-black border-zinc-200 hover:bg-zinc-100 uppercase tracking-widest shadow-sm"
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
