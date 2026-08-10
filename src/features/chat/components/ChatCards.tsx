import React from "react";
import { Trophy } from "lucide-react";
import { SessionSummaryData, ScorePrediction } from "@/lib/api/topic-chat";

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

export function LearningReportCard({ diffHtml }: { diffHtml?: string | null }) {
  let d: {
    title?: string;
    focus_areas?: string[];
    strong_areas?: string[];
    key_definitions?: { term: string; definition: string }[];
    recommendation?: string;
  } = {};
  try {
    d = JSON.parse(diffHtml ?? "{}");
  } catch { /* ignore */ }

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

