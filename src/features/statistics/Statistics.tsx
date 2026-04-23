import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CardContent } from "@/components/ui/card";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, HelpCircle,
  TrendingUp, Clock, RefreshCw, CheckCheck, AlertCircle, ArrowRight, ChevronRight, Loader2, Zap, Target
} from "lucide-react";

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
  n >= 80 ? "#9333EA" : n >= 60 ? "#A855F7" : "#C084FC";

const scoreBg = (n: number) =>
  n >= 70 ? "#F3E8FF" : "#FAF5FF";

// ─── tiny components ──────────────────────────────────────────────────────────

function Section({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: subtitle ? 4 : 12 }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#1F2937", margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 12px" }}>{subtitle}</p>}
    </div>
  );
}

function CardContainer({ children, style, className, onClick }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  return (
    <div
      className={className}
      style={{
        background: "#fff", borderRadius: 14, padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style,
      }}
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

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Loader2 className="animate-spin" style={{ color: "#9333EA" }} /></div>;

  if (!data?.has_data) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ background: "#F3E8FF", padding: "12px 16px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#1F2937", margin: 0 }}>Hi there! Welcome to Practice Analytics</p>
          </div>
          <div style={{ background: "#FAF5FF", padding: "16px" }}>
            <p style={{ fontSize: 12, color: "#4B5563", margin: 0 }}>Complete your first mock test to unlock deep insights into your competitive exam readiness.</p>
          </div>
        </div>
        <Section title="Quick Overview (Recent Tests)" />
        <CardContainer style={{ textAlign: "center", border: "1.5px dashed #E5E7EB", padding: 40 }}>
           <Zap style={{ width: 32, height: 32, color: "#E5E7EB", margin: "0 auto 12px" }} />
           <p style={{ fontSize: 13, color: "#6B7280" }}>No recent sessions found.</p>
        </CardContainer>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* 1. Pro Insight Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CardContainer style={{ background: "linear-gradient(135deg, #9333EA 0%, #6D28D9 100%)", color: "#fff", border: "none", padding: "20px 24px" }}>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1">Predicted All India Rank</p>
           <h3 className="text-3xl font-black mb-1">#12,450</h3>
           <p className="text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wider">Confidence: 85%</p>
        </CardContainer>

        <CardContainer style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
           <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" fill="transparent" stroke="#F3F4F6" strokeWidth="6" />
                <circle cx="28" cy="28" r="24" fill="transparent" stroke="#9333EA" strokeWidth="6" strokeDasharray="150" strokeDashoffset={150 - (150 * 45) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">45%</span>
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Syllabus Coverage</p>
              <p className="text-base font-black text-gray-800">12/28 Chapters</p>
           </div>
        </CardContainer>
      </div>

      <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ background: "#F3E8FF", padding: "12px 16px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#1F2937", margin: 0 }}>Ready for your Competitive Exams?</p>
        </div>
        <div style={{ background: "#FAF5FF", padding: "12px 16px 16px" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", margin: "0 0 8px" }}>Here you can -</p>
          {[
            "Track performance across NEET, JEE, and KCET mock tests",
            "See which subjects and chapters need more practice",
            "Monitor predicted exam scores and potential rank improvement",
            "Identify common calculation or conceptual errors",
          ].map((t, i) => (
            <p key={i} style={{ fontSize: 12, color: "#4B5563", margin: "0 0 3px", lineHeight: 1.5 }}>{i + 1}. {t}</p>
          ))}
        </div>
      </div>

      <Section title="Quick Overview (Recent Tests)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {data.recent_tests?.map((r: any) => (
          <CardContainer 
            key={r.id} 
            style={{ cursor: "pointer", border: "1px solid transparent" }}
            className="hover:border-purple-200 hover:shadow-md transition-all group"
            onClick={() => navigate(`/dashboard/test-your-self?reportId=${r.id}`)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1F2937", margin: "0 0 2px" }} className="group-hover:text-purple-600 transition-colors">{r.title}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{new Date(r.created_at).toLocaleDateString()} • Click to view report</p>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 13, background: scoreBg(r.score_percent), color: scoreColor(r.score_percent) }}>{r.score_percent}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}><CheckCircle2 style={{ width: 14, height: 14, color: "#9333EA" }} />{r.correct_answers} Correct</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}><XCircle style={{ width: 14, height: 14, color: "#DC2626" }} />{r.incorrect_answers} Incorrect</span>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: "#E5E7EB" }} className="group-hover:text-purple-400 transition-colors" />
            </div>
          </CardContainer>
        ))}
      </div>

      <Section title="Exams-wise Analysis" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.exams?.map((exam: any) => (
          <CardContainer key={exam.exam_type} className="border-purple-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50" onClick={() => onSelectExam(exam.exam_type)}>
            <CardContent className="p-5">
              <h4 className="font-semibold mt-1 mb-2">{exam.name || exam.exam_type}</h4>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9333EA", margin: "0 0 8px" }}>Predicted Score: {exam.predicted_score}%</p>
              <div className="flex items-center justify-between mt-2"><span className="text-xs text-gray-600">Click to analyze</span><ChevronRight style={{ width: 16, height: 16, color: "#9333EA" }} /></div>
            </CardContent>
          </CardContainer>
        ))}
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

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Loader2 className="animate-spin" style={{ color: "#9333EA" }} /></div>;

  const currentScore = data?.summary?.average_score || 0;
  const bestPossible = Math.min(100, currentScore + 15);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 }}><ArrowLeft style={{ width: 14, height: 14 }} /> Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F3E8FF", padding: "8px 16px", borderRadius: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff" }}>{examCode?.[0]}</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#9D174D" }}>{examCode} Deep Analysis</span>
        </div>
      </div>

      <Section title="Predicted Exam Readiness" />
      <CardContainer style={{ marginBottom: 24 }}>
        <div style={{ height: 32, background: "#F3F4F6", borderRadius: 16, position: "relative", overflow: "hidden", marginBottom: 8 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${currentScore}%`, background: "#FF8787", borderRadius: "16px 0 0 16px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{currentScore}%</span></div>
          <div style={{ position: "absolute", top: 0, height: "100%", left: `${currentScore}%`, width: `${bestPossible - currentScore}%`, background: "#CCFF90", borderRadius: "0 16px 16px 0", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}><span style={{ color: "#1F2937", fontSize: 12, fontWeight: 800 }}>{bestPossible}%</span></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Current Preparedness</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Potential Readiness</span>
        </div>
      </CardContainer>

      <Section title="Subjects Performance" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {data?.subjects?.map((sub: any) => (
          <CardContainer key={sub.name}>
             <h5 style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>{sub.name}</h5>
             <p style={{ fontSize: 16, fontWeight: 900, color: scoreColor(sub.score_percent), margin: 0 }}>{sub.score_percent}%</p>
             <p style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>Avg Accuracy</p>
          </CardContainer>
        ))}
      </div>

      <Section title="Practice Time Breakdown" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Daily", val: fmtTime(data?.time_analytics?.daily_seconds || 0) },
          { label: "Weekly", val: fmtTime(data?.time_analytics?.weekly_seconds || 0) },
          { label: "Total", val: fmtTime(data?.time_analytics?.total_seconds || 0) },
        ].map(t => (
          <CardContainer key={t.label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#8B5CF6", margin: "0 0 4px" }}>{t.val}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{t.label}</p>
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>Practice Time</p>
          </CardContainer>
        ))}
      </div>

      <Section title="Performance Overview" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <HelpCircle style={{ width: 20, height: 20, color: "#6B7280" }} />, val: data?.summary?.total_questions || 0, label: "Questions", color: "#8B5CF6" },
          { icon: <CheckCircle2 style={{ width: 20, height: 20, color: "#8B5CF6" }} />, val: data?.summary?.correct_answers || 0, label: "Correct", color: "#8B5CF6" },
          { icon: <TrendingUp style={{ width: 20, height: 20, color: "#8B5CF6" }} />, val: "+15%", label: "Improved", color: "#8B5CF6" },
        ].map(({ icon, val, label, color }) => (
          <CardContainer key={label} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{icon}</div>
            <p style={{ fontSize: 24, fontWeight: 700, color, margin: "0 0 2px" }}>{val}</p>
            <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{label}</p>
          </CardContainer>
        ))}
      </div>

      <Section title="Common Error Profile" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Conceptual", val: data?.error_analysis?.error_types?.Conceptual || 0, color: "#9333EA" },
          { label: "Application", val: data?.error_analysis?.error_types?.Application || 0, color: "#A855F7" },
          { label: "Calculation", val: data?.error_analysis?.error_types?.Calculation || 0, color: "#D946EF" },
        ].map(err => (
          <CardContainer key={err.label} style={{ padding: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1F2937", margin: "0 0 3px" }}>{err.label}</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 8px" }}>{err.val} mistakes</p>
            <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${Math.min(100, (err.val || 0) * 10)}%`, background: err.color, borderRadius: 3 }} />
            </div>
          </CardContainer>
        ))}
      </div>

      <Section title="Priority Focus Areas" subtitle="AI suggests mastering these chapters to improve scores fastest" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data?.chapter_mastery?.slice(0, 3).map((item: any, i: number) => (
          <div key={i} style={{ background: i === 0 ? "#EDE9FE" : "#DDD6FE", borderRadius: 16, padding: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#4C1D95", margin: "0 0 4px" }}>{item.title}</p>
            <p style={{ fontSize: 12, color: "#5B21B6", margin: "0 0 12px" }}>Accuracy: {item.score_percent}% • High potential for marks improvement.</p>
            <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8B5CF6" }}>Potential Gain</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6" }}>+{15 - Math.round((item.score_percent || 0)/10)} Marks</span>
              </div>
            <button style={{ width: "100%", background: "#8B5CF6", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Practice Now <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        ))}
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

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Loader2 className="animate-spin" style={{ color: "#9333EA" }} /></div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ background: "#F3E8FF", padding: "12px 16px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#1F2937", margin: 0 }}>Hi there! Welcome to your mastery dashboard</p>
        </div>
        <div style={{ background: "#FAF5FF", padding: "12px 16px 16px" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", margin: "0 0 8px" }}>Here you can -</p>
          {["Track how much you study and how effectively you learn", "See which concepts you've mastered and which need focus", "Follow suggested focus areas to improve scores faster", "Monitor progress and score improvement over time"].map((t, i) => (
            <p key={i} style={{ fontSize: 12, color: "#4B5563", margin: "0 0 3px", lineHeight: 1.5 }}>{i + 1}. {t}</p>
          ))}
        </div>
      </div>
      <Section title="Quick Overview (Recent Sessions)" />
      {reports.length === 0 ? (
        <div style={{ background: "#fff", border: "1.5px dashed #E5E7EB", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No recent sessions found.</p>
          <p style={{ fontSize: 12, color: "#6B7280" }}>Complete a topic to see your performance metrics here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {reports.map((r: any) => (
            <CardContainer key={r.id} style={{ cursor: "pointer" }} onClick={() => r.topics?.subjects?.id && onSelectSubject(r.topics.subjects.id, r.topics.subjects.name)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#1F2937", margin: "0 0 2px" }}>{r.topics?.title ?? "Unknown Topic"}</p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{r.topics?.chapters?.title ?? ""}</p>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 13, background: scoreBg(r.score_percent), color: scoreColor(r.score_percent) }}>{r.score_percent}%</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}><CheckCircle2 style={{ width: 14, height: 14, color: "#9333EA" }} />{r.correct_answers} Correct</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}><XCircle style={{ width: 14, height: 14, color: "#DC2626" }} />{r.incorrect_answers} Incorrect</span>
              </div>
            </CardContainer>
          ))}
        </div>
      )}
      <Section title="Subjects-wise Analysis" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((s: any) => {
          const score = subjectScore(s.id);
          return (
            <CardContainer key={s.id} className="border-purple-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50" onClick={() => onSelectSubject(s.id, s.name)}>
              <CardContent className="p-5">
                <h4 className="font-semibold mt-1 mb-2">{s.name}</h4>
                <p style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score), margin: "0 0 8px" }}>Predicted Score: {score}%</p>
                <div className="flex items-center justify-between mt-2"><span className="text-xs text-gray-600">Click to analyze</span><ChevronRight style={{ width: 16, height: 16, color: "#9333EA" }} /></div>
              </CardContent>
            </CardContainer>
          );
        })}
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

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Loader2 className="animate-spin" style={{ color: "#9333EA" }} /></div>;
  if (!data) return <div style={{ textAlign: "center", padding: 40 }}><p>No data.</p><button onClick={onBack}>Back</button></div>;

  const currentScore = Math.round(data.summary?.average_score || 0);
  const bestPossible = Math.min(100, currentScore + 15);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, fontWeight: 600, color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}><ArrowLeft style={{ width: 14, height: 14 }} /> Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FCE7F3", padding: "8px 16px", borderRadius: 12, marginBottom: 24 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "hsl(330,100%,92%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#9D174D" }}>{subjectName[0]}</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#9D174D" }}>{subjectName} Mastery</span>
      </div>
      <Section title="Predicted Score" />
      <CardContainer style={{ marginBottom: 24 }}>
        <div style={{ height: 32, background: "#F3F4F6", borderRadius: 16, position: "relative", overflow: "hidden", marginBottom: 8 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${currentScore}%`, background: "#FF8787", borderRadius: "16px 0 0 16px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{currentScore}</span></div>
          <div style={{ position: "absolute", top: 0, height: "100%", left: `${currentScore}%`, width: `${bestPossible - currentScore}%`, background: "#CCFF90", borderRadius: "0 16px 16px 0", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}><span style={{ color: "#1F2937", fontSize: 12, fontWeight: 800 }}>{bestPossible}</span></div>
        </div>
      </CardContainer>
      <Section title="Practice Time Analytics" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[{ label: "Daily", val: data.time_analytics?.daily_seconds }, { label: "Weekly", val: data.time_analytics?.weekly_seconds }, { label: "Monthly", val: data.time_analytics?.monthly_seconds }].map(t => (
          <CardContainer key={t.label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#9333EA", margin: 0 }}>{fmtTime(t.val || 0)}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: 0 }}>{t.label} Focus</p>
          </CardContainer>
        ))}
      </div>
    </div>
  );
}

// ─── Main Switcher ───────────────────────────────────────────────────────────

export default function Statistics() {
  const { mode } = usePracticeMode();
  const [selectedSubject, setSelectedSubject] = useState<{ id: number; name: string } | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const activeMode = mode === 'PRACTICE' ? 'practice' : 'normal';

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
            <ExamDeepDiveView examCode={selectedExam} onBack={() => setSelectedExam(null)} />
          ) : (
            <PracticeAnalyticsView onSelectExam={setSelectedExam} />
          )
        )}
      </div>
    </DashboardLayout>
  );
}
