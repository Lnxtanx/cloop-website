import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CardContent } from "@/components/ui/card";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, HelpCircle,
  TrendingUp, Clock, AlertCircle, ArrowRight, ChevronRight, Loader2, Zap, Target, Brain, Sparkles, BookOpen, BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const API = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

const token = () => localStorage.getItem("cloop_token") ?? "";
const get = (path: string) =>
  fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) =>
    r.ok ? r.json() : Promise.reject(r)
  );

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (s: number) => {
  if (!s) return "00:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const scoreColor = (n: number) =>
  n >= 80 ? "#8d33ff" : n >= 60 ? "#a855f7" : "#c084fc";

// ─── tiny components ──────────────────────────────────────────────────────────

function SectionTitle({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#8d33ff]" />
        </div>
      )}
      <h3 className="text-xl lg:text-2xl font-extrabold text-gray-900">{title}</h3>
    </div>
  );
}

function CardContainer({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`bg-white rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Practice Analytics View (PAGE 1) ────────────────────────────────────────

function PracticeAnalyticsView({ onSelectExam }: { onSelectExam: (code: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/practice-analytics/overview")
      .then(setData)
      .catch(() => setData({ has_data: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8d33ff]" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
          Learning Intelligence Dashboard
        </h2>
        <div className="bg-purple-50 rounded-3xl p-6 lg:p-8 mt-6 border border-purple-100 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">Welcome to your Concept Mastery Dashboard</p>
                <p className="text-gray-600 font-medium mt-3 text-lg leading-relaxed max-w-2xl">
                    Track how you learn, where you make mistakes, and how your predicted score improves over time
                </p>
            </div>
            <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 text-purple-200/50 -rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardContainer className="bg-gradient-to-br from-[#8d33ff] to-violet-700 p-8 text-white border-0 shadow-xl shadow-purple-200">
           <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Predicted Rank</p>
           <h3 className="text-4xl font-black mb-2">#12,450</h3>
           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/10">
             <Target className="w-3 h-3" /> Confidence: 85%
           </div>
        </CardContainer>

        <CardContainer className="flex items-center gap-6 p-8">
           <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#8d33ff" strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * 45) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#8d33ff]">45%</span>
           </div>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Syllabus Coverage</p>
              <p className="text-xl font-black text-gray-800">12/28 Chapters</p>
           </div>
        </CardContainer>
      </div>

      <div className="space-y-6">
        <SectionTitle title="Exams-wise Analysis" icon={TrendingUp} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.exams?.map((exam: any) => (
            <CardContainer key={exam.exam_type}
              className="border-purple-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50 group"
              onClick={() => onSelectExam(exam.exam_type)}>
              <CardContent className="p-5">
                <div className="mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-200/50 rounded-full px-2.5 py-0.5">
                    Competitive Exam
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-900 group-hover:text-[#8d33ff] transition-colors text-sm truncate">
                  {exam.name || exam.exam_type}
                </h4>
                
                <p className="text-xs font-extrabold text-[#8d33ff] mt-2">
                    Predicted Score: {exam.predicted_score || 0}%
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200/30">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">View Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8d33ff] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </CardContainer>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Exam Deep Dive View (PAGE 2) ───────────────────────────────────────────

function ExamDeepDiveView({ examCode, onBack }: { examCode: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get(`/api/practice-analytics/exam/${examCode}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [examCode]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8d33ff]" /></div>;
  if (!data) return <div className="text-center py-20 bg-purple-50 rounded-3xl border border-purple-100"><p className="font-bold text-gray-600 mb-6">No data available for this exam.</p><Button onClick={onBack} className="bg-[#8d33ff]">Go Back</Button></div>;

  const currentScore = Math.round(data?.summary?.average_score || 0);
  const bestPossible = Math.min(100, currentScore + 15);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#8d33ff] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Intelligence
        </button>
        <div className="flex items-center gap-3 bg-[#8d33ff]/10 px-5 py-2.5 rounded-2xl border border-[#8d33ff]/20">
          <div className="w-8 h-8 rounded-xl bg-[#8d33ff] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-200">{examCode?.[0]}</div>
          <span className="font-bold text-gray-900">{examCode} Detailed Analysis</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Predicted Score */}
        <div className="space-y-4">
            <SectionTitle title="Predicted Score" icon={Target} />
            <CardContainer className="p-8">
                <div className="h-10 w-full bg-gray-100 rounded-2xl overflow-hidden flex relative shadow-inner">
                    <div style={{ width: `${currentScore}%` }} className="bg-red-400 h-full flex items-center justify-end px-4 transition-all duration-1000">
                        <span className="text-xs font-black text-white">{currentScore}</span>
                    </div>
                    <div style={{ width: `${bestPossible - currentScore}%` }} className="bg-green-300 h-full flex items-center justify-end px-4 opacity-80 transition-all duration-1000">
                        <span className="text-xs font-black text-gray-800">{bestPossible}</span>
                    </div>
                </div>
                <div className="flex justify-between mt-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Level</span>
                        <span className="text-xl font-black text-gray-900">{currentScore}%</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Best Possible</span>
                        <span className="text-xl font-black text-green-600">{bestPossible}%</span>
                    </div>
                </div>
            </CardContainer>
        </div>

        {/* Preparation Time */}
        <div className="space-y-4">
            <SectionTitle title="Preparation Time" icon={Clock} />
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Daily", val: fmtTime(data?.time_analytics?.daily_seconds || 0) },
                    { label: "Weekly", val: fmtTime(data?.time_analytics?.weekly_seconds || 0) },
                    { label: "Monthly", val: fmtTime(data?.time_analytics?.total_seconds || 0) },
                ].map(t => (
                    <CardContainer key={t.label} className="p-6 text-center group hover:border-[#8d33ff] transition-all">
                        <p className="text-2xl font-black text-[#8d33ff] group-hover:scale-110 transition-transform">{t.val}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{t.label} Prep</p>
                        <p className="text-[9px] font-bold text-gray-300 mt-0.5">Focused Time</p>
                    </CardContainer>
                ))}
            </div>
        </div>

        {/* Monthly Session Summary */}
        <div className="space-y-4">
            <SectionTitle title="Monthly Session Summary" icon={BarChart3} />
            <div className="grid grid-cols-3 gap-4">
                <CardContainer className="p-6 text-center">
                    <HelpCircle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">{data?.summary?.total_questions || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Questions</p>
                </CardContainer>
                <CardContainer className="p-6 text-center border-green-100 bg-green-50/20">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-green-600">{data?.summary?.correct_answers || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Correct</p>
                </CardContainer>
                <CardContainer className="p-6 text-center border-purple-100 bg-purple-50/20">
                    <TrendingUp className="w-5 h-5 text-[#8d33ff] mx-auto mb-2" />
                    <p className="text-2xl font-black text-[#8d33ff]">+5%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Improved</p>
                </CardContainer>
            </div>
        </div>

        {/* Concept Mastery Breakdown */}
        <div className="space-y-4">
            <SectionTitle title="Concepts Mastered" icon={Brain} />
            <div className="space-y-3">
                {[
                    { label: "Understood Well", desc: "Ready for advanced questions", count: data?.concepts_mastery?.mastered || 0, color: "bg-green-500", icon: CheckCircle2, iconBg: "bg-green-100", iconColor: "text-green-600" },
                    { label: "Still Learning", desc: "Keep practicing these", count: data?.concepts_mastery?.learning || 0, color: "bg-[#8d33ff]", icon: Clock, iconBg: "bg-purple-100", iconColor: "text-[#8d33ff]" },
                    { label: "Not Started", desc: "New topics ahead", count: data?.concepts_mastery?.not_started || 0, color: "bg-gray-400", icon: Zap, iconBg: "bg-gray-100", iconColor: "text-gray-500" },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-[10px] font-medium text-gray-400">{item.desc}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg ${item.color} text-white font-black text-xs`}>
                            {item.count}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Error Profile */}
        <div className="space-y-4">
            <SectionTitle title="Profile of Your Errors" icon={AlertCircle} />
            <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Concept Errors", key: 'Conceptual', color: "#8d33ff", desc: "Gap in understanding" },
                  { label: "Step Mistakes", key: 'Application', color: "#a855f7", desc: "Process errors" },
                  { label: "Calculation", key: 'Calculation', color: "#D946EF", desc: "Silly mistakes" },
                ].map(errItem => {
                    const count = data?.error_analysis?.error_types?.[errItem.key] || 0;
                    const totalErrors = data?.summary?.incorrect_answers || 1;
                    const pct = Math.min(100, (count / totalErrors) * 100);
                    return (
                        <CardContainer key={errItem.label} className="p-5 flex flex-col items-center text-center">
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{errItem.label}</p>
                            <p className="text-xl font-black mb-3" style={{ color: errItem.color }}>{count} mistakes</p>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div style={{ width: `${pct}%`, backgroundColor: errItem.color }} className="h-full transition-all duration-1000" />
                            </div>
                        </CardContainer>
                    );
                })}
            </div>
        </div>

        {/* Recommended Focus */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
            <SectionTitle title="Recommended Focus" icon={TrendingUp} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.chapter_mastery?.slice(0, 2).map((item: any, i: number) => (
                    <CardContainer key={i} className={`p-8 ${i === 0 ? "bg-[#8d33ff] text-white border-0 shadow-xl shadow-purple-200" : "bg-purple-100/50 border-purple-200"}`}>
                        <h4 className={`text-2xl font-black mb-2 ${i === 0 ? "text-white" : "text-[#8d33ff]"}`}>{item.title}</h4>
                        <p className={`text-sm font-medium mb-8 ${i === 0 ? "text-purple-100" : "text-purple-700 opacity-80"}`}>Fixing this topic can improve your marks fastest.</p>
                        
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 flex items-center justify-between border border-white/20">
                            <span className={`text-sm font-bold ${i === 0 ? "text-white" : "text-[#8d33ff]"}`}>Potential Gain</span>
                            <span className={`text-xl font-black ${i === 0 ? "text-white" : "text-[#8d33ff]"}`}>+15 Marks</span>
                        </div>

                        <Button className={`w-full h-14 rounded-2xl text-lg font-black shadow-lg ${i === 0 ? "bg-white text-[#8d33ff] hover:bg-purple-50" : "bg-[#8d33ff] text-white hover:bg-violet-700"}`}>
                            Practice Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </CardContainer>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard View (NORMAL MODE) ───────────────────────────────────

function DashboardView({ onSelectSubject }: { onSelectSubject: (id: number, name: string) => void }) {
  const [reports, setReports] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      get("/api/topic-chats/reports/recent"),
      get("/api/profile/learning-analytics/overview"),
      get("/api/profile"),
    ]).then(([r1, r2, r3]) => {
      if (r1.status === "fulfilled") setReports(r1.value ?? []);
      if (r2.status === "fulfilled") setOverview(r2.value);
      if (r3.status === "fulfilled") {
        const p = r3.value;
        const subs =
          p?.user_subjects?.map((us: any) => us.subject).filter(Boolean) ??
          p?.subjects?.map((s: any, i: number) => ({ id: i, name: s })) ?? [];
        setSubjects(subs);
      }
    }).finally(() => setLoading(false));
  }, []);

  const subjectScore = (id: number) => {
    if (!overview?.by_subject) return 15;
    const s = overview.by_subject.find((s: any) => s.subject_id === id);
    return s ? Math.min(100, Math.round((s.average_score || 0) + 15)) : 15;
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8d33ff]" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
          Learning Intelligence Dashboard
        </h2>
        <div className="bg-purple-50 rounded-3xl p-6 lg:p-8 mt-6 border border-purple-100 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">Welcome to your Concept Mastery Dashboard</p>
                <p className="text-gray-600 font-medium mt-3 text-lg leading-relaxed max-w-2xl">
                    Track how you learn, where you make mistakes, and how your predicted score improves over time
                </p>
            </div>
            <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 text-purple-200/50 -rotate-12" />
        </div>
      </div>

      <div className="space-y-6">
        <SectionTitle title="Quick Overview (Recent Sessions)" icon={Clock} />
        {reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                <p className="text-base font-bold text-gray-500">No recent sessions found</p>
                <p className="text-xs text-gray-400 mt-1">Complete a topic to see your performance metrics</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
            {reports.map((r: any) => (
                <div key={r.id} onClick={() => r.topics?.subjects?.id && onSelectSubject(r.topics.subjects.id, r.topics.subjects.name)}
                    className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#8d33ff] hover:shadow-xl hover:shadow-purple-50 transition-all cursor-pointer flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-7 h-7 text-[#8d33ff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-extrabold text-gray-900 truncate group-hover:text-[#8d33ff] transition-colors">{r.topics?.title ?? "Unknown Topic"}</h4>
                        <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{r.topics?.chapters?.title ?? "No Chapter"}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 px-6">
                        <div className="text-center">
                            <p className="text-sm font-black text-green-600">{r.correct_answers}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Correct</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-red-500">{r.incorrect_answers}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Wrong</p>
                        </div>
                    </div>
                    <div className="text-center bg-purple-50 px-4 py-2 rounded-xl min-w-[70px]">
                        <p className="text-lg font-black text-[#8d33ff]">{r.score_percent}%</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#8d33ff] ml-2" />
                </div>
            ))}
            </div>
        )}
      </div>

      <div className="space-y-6 pt-6">
        <SectionTitle title="Subjects-wise Analysis" icon={BookOpen} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((s: any) => {
            const score = subjectScore(s.id);
            return (
                <CardContainer key={s.id} className="border-purple-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50 group" onClick={() => onSelectSubject(s.id, s.name)}>
                    <CardContent className="p-5">
                        <h4 className="font-bold text-gray-900 group-hover:text-[#8d33ff] transition-colors text-sm truncate">{s.name}</h4>
                        <p className="text-xs font-extrabold text-[#8d33ff] mt-2">Predicted Score: {score}%</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200/30">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Click to Analyze</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#8d33ff] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </CardContent>
                </CardContainer>
            );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Normal Subject View (NORMAL MODE DETAIL) ──────────────────────────────

function NormalSubjectView({ subjectId, subjectName, onBack }: { subjectId: number; subjectName: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      get(`/api/profile/learning-analytics/subject/${subjectId}`),
      get(`/api/topic-chats/reports/subject/${subjectId}`),
    ]).then(([r1, r2]) => {
      if (r1.status === "fulfilled") setData(r1.value);
    }).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8d33ff]" /></div>;
  if (!data) return <div className="text-center py-20 bg-purple-50 rounded-3xl border border-purple-100"><p className="font-bold text-gray-600 mb-6">No data available for this subject.</p><Button onClick={onBack} className="bg-[#8d33ff]">Go Back</Button></div>;

  const currentScore = Math.round(data?.summary?.average_score || 0);
  const bestPossible = Math.min(100, currentScore + 15);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
        {/* Header & Back */}
        <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#8d33ff] transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Intelligence
            </button>
            <div className="flex items-center gap-3 bg-[#8d33ff]/10 px-5 py-2.5 rounded-2xl border border-[#8d33ff]/20">
                <div className="w-8 h-8 rounded-xl bg-[#8d33ff] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-200">{subjectName[0]}</div>
                <span className="font-bold text-gray-900">{subjectName} Mastery Analysis</span>
            </div>
        </div>

        <div className="space-y-8">
            {/* Predicted Score */}
            <div className="space-y-4">
                <SectionTitle title="Predicted Score" icon={Target} />
                <CardContainer className="p-8">
                    <div className="h-10 w-full bg-gray-100 rounded-2xl overflow-hidden flex relative shadow-inner">
                        <div style={{ width: `${currentScore}%` }} className="bg-red-400 h-full flex items-center justify-end px-4 transition-all duration-1000">
                            <span className="text-xs font-black text-white">{currentScore}</span>
                        </div>
                        <div style={{ width: `${bestPossible - currentScore}%` }} className="bg-green-300 h-full flex items-center justify-end px-4 opacity-80 transition-all duration-1000">
                            <span className="text-xs font-black text-gray-800">{bestPossible}</span>
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Level</span>
                            <span className="text-xl font-black text-gray-900">{currentScore}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Best Possible</span>
                            <span className="text-xl font-black text-green-600">{bestPossible}%</span>
                        </div>
                    </div>
                </CardContainer>
            </div>

            {/* Total Learning Time */}
            <div className="space-y-4">
                <SectionTitle title="Total Learning Time" icon={Clock} />
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Daily", val: fmtTime(data?.time_analytics?.daily_seconds || 0) },
                        { label: "Weekly", val: fmtTime(data?.time_analytics?.weekly_seconds || 0) },
                        { label: "Monthly", val: fmtTime(data?.time_analytics?.monthly_seconds || 0) },
                    ].map(t => (
                        <CardContainer key={t.label} className="p-6 text-center group hover:border-[#8d33ff] transition-all">
                            <p className="text-2xl font-black text-[#8d33ff] group-hover:scale-110 transition-transform">{t.val}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{t.label}</p>
                            <p className="text-[9px] font-bold text-gray-300 mt-0.5">Focused Time</p>
                        </CardContainer>
                    ))}
                </div>
            </div>

            {/* Monthly Session Summary */}
            <div className="space-y-4">
                <SectionTitle title="Monthly Session Summary" icon={BarChart3} />
                <div className="grid grid-cols-3 gap-4">
                    <CardContainer className="p-6 text-center">
                        <HelpCircle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-2xl font-black text-gray-900">{data?.summary?.total_questions || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Questions</p>
                    </CardContainer>
                    <CardContainer className="p-6 text-center border-green-100 bg-green-50/20">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-black text-green-600">{data?.summary?.correct_answers || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Correct</p>
                    </CardContainer>
                    <CardContainer className="p-6 text-center border-purple-100 bg-purple-50/20">
                        <TrendingUp className="w-5 h-5 text-[#8d33ff] mx-auto mb-2" />
                        <p className="text-2xl font-black text-[#8d33ff]">+5%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Improved</p>
                    </CardContainer>
                </div>
            </div>

            {/* Concepts Mastered */}
            <div className="space-y-4">
                <SectionTitle title="Concepts Mastered" icon={Brain} />
                <div className="space-y-3">
                    {[
                        { label: "Understood Well", desc: "Ready for advanced questions", count: data?.concepts_mastery?.mastered || 0, color: "bg-green-500", icon: CheckCircle2, iconBg: "bg-green-100", iconColor: "text-green-600" },
                        { label: "Still Learning", desc: "Keep practicing these", count: data?.concepts_mastery?.learning || 0, color: "bg-[#8d33ff]", icon: Clock, iconBg: "bg-purple-100", iconColor: "text-[#8d33ff]" },
                        { label: "Not Started", desc: "New topics ahead", count: data?.concepts_mastery?.not_started || 0, color: "bg-gray-400", icon: Zap, iconBg: "bg-gray-100", iconColor: "text-gray-500" },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm group hover:border-[#8d33ff] transition-all">
                            <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                <p className="text-[10px] font-medium text-gray-400">{item.desc}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg ${item.color} text-white font-black text-xs`}>
                                {item.count}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profile of Your Errors */}
            <div className="space-y-4">
                <SectionTitle title="Profile of Your Errors" icon={AlertCircle} />
                <div className="grid grid-cols-3 gap-4">
                    {[
                    { label: "Concept Errors", key: 'Conceptual', color: "#8d33ff", desc: "Gap in understanding" },
                    { label: "Step Mistakes", key: 'Application', color: "#a855f7", desc: "Process errors" },
                    { label: "Calculation", key: 'Calculation', color: "#D946EF", desc: "Silly mistakes" },
                    ].map(errItem => {
                        const count = data?.error_analysis?.error_types?.[errItem.key] || 0;
                        const totalErrors = data?.summary?.incorrect_answers || 1;
                        const pct = Math.min(100, (count / totalErrors) * 100);
                        return (
                            <CardContainer key={errItem.label} className="p-5 flex flex-col items-center text-center">
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{errItem.label}</p>
                                <p className="text-xl font-black mb-3" style={{ color: errItem.color }}>{count} mistakes</p>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${pct}%`, backgroundColor: errItem.color }} className="h-full transition-all duration-1000" />
                                </div>
                            </CardContainer>
                        );
                    })}
                </div>
            </div>

            {/* Recommended Focus */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
                <SectionTitle title="Recommended Focus" icon={TrendingUp} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.recommended_focus?.slice(0, 2).map((item: any, idx: number) => (
                        <CardContainer key={idx} className={`p-8 ${idx === 0 ? "bg-[#8d33ff] text-white border-0 shadow-xl shadow-purple-200" : "bg-purple-100/50 border-purple-200"}`}>
                            <h4 className={`text-2xl font-black mb-2 ${idx === 0 ? "text-white" : "text-[#8d33ff]"}`}>{item.title}</h4>
                            <p className={`text-sm font-medium mb-8 ${idx === 0 ? "text-purple-100" : "text-purple-700 opacity-80"}`}>Fixing this topic can improve your marks fastest.</p>
                            
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 flex items-center justify-between border border-white/20">
                                <span className={`text-sm font-bold ${idx === 0 ? "text-white" : "text-[#8d33ff]"}`}>Potential Gain</span>
                                <span className={`text-xl font-black ${idx === 0 ? "text-white" : "text-[#8d33ff]"}`}>+{item.potential_gain} Marks</span>
                            </div>

                            <Button 
                                onClick={() => navigate(`/topic-chat?topicId=${item.topic_id}`)}
                                className={`w-full h-14 rounded-2xl text-lg font-black shadow-lg ${idx === 0 ? "bg-white text-[#8d33ff] hover:bg-purple-50" : "bg-[#8d33ff] text-white hover:bg-violet-700"}`}
                            >
                                Practice Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </CardContainer>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

// ─── Main Switcher ───────────────────────────────────────────────────────────

export default function Statistics() {
  const { mode } = usePracticeMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState<{ id: number; name: string } | null>(null);
  
  // Use state but initialize from URL if possible
  const [selectedExam, setSelectedExam] = useState<string | null>(searchParams.get("exam"));

  const activeMode = mode === 'PRACTICE' ? 'practice' : 'normal';

  const handleBack = useCallback(() => {
    setSelectedExam(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleSelectExam = useCallback((code: string) => {
    setSelectedExam(code);
    setSearchParams({ exam: code }, { replace: true });
  }, [setSearchParams]);

  // Sync state if URL changes (e.g. browser back)
  useEffect(() => {
    const examInUrl = searchParams.get("exam");
    if (examInUrl !== selectedExam) {
      setSelectedExam(examInUrl);
    }
  }, [searchParams, selectedExam]);

  return (
    <DashboardLayout title="Performance Analytics">
      <div className="animate-fade-in pb-20">
        {activeMode === "normal" ? (
          selectedSubject ? (
            <NormalSubjectView subjectId={selectedSubject.id} subjectName={selectedSubject.name} onBack={() => setSelectedSubject(null)} />
          ) : (
            <DashboardView onSelectSubject={(id, name) => setSelectedSubject({ id, name })} />
          )
        ) : (
          selectedExam ? (
            <ExamDeepDiveView examCode={selectedExam} onBack={handleBack} />
          ) : (
            <PracticeAnalyticsView onSelectExam={handleSelectExam} />
          )
        )}
      </div>
    </DashboardLayout>
  );
}
