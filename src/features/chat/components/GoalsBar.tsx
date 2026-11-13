import React from "react";
import { ChevronDown, ChevronUp, Trophy, Check } from "lucide-react";
import { TopicGoal } from "@/lib/api/topic-chat";
import { useIsMobile } from "@/hooks/use-mobile";

export function cleanGoalTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^Goal\s*\d+\s*:\s*/i, "").trim();
}

export function goalIsCompleted(g: TopicGoal): boolean {
  return g.chat_goal_progress?.[0]?.is_completed ?? g.is_completed ?? false;
}

export function GoalsBar({ goals, open, onToggle }: { goals: TopicGoal[]; open: boolean; onToggle: () => void }) {
  const doneCount = goals.filter(goalIsCompleted).length;
  const totalCount = goals.length;
  const percentComplete = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#ffffff", borderBottom: "1px solid #e9d5ff", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 12px" : "0 20px",
          height: isMobile ? 38 : 44,
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
          <div style={{ display: "flex", gap: isMobile ? 8 : 10, padding: isMobile ? "0 12px" : "0 20px", width: "max-content" }}>
            {goals.map((g, i) => {
              const completed = goalIsCompleted(g);
              const active = !completed && (i === 0 || goalIsCompleted(goals[i - 1]));
              const progress = g.chat_goal_progress?.[0];
              const numQ: number = progress?.num_questions ?? 0;
              const phase: "concept" | "exam" | null = active ? (numQ >= 2 ? "exam" : "concept") : null;
              const goalText = cleanGoalTitle(g.title || g.description);

              return (
                <div
                  key={g.id}
                  style={{
                    width: isMobile ? 150 : 180,
                    minWidth: isMobile ? 150 : 180,
                    borderRadius: 14,
                    padding: isMobile ? "10px 12px" : "12px 14px",
                    border: `1.5px solid ${completed ? "#e9d5ff" : active ? "#7c3aed" : "#e2e8f0"}`,
                    background: completed ? "#faf5ff" : active ? "#ffffff" : "#f8fafc",
                    boxShadow: active
                      ? "0 4px 16px rgba(124, 58, 237, 0.14)"
                      : completed
                      ? "0 1px 3px rgba(124, 58, 237, 0.05)"
                      : "0 1px 2px rgba(0,0,0,0.02)",
                    transition: "all 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Top Row: Milestone Indicator + Status Pill */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      {completed ? (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          <Check style={{ width: 12, height: 12, strokeWidth: 3 }} />
                        </div>
                      ) : active ? (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "2px solid #7c3aed",
                            background: "#f5f3ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed" }} />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "1.5px solid #cbd5e1",
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#94a3b8",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: completed ? "#6b21a8" : active ? "#4c1d95" : "#64748b",
                        }}
                      >
                        Goal {i + 1}
                      </span>
                    </div>

                    {completed ? (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          borderRadius: 8,
                          padding: "2px 7px",
                          background: "#f3e8ff",
                          color: "#7e22ce",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Done
                      </span>
                    ) : active ? (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          borderRadius: 8,
                          padding: "2px 7px",
                          background: phase === "exam" ? "#fef3c7" : "#ede9fe",
                          color: phase === "exam" ? "#b45309" : "#6d28d9",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {phase === "exam" ? "Exam" : "Active"}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          borderRadius: 8,
                          padding: "2px 6px",
                          background: "#f1f5f9",
                          color: "#94a3b8",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Next
                      </span>
                    )}
                  </div>

                  {/* Body: Clean Goal Description (no redundant 'Goal N:') */}
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: completed ? "#4c1d95" : active ? "#0f172a" : "#64748b",
                      lineHeight: 1.45,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      margin: 0,
                      minHeight: 36,
                    }}
                    title={g.title || g.description}
                  >
                    {goalText}
                  </p>

                  {/* Footer: Status line */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 3.5, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: completed ? "100%" : active ? "50%" : "0%",
                          background: completed
                            ? "linear-gradient(90deg, #7c3aed, #9333ea)"
                            : active
                            ? "#a855f7"
                            : "transparent",
                          borderRadius: 2,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
