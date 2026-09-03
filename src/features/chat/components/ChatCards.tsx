import React, { useState } from "react";
import { Trophy, Star } from "lucide-react";
import { SessionSummaryData, ScorePrediction } from "@/lib/api/topic-chat";

/* ─── Teaching Arc component types ─── */
export interface SessionFrameData {
  concept?: string;
  why_it_matters?: string;
  objectives?: string[];
}
export interface ExamDefinition {
  term: string;
  definition: string;
  plain_english: string;
  formula?: string | null;
  units?: string | null;
}
export interface ConceptCardData {
  concept?: string;
  one_line_rule?: string;
  key_terms?: string[];
  watch_out_for?: string;
}
export interface RevisionSheetData {
  topic?: string;
  concepts_covered?: string[];
  definitions?: Array<{ term: string; definition: string }>;
  formulas?: Array<{ name: string; expression: string; symbols: string }>;
  key_points?: string[];
  common_mistakes?: string[];
  exam_likely_questions?: Array<{ question: string; marks: number; answer_outline: string }>;
  one_minute_recall?: string[];
  your_weak_spots?: string[];
}

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

        {/* AI Summary Text (merged from performance analysis, excluding raw dash walls) */}
        {message &&
          message !== "session_complete" &&
          message !== "Session Summary" &&
          !message.includes("1. Your Performance") &&
          !message.startsWith("—") &&
          !message.startsWith("⸻") && (
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

/* ─── AI Performance Summary Card ─── */
export function AISummaryCard({ text }: { text: string }) {
  let summaryText = text;
  let title = "Performance Summary";

  try {
    if (text.trim().startsWith("{")) {
      const parsed = JSON.parse(text);
      if (parsed.summary) summaryText = parsed.summary;
      if (parsed.title) title = parsed.title;
    }
  } catch {
    /* ignore */
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div
        style={{
          border: "1.5px solid #e9d5ff",
          borderRadius: 16,
          padding: 16,
          background: "#faf5ff",
          maxWidth: 480,
          color: "#1e1b4b",
          boxShadow: "0 2px 8px rgba(126, 34, 206, 0.05)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#7e22ce", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span>📝</span>
          <span>{title}</span>
        </div>
        <div style={{ color: "#334155", fontSize: 13.5, lineHeight: 1.6 }}>
          {summaryText}
        </div>
      </div>
    </div>
  );
}

/* ─── TEACHING ARC: Exam Definition Card (REVEAL phase) ─── */
export function ExamDefinitionCard({ data, defaultOpen = false }: { data: ExamDefinition; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!data?.term && !data?.definition) return null;
  return (
    <div
      style={{
        border: "1.5px solid #fbcfe8",
        borderRadius: 16,
        background: "#fdf2f8",
        maxWidth: 440,
        color: "#1e1b4b",
        boxShadow: "0 2px 8px rgba(236, 72, 153, 0.08)",
        margin: "6px 0",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "10px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
        title={open ? "Collapse" : "Expand"}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#db2777", textTransform: "uppercase", letterSpacing: 0.4 }}>
          ✍️ Write this down · {data.term}
        </span>
        <span style={{ fontSize: 12, color: "#db2777", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: "2px 14px 14px 14px" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", marginBottom: 6 }}>{data.term}</div>
          <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 10 }}>
            {data.definition}
          </div>
          {data.formula && (
            <div style={{ background: "#fff", border: "1px solid #fce7f3", borderRadius: 8, padding: "8px 12px", fontSize: 14, fontWeight: 600, color: "#9d174d", marginBottom: 8 }}>
              {data.formula}
              {data.units ? <span style={{ color: "#64748b", fontWeight: 400 }}>  ({data.units})</span> : null}
            </div>
          )}
          {data.plain_english && (
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>In plain words: </span>{data.plain_english}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── TEACHING ARC: Concept Card (LOCK phase) ─── */
export function ConceptCard({ data }: { data: ConceptCardData }) {
  if (!data?.concept && !data?.one_line_rule) return null;
  return (
    <div
      style={{
        border: "1.5px solid #c7d2fe",
        borderRadius: 16,
        padding: 16,
        background: "#eef2ff",
        maxWidth: 440,
        color: "#1e1b4b",
        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
        margin: "8px 0",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
        🧠 Rule to remember
      </div>
      {data.concept && <div style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", marginBottom: 6 }}>{data.concept}</div>}
      {data.one_line_rule && <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 10 }}>{data.one_line_rule}</div>}
      {data.watch_out_for && (
        <div style={{ background: "#fff", border: "1px solid #e0e7ff", borderRadius: 8, padding: "8px 10px" }}>
          <span style={{ fontWeight: 700, color: "#db2777" }}>Watch out for: </span>
          <span style={{ color: "#475569" }}>{data.watch_out_for}</span>
        </div>
      )}
      {data.key_terms?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Key terms</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.key_terms.map((t, i) => (
              <span key={i} style={{ background: "#c7d2fe", color: "#312e81", fontSize: 12, fontWeight: 600, borderRadius: 12, padding: "2px 10px" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TEACHING ARC: Revision Sheet Card (WRAP phase) ─── */
export function RevisionSheetCard({ data }: { data: RevisionSheetData }) {
  if (!data?.topic && !data?.key_points?.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", margin: "8px 0 16px" }}>
      <div
        style={{
          border: "1.5px solid #cbd5e1",
          borderRadius: 18,
          padding: 18,
          background: "#ffffff",
          maxWidth: 520,
          color: "#1e293b",
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
          📚 Revision Sheet
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", marginBottom: 12 }}>{data.topic}</div>

        {(data.definitions?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#db2777", marginBottom: 6 }}>📖 Definitions</div>
            {data.definitions!.map((d, i) => (
              <div key={i} style={{ marginBottom: 6, fontSize: 13 }}>
                <strong style={{ color: "#6b40d8" }}>{d.term}:</strong> <span style={{ color: "#334155" }}>{d.definition}</span>
              </div>
            ))}
          </div>
        )}

        {(data.formulas?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 6 }}>🧮 Formulas</div>
            {data.formulas!.map((f, i) => (
              <div key={i} style={{ background: "#eef2ff", border: "1px solid #e0e7ff", borderRadius: 8, padding: "6px 10px", fontSize: 13, marginBottom: 4 }}>
                <strong>{f.name}:</strong> <span style={{ fontFamily: "monospace" }}>{f.expression}</span>
                {f.symbols ? <span style={{ color: "#64748b" }}> ({f.symbols})</span> : null}
              </div>
            ))}
          </div>
        )}

        {(data.key_points?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#b45309", marginBottom: 6 }}>🔑 Key Points</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.key_points!.map((p, i) => <li key={i} style={{ fontSize: 13, color: "#334155", margin: "3px 0" }}>{p}</li>)}
            </ul>
          </div>
        )}

        {(data.common_mistakes?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>⚠️ Common Mistakes</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.common_mistakes!.map((m, i) => <li key={i} style={{ fontSize: 13, color: "#334155", margin: "3px 0" }}>{m}</li>)}
            </ul>
          </div>
        )}

        {(data.exam_likely_questions?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 6 }}>📝 Likely Exam Questions</div>
            {data.exam_likely_questions!.map((q, i) => (
              <div key={i} style={{ background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 8, padding: "8px 10px", marginBottom: 6, fontSize: 13 }}>
                <div><strong>{i + 1}. {q.question}</strong> {q.marks ? <span style={{ color: "#64748b" }}>({q.marks} marks)</span> : null}</div>
                {q.answer_outline ? <div style={{ color: "#475569", marginTop: 3 }}>💡 {q.answer_outline}</div> : null}
              </div>
            ))}
          </div>
        )}

        {(data.one_minute_recall?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>⏱️ One-Minute Recall</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.one_minute_recall!.map((r, i) => (
                <span key={i} style={{ background: "#f5f3ff", color: "#6d28d9", fontSize: 12, borderRadius: 14, padding: "2px 10px" }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {(data.your_weak_spots?.length ?? 0) > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#be185d", marginBottom: 6 }}>🎯 Revise these again</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.your_weak_spots!.map((w, i) => (
                <span key={i} style={{ background: "#fdf2f8", color: "#be185d", fontSize: 12, borderRadius: 14, padding: "2px 10px" }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TEACHING ARC: Session Frame Card (FRAME phase) ─── */
export function SessionFrameCard({ data }: { data: SessionFrameData }) {
  if (!data?.concept && !data?.objectives?.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", margin: "8px 0" }}>
      <div
        style={{
          border: "1.5px solid #a7f3d0",
          borderRadius: 16,
          padding: 16,
          background: "#ecfdf5",
          maxWidth: 440,
          color: "#1e1b4b",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.08)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
          🎯 By the end, you'll be able to
        </div>
        {data.concept && <div style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", marginBottom: 6 }}>{data.concept}</div>}
        {data.why_it_matters && <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 10 }}>{data.why_it_matters}</div>}
        {(data.objectives?.length ?? 0) > 0 && (
          <div style={{ display: "grid", gap: 6 }}>
            {data.objectives!.map((o, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ background: "#059669", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "#334155" }}>{o}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

