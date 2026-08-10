import React from "react";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { TopicGoal } from "@/lib/api/topic-chat";

export function goalIsCompleted(g: TopicGoal): boolean {
  return g.chat_goal_progress?.[0]?.is_completed ?? g.is_completed ?? false;
}

export function GoalsBar({ goals, open, onToggle }: { goals: TopicGoal[]; open: boolean; onToggle: () => void }) {
  const doneCount = goals.filter(goalIsCompleted).length;

  return (
    <div style={{ background: "#f4f4f5", borderBottom: "1px solid #e4e4e7", flexShrink: 0 }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 40,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy style={{ width: 15, height: 15, color: "#000000" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Learning Goals</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{doneCount}/{goals.length}</span>
        </div>
        {open ? (
          <ChevronUp style={{ width: 15, height: 15, color: "#000000" }} />
        ) : (
          <ChevronDown style={{ width: 15, height: 15, color: "#000000" }} />
        )}
      </button>
      {open && (
        <div style={{ overflowX: "auto", paddingBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, padding: "0 16px", width: "max-content" }}>
            {goals.map((g, i) => {
              const completed = goalIsCompleted(g);
              const active = !completed && (i === 0 || goalIsCompleted(goals[i - 1]));
              const progress = g.chat_goal_progress?.[0];
              const numQ: number = progress?.num_questions ?? 0;
              const numC: number = progress?.num_correct ?? 0;
              const score = progress?.score_percent ?? (numQ > 0 ? Math.round((numC / numQ) * 100) : 0);
              const phase: "concept" | "exam" | null = active ? (numQ >= 2 ? "exam" : "concept") : null;

              return (
                <div
                  key={g.id}
                  style={{
                    width: 116,
                    borderRadius: 12,
                    padding: 10,
                    border: `2px solid ${completed ? "#000000" : active ? "#18181b" : "#d1d5db"}`,
                    background: completed ? "#f4f4f5" : active ? "#ffffff" : "#f9fafb",
                    boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {completed ? (
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontSize: 9 }}>✓</span>
                        </div>
                      ) : active ? (
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#000000" }} />
                        </div>
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #d1d5db" }} />
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, color: completed ? "#000000" : active ? "#000000" : "#9ca3af" }}>{i + 1}</span>
                    </div>
                    {phase && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          borderRadius: 6,
                          padding: "2px 5px",
                          background: phase === "exam" ? "#f4f4f5" : "#f0fdf4",
                          color: phase === "exam" ? "#000000" : "#16a34a",
                        }}
                      >
                        {phase === "exam" ? "EXAM" : "CONCEPT"}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#374151", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {g.title || g.description}
                  </p>
                  {score > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 3, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                        <div style={{ height: "100%", width: `${score}%`, background: completed ? "#000000" : "#18181b", borderRadius: 2, transition: "width 0.4s ease" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>{score}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
