import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CardContent } from "@/components/ui/card";
import {
  ArrowLeft, CheckCircle2, XCircle, HelpCircle,
  TrendingUp, Clock, RefreshCw, CheckCheck, AlertCircle, ArrowRight, ChevronRight, Loader2,
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

// ─── Student Dashboard view ───────────────────────────────────────────────────

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#ec4899" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Welcome box */}
      <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ background: "#FCE7F3", padding: "12px 16px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#1F2937", margin: 0 }}>
            Hi there! Welcome to your mastery dashboard
          </p>
        </div>
        <div style={{ background: "#FDF2F8", padding: "12px 16px 16px" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", margin: "0 0 8px" }}>Here you can -</p>
          {[
            "Track how much you study and how effectively you learn",
            "See which concepts you've mastered and which need focus",
            "Follow suggested focus areas to improve scores faster",
            "Monitor progress and score improvement over time",
          ].map((t, i) => (
            <p key={i} style={{ fontSize: 12, color: "#4B5563", margin: "0 0 3px", lineHeight: 1.5 }}>
              {i + 1}. {t}
            </p>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <Section title="Quick Overview (Recent Sessions)" />
      {reports.length === 0 ? (
        <div style={{ background: "#fff", border: "1.5px dashed #E5E7EB", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No recent sessions found.</p>
          <p style={{ fontSize: 12, color: "#6B7280" }}>Complete a topic to see your performance metrics here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {reports.map((r: any) => (
            <CardContainer key={r.id} style={{ cursor: "pointer" }}
              onClick={() => r.topics?.subjects?.id && onSelectSubject(r.topics.subjects.id, r.topics.subjects.name)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#1F2937", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.topics?.title ?? "Unknown Topic"}
                  </p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.topics?.chapters?.title ?? ""}
                  </p>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: scoreBg(r.score_percent), color: scoreColor(r.score_percent), flexShrink: 0,
                }}>
                  {r.score_percent}%
                </span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#EC4899" }} />{r.correct_answers} Correct
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}>
                  <XCircle style={{ width: 14, height: 14, color: "#DC2626" }} />{r.incorrect_answers} Incorrect
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4B5563" }}>
                  <HelpCircle style={{ width: 14, height: 14, color: "#6B7280" }} />{r.total_questions} Questions
                </span>
              </div>
            </CardContainer>
          ))}
        </div>
      )}

      {/* Subjects grid */}
      <Section title="Subjects-wise Analysis" />
      {subjects.length === 0 ? (
        <p style={{ color: "#6B7280", textAlign: "center", padding: 20 }}>No enrolled subjects found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((s: any) => {
            const score = subjectScore(s.id);
            return (
              <CardContainer key={s.id}
                className="border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50"
                onClick={() => onSelectSubject(s.id, s.name)}>
                <CardContent className="p-5">
                  <h4 className="font-semibold mt-1 mb-2">{s.name}</h4>
                  <p style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score), margin: "0 0 8px" }}>
                    Predicted Score: {score}%
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">
                      Click to analyze
                    </span>
                    <ChevronRight style={{ width: 16, height: 16, color: "#7c3aed" }} />
                  </div>
                </CardContent>
              </CardContainer>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Per-subject view ─────────────────────────────────────────────────────────

function SubjectView({ subjectId, subjectName, onBack }: { subjectId: number; subjectName: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalReport, setModalReport] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.allSettled([
      get(`/api/profile/learning-analytics/subject/${subjectId}`),
      get(`/api/topic-chats/reports/subject/${subjectId}`),
    ]).then(([r1, r2]) => {
      if (r1.status === "fulfilled") setData(r1.value);
      else setError("Could not load subject data.");
      if (r2.status === "fulfilled") setReports(r2.value ?? []);
    }).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#7c3aed" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ color: "#DC2626" }}>{error || "No data available."}</p>
        <button onClick={onBack} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", background: "#fff" }}>
          ← Back
        </button>
      </div>
    );
  }

  const { subject, summary, time_analytics, concepts_mastery, recommended_focus, error_analysis } = data;
  const currentScore = Math.round(summary?.average_score || 0);
  const bestPossible = Math.min(100, currentScore + 15);

  const errorItems = [
    { label: "Concept Errors",  key: "Conceptual",   color: "#8B5CF6" },
    { label: "Step Mistakes",   key: "Application",  color: "#A855F7" },
    { label: "Calculation",     key: "Calculation",  color: "#D946EF" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Back + subject header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
          borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff",
          fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500,
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#FCE7F3", padding: "8px 16px", borderRadius: 12,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "hsl(330,100%,92%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: "hsl(330,81%,35%)",
          }}>
            {(subject?.name || subjectName)?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#9D174D" }}>
            {subject?.name || subjectName}
          </span>
        </div>
      </div>

      {/* Predicted Score */}
      <Section title="Predicted Score" />
      <CardContainer style={{ marginBottom: 24 }}>
        <div style={{ height: 32, background: "#F3F4F6", borderRadius: 16, position: "relative", overflow: "hidden", marginBottom: 8 }}>
          {/* Current score bar (red) */}
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${currentScore}%`, background: "#FF8787",
            borderRadius: "16px 0 0 16px",
            display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
          }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{currentScore}</span>
          </div>
          {/* Potential gain (green) */}
          <div style={{
            position: "absolute", top: 0, height: "100%",
            left: `${currentScore}%`, width: `${bestPossible - currentScore}%`,
            background: "#CCFF90",
            borderRadius: "0 16px 16px 0",
            display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
          }}>
            <span style={{ color: "#1F2937", fontSize: 12, fontWeight: 800 }}>{bestPossible}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Current Level</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Best Possible</span>
        </div>
      </CardContainer>

      {/* Learning Time */}
      <Section title="Total Learning Time" subtitle="This shows how smartly you're studying, not just how long." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Daily",   val: time_analytics?.daily_seconds   ?? 0 },
          { label: "Weekly",  val: time_analytics?.weekly_seconds  ?? 0 },
          { label: "Monthly", val: time_analytics?.monthly_seconds ?? 0 },
        ].map(({ label, val }) => (
          <CardContainer key={label} style={{ textAlign: "center", padding: 16 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#8B5CF6", margin: "0 0 4px" }}>{fmtTime(val)}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{label}</p>
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>Focused Time</p>
          </CardContainer>
        ))}
      </div>

      {/* Total Sessions */}
      <Section title="Total Sessions" subtitle="This is your Monthly Session Summary" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <HelpCircle style={{ width: 20, height: 20, color: "#6B7280" }} />, val: summary?.total_questions ?? 0, label: "Questions", color: "#8B5CF6" },
          { icon: <CheckCircle2 style={{ width: 20, height: 20, color: "#8B5CF6" }} />, val: summary?.correct_answers ?? 0, label: "Correct", color: "#8B5CF6" },
          { icon: <TrendingUp style={{ width: 20, height: 20, color: "#8B5CF6" }} />, val: "+5%", label: "Improved", color: "#8B5CF6" },
        ].map(({ icon, val, label, color }) => (
          <CardContainer key={label} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{icon}</div>
            <p style={{ fontSize: 24, fontWeight: 700, color, margin: "0 0 2px" }}>{val}</p>
            <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{label}</p>
          </CardContainer>
        ))}
      </div>

      {/* Concepts Mastered */}
      <Section title="Concepts You've Mastered" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {[
          { icon: <CheckCheck style={{ width: 18, height: 18, color: "#4F46E5" }} />, bg: "#E0E7FF", title: "Understood Well", desc: "Ready for advanced questions", count: concepts_mastery?.mastered ?? 0, badge: "#8B5CF6" },
          { icon: <Clock style={{ width: 18, height: 18, color: "#9333EA" }} />, bg: "#F3E8FF",  title: "Still Learning", desc: "Keep practicing these", count: concepts_mastery?.learning ?? 0, badge: "#A855F7" },
          { icon: <RefreshCw style={{ width: 18, height: 18, color: "#D946EF" }} />, bg: "#FAE8FF", title: "Not Started", desc: "New topics ahead", count: concepts_mastery?.not_started ?? 0, badge: "#C084FC" },
        ].map(({ icon, bg, title, desc, count, badge }) => (
          <CardContainer key={title} style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1F2937", margin: "0 0 2px" }}>{title}</p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{desc}</p>
              </div>
              <div style={{ background: badge, borderRadius: 10, padding: "5px 14px" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{count}</span>
              </div>
            </div>
          </CardContainer>
        ))}
      </div>

      {/* Error Profile */}
      <Section title="Profile of Your Errors" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {errorItems.map(({ label, key, color }) => {
          const count = error_analysis?.error_types?.[key] ?? 0;
          const total = summary?.incorrect_answers || 1;
          const pct = Math.min(100, Math.round((count / total) * 100));
          return (
            <CardContainer key={key} style={{ padding: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1F2937", margin: "0 0 3px" }}>{label}</p>
              <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 8px" }}>{count > 0 ? `${count} mistakes` : "No errors"}</p>
              <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
              </div>
            </CardContainer>
          );
        })}
      </div>

      {/* Recommended Focus */}
      <Section title="Recommended Focus" />
      {!recommended_focus || recommended_focus.length === 0 ? (
        <div style={{ background: "#F3F4F6", border: "1.5px dashed #E5E7EB", borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 24 }}>
          <p style={{ color: "#6B7280", fontWeight: 500 }}>No weak topics found! Great job!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {recommended_focus.slice(0, 2).map((item: any, i: number) => (
            <div key={i} style={{ background: i === 0 ? "#EDE9FE" : "#DDD6FE", borderRadius: 16, padding: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#4C1D95", margin: "0 0 4px" }}>{item.title}</p>
              <p style={{ fontSize: 12, color: "#5B21B6", margin: "0 0 12px" }}>Fixing this topic can improve your marks fastest.</p>
              <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8B5CF6" }}>Potential Gain</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6" }}>+{item.potential_gain} Marks</span>
              </div>
              <button style={{
                width: "100%", background: "#8B5CF6", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Practice Now <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Topic Reports */}
      <Section title="Topic Reports" subtitle="Recent performance reports for this subject" />
      {reports.length === 0 ? (
        <div style={{ background: "#F3F4F6", border: "1.5px dashed #E5E7EB", borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 24 }}>
          <p style={{ color: "#6B7280", fontWeight: 500 }}>No reports yet. Start a session!</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
          <div style={{ display: "flex", gap: 12, width: "max-content" }}>
            {reports.map((r: any, i: number) => {
              const bg = r.score_percent >= 75 ? "#D1FAE5" : r.score_percent >= 50 ? "#FEF3C7" : "#FEE2E2";
              return (
                <div key={i} onClick={() => setModalReport(r)}
                  style={{ width: 160, background: bg, borderRadius: 14, padding: 12, cursor: "pointer", flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#1F2937", margin: "0 0 4px", lineHeight: 1.3,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: 36 }}>
                    {r.topics?.title ?? "Unknown Topic"}
                  </p>
                  <p style={{ fontSize: 12, color: "#4B5563", margin: "0 0 8px" }}>{r.star_rating ?? 0} ⭐</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#1F2937", margin: "0 0 2px" }}>{r.score_percent ?? 0}%</p>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 10px" }}>{r.performance_level ?? ""}</p>
                  <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "5px 0", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#4B5563" }}>View Report</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Alert card */}
      <div style={{ background: "#E0E7FF", borderRadius: 16, padding: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <AlertCircle style={{ width: 22, height: 22, color: "#1F2937" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1F2937" }}>Are you stuck on a topic?</span>
        </div>
        <p style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.6, margin: "0 0 12px" }}>
          Your scores have stayed the same for 3 days. Try going through topic summaries before taking another quiz.
        </p>
        <button style={{
          width: "100%", background: "#818CF8", color: "#fff", border: "none",
          borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          AI Tutor Recommendations <ArrowRight style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* Report modal */}
      {modalReport && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setModalReport(null)}
        >
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Session Report</p>
              <button onClick={() => setModalReport(null)} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#1F2937", marginBottom: 12 }}>{modalReport.topics?.title}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Score", val: `${modalReport.score_percent ?? 0}%`, color: scoreColor(modalReport.score_percent) },
                { label: "Rating", val: `${modalReport.star_rating ?? 0} ⭐`, color: "#374151" },
                { label: "Correct", val: modalReport.correct_answers ?? 0, color: "#8B5CF6" },
                { label: "Incorrect", val: modalReport.incorrect_answers ?? 0, color: "#EF4444" },
                { label: "Questions", val: modalReport.total_questions ?? 0, color: "#8B5CF6" },
                { label: "Level", val: modalReport.performance_level ?? "—", color: "#374151" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: "#F9FAFB", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "0 0 3px" }}>{label}</p>
                  <p style={{ fontWeight: 700, fontSize: 16, color, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            {modalReport.top_error_types?.length > 0 && (
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Common Mistakes</p>
                {modalReport.top_error_types.map((e: any, i: number) => (
                  <p key={i} style={{ fontSize: 12, color: "#6B7280", margin: "0 0 3px" }}>• {e.type}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function Statistics() {
  const [selectedSubject, setSelectedSubject] = useState<{ id: number; name: string } | null>(null);

  return (
    <DashboardLayout title={selectedSubject ? "Subjects-wise Analysis" : "Student Dashboard"}>
      <div className="animate-fade-in">
        {selectedSubject ? (
          <SubjectView
            subjectId={selectedSubject.id}
            subjectName={selectedSubject.name}
            onBack={() => setSelectedSubject(null)}
          />
        ) : (
          <DashboardView
            onSelectSubject={(id, name) => setSelectedSubject({ id, name })}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
