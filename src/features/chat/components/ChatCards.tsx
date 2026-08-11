import React from "react";
import { Trophy, Star } from "lucide-react";
import { SessionSummaryData, ScorePrediction } from "@/lib/api/topic-chat";

/* ─── Legacy SummaryCard (kept for backward compat) ─── */
export function SummaryCard({ data }: { data: SessionSummaryData }) {
  const score = Number(data.score_percent ?? data.overall_score_percent ?? data.performance_percent ?? 0);
  const predicted = data.predicted_score != null ? Math.round(Number(data.predicted_score)) : Math.min(100, Math.round(score + 15));
  const low = score < 35;

  return (
    <div className="flex justify-start mb-4">
      <div className={`rounded-2xl p-5 w-72 ${low ? "bg-red-50" : "bg-green-50"}`}>
        <div className="text-center mb-4">
          <Trophy className={`w-9 h-9 mx-auto mb-1.5 ${low ? "text-red-500" : "text-green-600"}`} />
          <p className={`text-2xl font-extrabold ${low ? "text-red-600" : "text-green-700"}`}>Score — {score}</p>
          <p className={`text-sm font-semibold ${low ? "text-red-400" : "text-green-500"}`}>Predicted — {predicted}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Total", val: data.total_questions ?? 0, bg: "bg-zinc-100", c: "text-black" },
            { label: "Correct", val: data.correct_answers ?? 0, bg: "bg-green-100", c: "text-green-700" },
            { label: "Wrong", val: data.incorrect_answers ?? 0, bg: "bg-red-100", c: "text-red-600" },
          ].map(({ label, val, bg, c }) => (
            <div key={label} className={`${bg} rounded-xl py-2.5 text-center`}>
              <p className={`text-lg font-extrabold ${c}`}>{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        {(data.top_error_types?.length ?? 0) > 0 && (
          <div className="mb-2">
            <p className="text-xs font-bold text-gray-700 mb-1">🚀 Common Mistakes</p>
            {data.top_error_types!.slice(0, 3).map((e, i) => <p key={i} className="text-xs text-gray-500">• {e.type}</p>)}
          </div>
        )}
        {data.has_weak_areas && (data.weak_goals?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1">💡 Areas to Improve</p>
            {data.weak_goals!.map((g, i) => <p key={i} className="text-xs text-gray-500">• {g.goal_title}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── NEW: Session Summary Card (rich metrics card for end-of-session) ─── */
export function SessionSummaryCard({ data, message }: { data: SessionSummaryData; message?: string }) {
  const score = Number(data.overall_score_percent ?? data.score_percent ?? data.performance_percent ?? 0);
  const stars = data.star_rating ?? (score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1);
  const level = data.performance_level ?? (score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement");

  const scoreBg = score >= 80 ? "#dcfce7" : score >= 60 ? "#fef9c3" : "#fee2e2";
  const scoreBorder = score >= 80 ? "#86efac" : score >= 60 ? "#fde047" : "#fca5a5";
  const scoreColor = score >= 80 ? "#166534" : score >= 60 ? "#854d0e" : "#991b1b";
  const levelBg = score >= 80 ? "#bbf7d0" : score >= 60 ? "#fef08a" : "#fecaca";

  const goalPerf = data.goal_performance ?? [];

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div
        style={{
          background: "#ffffff",
          border: `1.5px solid ${scoreBorder}`,
          borderRadius: 18,
          padding: 20,
          minWidth: 280,
          maxWidth: 380,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header: Trophy + Score */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  fill: i < stars ? "#f59e0b" : "none",
                  color: i < stars ? "#f59e0b" : "#d1d5db",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "inline-block",
              background: scoreBg,
              borderRadius: 12,
              padding: "8px 20px",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: scoreColor }}>{score}%</span>
          </div>
          <div
            style={{
              display: "inline-block",
              background: levelBg,
              borderRadius: 20,
              padding: "3px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: scoreColor,
              marginLeft: 8,
            }}
          >
            {level}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Total", val: data.total_questions ?? 0, bg: "#f8fafc", color: "#1e293b" },
            { label: "Correct", val: data.correct_answers ?? 0, bg: "#f0fdf4", color: "#166534" },
            { label: "Wrong", val: data.incorrect_answers ?? 0, bg: "#fef2f2", color: "#991b1b" },
          ].map(({ label, val, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 12, padding: "10px 0", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Per-Goal Breakdown */}
        {goalPerf.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>📊 Goal Breakdown</div>
            {goalPerf.map((g, i) => {
              const pct = g.score_percent ?? 0;
              const barColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#ef4444";
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: "#334155", fontWeight: 600, maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {g.goal_title}
                    </span>
                    <span style={{ color: barColor, fontWeight: 700 }}>
                      {pct}% ({g.correct_answers}/{g.questions_asked})
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.max(pct, 3)}%`, background: barColor, borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Common Mistakes */}
        {(data.top_error_types?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>⚠️ Common Mistakes</div>
            {data.top_error_types!.slice(0, 3).map((e, i) => (
              <div key={i} style={{ fontSize: 12, color: "#64748b", paddingLeft: 8 }}>• {e.type}{e.count ? ` (${e.count}×)` : ""}</div>
            ))}
          </div>
        )}

        {/* Weak Areas */}
        {data.has_weak_areas && (data.weak_goals?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>💡 Areas to Improve</div>
            {data.weak_goals!.map((g, i) => (
              <div key={i} style={{ fontSize: 12, color: "#64748b", paddingLeft: 8 }}>
                • {g.goal_title}{g.score_percent != null ? ` (${g.score_percent}%)` : ""}
              </div>
            ))}
          </div>
        )}

        {/* AI Summary Text (merged from performance analysis) */}
        {message && message !== "session_complete" && message !== "Session Summary" && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid #f1f5f9",
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Score Prediction Card ─── */
export function ScorePredictionCard({ data }: { data: ScorePrediction }) {
  const pred = Math.round(data.predicted_score);
  const concept = Math.round((data.concept_score ?? 0) * 100);
  const exam = Math.round((data.exam_score ?? 0) * 100);
  const color = pred >= 75 ? "text-green-700" : pred >= 50 ? "text-amber-600" : "text-red-600";
  const bg = pred >= 75 ? "bg-green-50 border-green-200" : pred >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="flex justify-start mb-4">
      <div className={`rounded-2xl p-4 min-w-[240px] max-w-[300px] border ${bg}`}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-bold text-gray-800">{data.goal_title ? `Goal: ${data.goal_title}` : "Goal Complete"}</span>
        </div>
        <div className="text-center mb-3">
          <span className={`text-3xl font-extrabold ${color}`}>{pred}%</span>
          <p className="text-xs text-gray-500 mt-1">Predicted Score</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Concept", val: concept, bg2: "bg-zinc-100", c2: "text-black" },
            { label: "Exam", val: exam, bg2: "bg-zinc-100", c2: "text-black" },
          ].map(({ label, val, bg2, c2 }) => (
            <div key={label} className={`${bg2} rounded-xl py-2 text-center`}>
              <p className={`text-base font-extrabold ${c2}`}>{val}%</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Internet Link Card ─── */
export function InternetLinkCard({ diffHtml }: { diffHtml?: string | null }) {
  let d: { title?: string; url?: string } = {};
  try {
    d = JSON.parse(diffHtml ?? "{}");
  } catch { /* ignore */ }
  if (!d.url) return null;
  return (
    <div style={{ margin: "8px 0" }}>
      <a
        href={d.url}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-block",
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #e6e1f5",
          background: "#faf9ff",
          color: "#6b40d8",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        🔗 {d.title || "Further reading"}
      </a>
    </div>
  );
}

/* ─── Goal Revision Card ─── */
export function GoalRevisionCard({ diffHtml }: { diffHtml?: string | null }) {
  let d: { title?: string; definitions?: { term: string; definition: string }[] } = {};
  try {
    d = JSON.parse(diffHtml ?? "{}");
  } catch { /* ignore */ }
  if (!d.definitions?.length) return null;

  return (
    <div
      style={{
        border: "1px solid #e6e1f5",
        borderRadius: 14,
        padding: 16,
        background: "#faf9ff",
        margin: "8px 0",
        maxWidth: 560,
        color: "#1f2430",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: "#6b40d8", marginBottom: 10 }}>
        📌 {d.title || "Remember for your test"}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {d.definitions.map((x, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontWeight: 700 }}>{x.term}</div>
            <div style={{ color: "#444" }}>{x.definition}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Learning Report Card (updated: also accepts summary field) ─── */
export function LearningReportCard({ diffHtml }: { diffHtml?: string | null }) {
  let d: {
    title?: string;
    summary?: string;
    focus_areas?: string[];
    strong_areas?: string[];
    key_definitions?: { term: string; definition: string }[];
    recommendation?: string;
  } = {};
  try {
    d = JSON.parse(diffHtml ?? "{}");
  } catch { /* ignore */ }

  // If only summary text, render as a simple styled card
  if (!d.focus_areas && !d.strong_areas && !d.key_definitions && d.summary) {
    return (
      <div
        style={{
          border: "1px solid #e6e1f5",
          borderRadius: 14,
          padding: 16,
          background: "#faf9ff",
          margin: "8px 0",
          maxWidth: 560,
          color: "#1f2430",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "#6b40d8", marginBottom: 10 }}>
          📝 {d.title || "Performance Summary"}
        </div>
        <div style={{ color: "#475569" }}>{d.summary}</div>
      </div>
    );
  }

  if (!d.focus_areas && !d.strong_areas && !d.key_definitions) return null;
  const label = { fontWeight: 600, fontSize: 13, marginBottom: 4 } as const;

  return (
    <div
      style={{
        border: "1px solid #e6e1f5",
        borderRadius: 14,
        padding: 16,
        background: "#faf9ff",
        margin: "8px 0",
        maxWidth: 560,
        color: "#1f2430",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: "#6b40d8", marginBottom: 10 }}>
        🧾 {d.title || "Your learning report"}
      </div>
      {!!d.focus_areas?.length && (
        <div style={{ marginTop: 10 }}>
          <div style={label}>🔴 Focus on this</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {d.focus_areas.map((t, i) => (
              <li key={i} style={{ margin: "4px 0" }}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {!!d.strong_areas?.length && (
        <div style={{ marginTop: 10 }}>
          <div style={label}>🟢 Great job on</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {d.strong_areas.map((t, i) => (
              <li key={i} style={{ margin: "4px 0" }}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {!!d.key_definitions?.length && (
        <div style={{ marginTop: 10 }}>
          <div style={label}>📌 Key definitions</div>
          <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
            {d.key_definitions.map((x, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "6px 10px" }}>
                <strong style={{ color: "#6b40d8" }}>{x.term}:</strong> {x.definition}
              </div>
            ))}
          </div>
        </div>
      )}
      {d.recommendation && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #eee", fontSize: 13, color: "#555" }}>
          💡 {d.recommendation}
        </div>
      )}
    </div>
  );
}
