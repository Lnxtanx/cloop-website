import React from "react";
import { ChevronDown, ChevronUp, Trophy, Check } from "lucide-react";
import { TopicGoal } from "@/lib/api/topic-chat";

export function goalIsCompleted(g: TopicGoal): boolean {
  return g.chat_goal_progress?.[0]?.is_completed ?? g.is_completed ?? false;
}

export function GoalsBar({ goals, open, onToggle }: { goals: TopicGoal[]; open: boolean; onToggle: () => void }) {
  const doneCount = goals.filter(goalIsCompleted).length;
  const totalCount = goals.length;
  const percentComplete = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div style={{ background: "#ffffff", borderBottom: "1px solid #e9d5ff", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 44,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#f3e8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy style={{ width: 13, height: 13, color: "#7e22ce" }} />
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1e1b4b" }}>Learning Goals</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 12,
              background: "#f3e8ff",
              color: "#6b21a8",
              border: "1px solid #e9d5ff",
            }}
          >
            {doneCount} / {totalCount} ({percentComplete}%)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7e22ce" }}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{open ? "Hide" : "View"}</span>
          {open ? (
            <ChevronUp style={{ width: 15, height: 15 }} />
          ) : (
            <ChevronDown style={{ width: 15, height: 15 }} />
          )}
        </div>
      </button>

      {open && (
        <div style={{ overflowX: "auto", paddingBottom: 14, paddingTop: 2 }}>
          <div style={{ display: "flex", gap: 10, padding: "0 20px", width: "max-content" }}>
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
                    width: 130,
                    borderRadius: 14,
                    padding: 10,
                    border: `1.5px solid ${completed ? "#c084fc" : active ? "#7e22ce" : "#e2e8f0"}`,
                    background: completed ? "#faf5ff" : active ? "#ffffff" : "#f8fafc",
                    boxShadow: active ? "0 4px 12px rgba(126, 34, 206, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {completed ? (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          <Check style={{ width: 11, height: 11, strokeWidth: 3 }} />
                        </div>
                      ) : active ? (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "2px solid #7e22ce",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7e22ce" }} />
                        </div>
                      ) : (
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #cbd5e1" }} />
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: completed ? "#6b21a8" : active ? "#581c87" : "#94a3b8",
                        }}
                      >
                        Goal {i + 1}
                      </span>
                    </div>

                    {phase && (
                      <span
                        style={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          borderRadius: 6,
                          padding: "1px 5px",
                          background: phase === "exam" ? "#fef3c7" : "#dcfce7",
                          color: phase === "exam" ? "#b45309" : "#15803d",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {phase === "exam" ? "EXAM" : "CONCEPT"}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: completed ? "#4c1d95" : active ? "#1e1b4b" : "#64748b",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      margin: 0,
                    }}
                    title={g.title || g.description}
                  >
                    {g.title || g.description}
                  </p>

                  {score > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${score}%`,
                            background: completed ? "linear-gradient(90deg, #7c3aed, #a855f7)" : "#7e22ce",
                            borderRadius: 2,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#6b7280" }}>{score}%</span>
                      </div>
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
