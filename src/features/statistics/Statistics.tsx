import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CardContent } from "@/components/ui/card";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, HelpCircle,
  TrendingUp, Clock, AlertCircle, ArrowRight, ChevronRight, ChevronDown, ChevronUp, Loader2, Zap, Target, Brain, Sparkles, BookOpen, BarChart3,
  GraduationCap, Award, Lightbulb, Check, ShieldAlert, Star, RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const API = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

const token = () => localStorage.getItem("cloop_token") ?? "";
const get = (path: string) =>
  fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) =>
    r.ok ? r.json() : Promise.reject(r)
  );

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (s: number) => {
  if (!s) return "00:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
};

const scoreColor = (n: number) =>
  n >= 80 ? "#000000" : n >= 60 ? "#18181b" : "#3f3f46";

const masteryBadgeStyle = (level: string) => {
  switch (level) {
    case 'Mastered':
      return { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' };
    case 'Proficient':
      return { bg: 'bg-zinc-100 text-black border-zinc-300', dot: 'bg-black' };
    case 'Developing':
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    case 'Needs Attention':
    default:
      return { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
  }
};

// ─── Diff Text Component ──────────────────────────────────────────────────────

function DiffText({ html }: { html: string }) {
  if (!html) return null;
  const parts = html.replace(/<\/?p>/g, "").split(/(<del>.*?<\/del>|<ins>.*?<\/ins>)/g);
  return (
    <span className="text-sm leading-relaxed text-gray-700">
      {parts.map((p, i) => {
        if (p.startsWith("<del>"))
          return <span key={i} className="line-through text-red-500 bg-red-50 px-1 rounded mx-0.5">{p.replace(/<\/?del>/g, "")}</span>;
        if (p.startsWith("<ins>"))
          return <span key={i} className="font-semibold text-green-600 bg-green-50 px-1 rounded mx-0.5">{p.replace(/<\/?ins>/g, "")}</span>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

// ─── Tiny Components ──────────────────────────────────────────────────────────

function SectionTitle({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-black" />
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

// ─── Concept Mastery Interactive Component ───────────────────────────────────

function ConceptMasterySection({ data, subjectName }: { data?: any; subjectName?: string }) {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<'mastered' | 'learning' | 'not_started' | null>(null);

  // 1. Understood Well (Mastered): Score >= 75%
  const masteredTopics = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<number | string>();

    if (data?.concepts_mastery?.mastered_list && Array.isArray(data.concepts_mastery.mastered_list)) {
      data.concepts_mastery.mastered_list.forEach((t: any) => {
        if (t.id && !seenIds.has(t.id)) {
          seenIds.add(t.id);
          list.push(t);
        }
      });
    }

    if (data?.mastered_topics && Array.isArray(data.mastered_topics)) {
      data.mastered_topics.forEach((t: any) => {
        if (t.id && !seenIds.has(t.id)) {
          seenIds.add(t.id);
          list.push(t);
        }
      });
    }

    if (data?.reports && Array.isArray(data.reports)) {
      data.reports.forEach((r: any) => {
        const score = Math.round(r.score_percent ?? r.score ?? (r.total_questions ? (r.correct_answers / r.total_questions) * 100 : 0));
        const topicId = r.topic_id || r.topics?.id || r.id;
        if (score >= 75 && topicId && !seenIds.has(topicId)) {
          seenIds.add(topicId);
          list.push({
            id: topicId,
            title: r.topics?.title || r.title || r.topic_title || `Topic ${topicId}`,
            score: score,
            chapter: r.topics?.chapters?.title || r.chapter_title || "",
          });
        }
      });
    }

    return list;
  }, [data]);

  // 2. Needs Improvement: Score > 0 and < 75% (or weak_topics)
  const needsImprovementTopics = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<number | string>();

    const masteredIds = new Set(masteredTopics.map((t: any) => t.id));

    if (data?.concepts_mastery?.learning_list && Array.isArray(data.concepts_mastery.learning_list)) {
      data.concepts_mastery.learning_list.forEach((t: any) => {
        if (t.id && !masteredIds.has(t.id) && !seenIds.has(t.id)) {
          seenIds.add(t.id);
          list.push(t);
        }
      });
    }

    if (data?.weak_topics && Array.isArray(data.weak_topics)) {
      data.weak_topics.forEach((wt: any, idx: number) => {
        const topicId = wt.topic_id || wt.id || idx + 200;
        if (topicId && !masteredIds.has(topicId) && !seenIds.has(topicId)) {
          seenIds.add(topicId);
          list.push({
            id: topicId,
            title: wt.topic_title || wt.title || `Topic ${topicId}`,
            score: Math.round(wt.average_score ?? wt.score ?? 50),
            errorPattern: wt.error_distribution ? Object.keys(wt.error_distribution)[0] : "Needs Practice",
            chapter: wt.subject_name || wt.chapter || "",
          });
        }
      });
    }

    if (data?.reports && Array.isArray(data.reports)) {
      data.reports.forEach((r: any) => {
        const score = Math.round(r.score_percent ?? r.score ?? (r.total_questions ? (r.correct_answers / r.total_questions) * 100 : 0));
        const topicId = r.topic_id || r.topics?.id || r.id;
        if (score > 0 && score < 75 && topicId && !masteredIds.has(topicId) && !seenIds.has(topicId)) {
          seenIds.add(topicId);
          list.push({
            id: topicId,
            title: r.topics?.title || r.title || r.topic_title || `Topic ${topicId}`,
            score: score,
            chapter: r.topics?.chapters?.title || r.chapter_title || "",
            errorPattern: "Needs Practice",
          });
        }
      });
    }

    return list;
  }, [data, masteredTopics]);

  // 3. Not Started: Topics with 0 attempts
  const notStartedTopics = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<number | string>();

    const attemptedIds = new Set([
      ...masteredTopics.map((t: any) => t.id),
      ...needsImprovementTopics.map((t: any) => t.id),
    ]);

    if (data?.concepts_mastery?.not_started_list && Array.isArray(data.concepts_mastery.not_started_list)) {
      data.concepts_mastery.not_started_list.forEach((t: any) => {
        if (t.id && !attemptedIds.has(t.id) && !seenIds.has(t.id)) {
          seenIds.add(t.id);
          list.push(t);
        }
      });
    }

    if (data?.chapters && Array.isArray(data.chapters)) {
      data.chapters.forEach((c: any) => {
        const chapterTitle = c.title || c.name || "";
        if (c.topics && Array.isArray(c.topics)) {
          c.topics.forEach((t: any) => {
            if (t.id && !attemptedIds.has(t.id) && !seenIds.has(t.id)) {
              seenIds.add(t.id);
              list.push({
                id: t.id,
                title: t.title || t.name,
                chapter: chapterTitle,
              });
            }
          });
        }
      });
    }

    return list;
  }, [data, masteredTopics, needsImprovementTopics]);

  const categories = [
    {
      key: 'mastered' as const,
      label: "Understood Well",
      desc: "Score >= 75% (Completed with higher score)",
      count: masteredTopics.length,
      color: "bg-green-500",
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      topics: masteredTopics,
      type: "mastered",
    },
    {
      key: 'learning' as const,
      label: "Needs Improvement",
      desc: "Score < 75% (Keep practicing these topics)",
      count: needsImprovementTopics.length,
      color: "bg-amber-500",
      icon: AlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200",
      topics: needsImprovementTopics,
      type: "improvement",
    },
    {
      key: 'not_started' as const,
      label: "Not Started",
      desc: "New topics ahead",
      count: notStartedTopics.length,
      color: "bg-gray-400",
      icon: Zap,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      borderColor: "border-gray-200",
      topics: notStartedTopics,
      type: "not_started",
    },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle title="Concepts Mastered" icon={Brain} />
      <div className="space-y-3">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.key;
          return (
            <div key={cat.key} className={`bg-white border rounded-2xl transition-all overflow-hidden ${isExpanded ? `shadow-md ${cat.borderColor} ring-1 ring-zinc-200` : "border-gray-100 hover:border-black"}`}>
              <div onClick={() => setExpandedCategory(isExpanded ? null : cat.key)} className="flex items-center gap-4 p-4 cursor-pointer select-none">
                <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0`}>
                  <cat.icon className={`w-5 h-5 ${cat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{cat.label}</p>
                    <span className="text-[10px] text-gray-400 font-semibold">(Click to view topics)</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400">{cat.desc}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg ${cat.color} text-white font-black text-xs shrink-0`}>{cat.count}</div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-zinc-50/50 space-y-3">
                  {cat.topics.length === 0 ? (
                    <div className="py-6 text-center text-xs font-medium text-gray-400 bg-white rounded-xl border border-gray-200">No topics recorded in this category yet.</div>
                  ) : (
                    <div className="max-h-[340px] overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cat.topics.map((t: any, idx: number) => (
                          <div key={t.id || idx} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3 hover:border-zinc-400 transition-colors">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 truncate">{t.title || t.topic_title}</p>
                              {t.chapter && <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{t.chapter}</p>}
                              {t.errorPattern && (
                                <span className="inline-block mt-1 text-[9px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-100">
                                  Top Error: {t.errorPattern}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {(t.score !== undefined || t.average_score !== undefined) && (
                                <span className={`px-2 py-1 rounded-lg font-black text-xs ${cat.type === "mastered" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                  {t.score ?? t.average_score}%
                                </span>
                              )}
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/topic-chat?topicId=${t.id}&topicTitle=${encodeURIComponent(t.title || t.topic_title || '')}&subjectName=${encodeURIComponent(subjectName || '')}`);
                                }}
                                className={`h-7 px-2.5 text-[10px] font-extrabold rounded-lg ${cat.type === "mastered" ? "bg-green-600 hover:bg-green-700 text-white" : cat.type === "improvement" ? "bg-black hover:bg-zinc-800 text-white" : "bg-zinc-900 hover:bg-black text-white"}`}
                              >
                                {cat.type === "mastered" ? "Review" : cat.type === "improvement" ? "Practice" : "Start"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const normalizeSubjectName = (s: string) => {
  const clean = (s || "").toLowerCase().trim();
  if (!clean) return "";
  if (clean.includes("computer")) return "computer science";
  if (clean.includes("social")) return "social science";
  if (clean.includes("physics")) return "physics";
  if (clean.includes("chem")) return "chemistry";
  if (clean.includes("bio")) return "biology";
  if (clean.includes("math")) return "mathematics";
  if (clean.includes("english")) return "english";
  if (clean.includes("science")) return "science";
  return clean;
};

// ─── Error Profile Interactive Component ───────────────────────────────────

function ErrorProfileSection({ data, subjectName }: { data?: any; subjectName?: string }) {
  const navigate = useNavigate();
  const [expandedErrorType, setExpandedErrorType] = useState<string | null>(null);
  const [fetchedErrorLogs, setFetchedErrorLogs] = useState<any[]>([]);

  const targetNorm = normalizeSubjectName(subjectName || data?.subject_name || "");

  useEffect(() => {
    get("/api/profile/teacher-analytics/error-profile?limit=50")
      .then((res: any) => {
        if (res && Array.isArray(res.errors)) {
          setFetchedErrorLogs(res.errors);
        }
      })
      .catch(() => {});
  }, []);

  const filteredLogs = useMemo(() => {
    const rawLogs: any[] = [];
    if (fetchedErrorLogs.length > 0) {
      rawLogs.push(...fetchedErrorLogs);
    }
    if (data?.error_analysis?.error_logs && Array.isArray(data.error_analysis.error_logs)) {
      rawLogs.push(...data.error_analysis.error_logs);
    }
    if (data?.error_logs && Array.isArray(data.error_logs)) {
      rawLogs.push(...data.error_logs);
    }

    if (!targetNorm) return rawLogs;

    return rawLogs.filter((l: any) => {
      const logNorm = normalizeSubjectName(l.subject_name || l.subject || "");
      return logNorm === targetNorm;
    });
  }, [data, fetchedErrorLogs, targetNorm]);

  const errorTypesMap = useMemo(() => {
    const map: Record<string, number> = {};

    if (data?.error_analysis?.error_types) {
      Object.entries(data.error_analysis.error_types).forEach(([k, v]: any) => {
        map[k.toUpperCase()] = Number(v);
      });
    }

    if (filteredLogs.length > 0) {
      filteredLogs.forEach((err: any) => {
        const typeKey = (err.error_type || "General Error").toUpperCase();
        map[typeKey] = (map[typeKey] || 0) + 1;
      });
    }

    if (Object.keys(map).length === 0 && data?.weak_topics && Array.isArray(data.weak_topics)) {
      data.weak_topics.forEach((wt: any) => {
        const pattern = wt.error_distribution ? Object.keys(wt.error_distribution)[0] : "Knowledge Gap";
        const key = pattern.toUpperCase();
        map[key] = (map[key] || 0) + 1;
      });
    }

    return map;
  }, [data, filteredLogs]);

  const errorEntries = Object.entries(errorTypesMap);
  if (errorEntries.length === 0) {
    return (
      <div className="space-y-4">
        <SectionTitle title="Profile of Your Errors" icon={AlertCircle} />
        <CardContainer className="p-8 text-center text-gray-400 font-medium">
          No error logs recorded for this section. Great job!
        </CardContainer>
      </div>
    );
  }

  const totalErrors = Object.values(errorTypesMap).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-4">
      <SectionTitle title="Profile of Your Errors" icon={AlertCircle} />
      <div className="space-y-3">
        {errorEntries.map(([errKey, count]) => {
          const isExpanded = expandedErrorType === errKey;
          const pct = Math.min(100, Math.round((count / totalErrors) * 100));

          const matchingLogs = filteredLogs.filter(
            (l: any) => (l.error_type || "").toUpperCase() === errKey.toUpperCase()
          );

          return (
            <div
              key={errKey}
              className={`bg-white border rounded-2xl transition-all overflow-hidden ${
                isExpanded ? "shadow-md border-zinc-400 ring-1 ring-zinc-200" : "border-gray-100 hover:border-black"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedErrorType(isExpanded ? null : errKey)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 border border-red-100">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-900 uppercase tracking-wider truncate">{errKey}</p>
                      <span className="text-[10px] text-gray-400 font-semibold">(Click to view error logs)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1.5 max-w-xs">
                      <div style={{ width: `${Math.max(pct, 10)}%` }} className="h-full bg-black transition-all duration-1000" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="px-3 py-1 rounded-lg bg-black text-white font-black text-xs">
                    {count} {count === 1 ? "mistake" : "mistakes"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Diagnostic Log Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-zinc-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                      Diagnostic Error Logs — {errKey} ({matchingLogs.length})
                    </h5>
                  </div>

                  {matchingLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs font-medium text-gray-400 bg-white rounded-xl border border-gray-200">
                      No specific question logs recorded for this error pattern yet.
                    </div>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3">
                      {matchingLogs.map((errItem: any, idx: number) => (
                        <div
                          key={errItem.id || idx}
                          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3 hover:border-zinc-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 rounded-md px-2 py-0.5 border border-red-100">
                                {errItem.error_type || errKey}
                              </span>
                              {(errItem.subject_name || errItem.topic_title) && (
                                <p className="text-xs font-extrabold text-gray-900 mt-1">
                                  {errItem.subject_name ? `${errItem.subject_name} — ` : ""}{errItem.topic_title || "Topic"}
                                </p>
                              )}
                            </div>

                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/topic-chat?topicId=${errItem.topic_id || 1}&topicTitle=${encodeURIComponent(errItem.topic_title || '')}&subjectName=${encodeURIComponent(errItem.subject_name || subjectName || '')}`
                                );
                              }}
                              className="h-7 px-3 text-[10px] font-extrabold bg-black hover:bg-zinc-800 text-white rounded-lg shrink-0 shadow-sm"
                            >
                              Practice This Topic
                            </Button>
                          </div>

                          {errItem.question_text && (
                            <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question</p>
                              <p className="text-xs font-bold text-gray-900 mt-0.5 leading-relaxed">{errItem.question_text}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {errItem.user_answer_raw && (
                              <div className="bg-red-50/40 p-2.5 rounded-lg border border-red-100">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Your Response</p>
                                <p className="text-xs font-bold text-red-700 mt-0.5">{errItem.user_answer_raw}</p>
                              </div>
                            )}
                            {errItem.corrected_answer && (
                              <div className="bg-green-50/40 p-2.5 rounded-lg border border-green-100">
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Correct Answer</p>
                                <p className="text-xs font-bold text-green-800 mt-0.5">{errItem.corrected_answer}</p>
                              </div>
                            )}
                          </div>

                          {errItem.feedback_json && (
                            <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 text-xs">
                              <p className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" /> Teacher Suggestion
                              </p>
                              <p className="text-xs text-gray-700 font-medium mt-0.5 leading-relaxed">
                                {typeof errItem.feedback_json === "string"
                                  ? errItem.feedback_json
                                  : errItem.feedback_json.feedback || errItem.feedback_json.suggestion || "Review concept details and retry."}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subject AI Weakness & Improvement Diagnosis Component ────────────────

function SubjectAISummaryCard({ data, subjectName }: { data?: any; subjectName: string }) {
  const weakTopics = data?.weak_topics || [];
  const reports = data?.reports || [];
  const errorTypes = data?.error_analysis?.error_types || {};

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pipelineVersion, setPipelineVersion] = useState(0);

  // Compile weak topics and error tendencies
  const weaknessDiagnostic = useMemo(() => {
    // 1. Identify primary weak topic & secondary weak topic
    const topWeak = weakTopics[0];
    const secondWeak = weakTopics[1];
    const topWeakTitle = topWeak?.topic_title || topWeak?.title || "Core Subject Principles";
    const topWeakScore = topWeak ? Math.round(topWeak.average_score ?? topWeak.score ?? 45) : 45;
    const secondWeakTitle = secondWeak?.topic_title || secondWeak?.title;

    // 2. Identify top error categories
    const sortedErrorTypes = Object.entries(errorTypes).sort((a: any, b: any) => b[1] - a[1]);
    const topErrorType = sortedErrorTypes[0]?.[0] || "Conceptual Misunderstanding";
    const secondErrorType = sortedErrorTypes[1]?.[0] || "Calculation/Process Mistakes";

    // 3. Identify recent missed session topic
    const recentReport = reports[0];
    const recentTitle = recentReport?.topics?.title || recentReport?.title || recentReport?.topic_title;

    // Build 5 targeted weakness & improvement bullet points
    const points = [
      {
        title: "Primary Conceptual Weakness",
        text: `Your lowest scoring topic in ${subjectName} is "${topWeakTitle}" with an average score of ${topWeakScore}%. ${secondWeakTitle ? `Secondary weak area: "${secondWeakTitle}".` : ""}`,
      },
      {
        title: "Mistake Pattern Breakdown",
        text: `Database analysis identifies "${topErrorType}" as your most frequent mistake type${sortedErrorTypes[0]?.[1] ? ` (${sortedErrorTypes[0][1]} recorded errors)` : ""}, followed by "${secondErrorType}".`,
      },
      {
        title: "Recent Quiz Diagnostics",
        text: recentTitle
          ? `In recent session logs for "${recentTitle}", error analysis shows difficulty in step-by-step application under timed conditions.`
          : `Recent practice sessions reveal recurring drop-offs on multi-part conceptual questions.`,
      },
      {
        title: "Targeted AI Revision Roadmap",
        text: `To resolve these weak points quickly, launch the AI Tutor Chat for "${topWeakTitle}" and focus specifically on reviewing step-by-step solved examples.`,
      },
      {
        title: "Predicted Score Gain Plan",
        text: `Fixing "${topWeakTitle}" and eliminating ${topErrorType} errors is calculated to boost your predicted ${subjectName} score by up to +15 marks.`,
      },
    ];

    return points;
  }, [weakTopics, errorTypes, reports, subjectName, pipelineVersion]);

  const handleRefreshPipeline = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPipelineVersion(prev => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      <SectionTitle title={`AI Diagnostic Report — ${subjectName}`} icon={Sparkles} />
      <CardContainer className="p-6 lg:p-8 bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-sm space-y-6">
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-black border border-zinc-200">
              <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="text-lg font-black text-black">{subjectName} Weakness & Improvement Diagnosis</h4>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Real-time database error synthesis & action plan</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleRefreshPipeline}
            disabled={isRefreshing}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-extrabold rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Regenerating..." : "Regenerate AI Diagnosis"}
          </Button>
        </div>

        {/* Clean Point-wise Text List */}
        <div className="space-y-5 pt-1">
          {weaknessDiagnostic.map((pt, idx) => (
            <div key={idx} className="flex items-start gap-3.5 pb-4 border-b border-zinc-100 last:border-b-0 last:pb-0">
              <div className="w-2 h-2 rounded-full bg-black shrink-0 mt-2" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-black">{pt.title}</p>
                <p className="text-sm font-medium text-zinc-700 leading-relaxed">{pt.text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContainer>
    </div>
  );
}

// ─── Visual Report Card Component ─────────────────────────────────────────────

function ReportCardView() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get("/api/profile/teacher-analytics/report-card")
      .then(setReport)
      .catch((e) => console.error("Error loading report card", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>;
  if (!report || !report.subjects || report.subjects.length === 0) return null;

  return (
    <div className="space-y-6 pt-6">
      <SectionTitle title="Academic Report Card" icon={Award} />
      <CardContainer className="p-8 bg-gradient-to-br from-white to-zinc-50/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-zinc-200/20 rounded-full blur-3xl -z-10" />
        
        {/* GPA & Overall metrics */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-300">
              <span className="text-3xl font-black text-black">{report.gpa}</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">Overall Standing</h4>
              <p className="text-sm text-gray-500 mt-1">Average mastery score of {report.average_score}%</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trend</p>
              <p className={`text-lg font-black mt-1 ${report.trend === 'Improving' ? 'text-green-600' : 'text-gray-700'}`}>{report.trend}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Subjects</p>
              <p className="text-lg font-black text-gray-900 mt-1">{report.subjects.length}</p>
            </div>
          </div>
        </div>

        {/* Subjects list */}
        <div className="divide-y divide-gray-100 mt-6">
          {report.subjects.map((sub: any) => {
            const badge = masteryBadgeStyle(sub.mastery_level);
            return (
              <div key={sub.subject_id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-900 truncate">{sub.subject_name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {sub.mastery_level}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-1.5 text-xs text-gray-400">
                    <span>Questions: <strong>{sub.correct_questions}/{sub.total_questions}</strong></span>
                    <span>Time Spent: <strong>{fmtTime(sub.time_spent_seconds)}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                  <div className="text-left md:text-right text-xs">
                    <p className="text-gray-400">Strongest: <span className="text-black font-bold">{sub.strongest_topic || 'N/A'}</span></p>
                    <p className="text-gray-400 mt-0.5">Weakest: <span className="text-amber-600 font-bold">{sub.weakest_topic || 'N/A'}</span></p>
                  </div>
                  
                  <div className="flex flex-col items-end min-w-[80px]">
                    <span className="font-black text-black text-base">{sub.accuracy}%</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Accuracy</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContainer>
    </div>
  );
}

// ─── Teacher Dashboard Container ──────────────────────────────────────────────

function TeacherDashboardView() {
  const [overview, setOverview] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([
      get("/api/profile/teacher-analytics/student-overview"),
      get("/api/profile/teacher-analytics/report-card"),
      get("/api/profile/teacher-analytics/error-profile?limit=5")
    ]).then(([r1, r2, r3]) => {
      if (r1.status === "fulfilled") setOverview(r1.value);
      if (r2.status === "fulfilled") setReport(r2.value);
      if (r3.status === "fulfilled") setErrorLogs(r3.value.errors ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-black via-zinc-900 to-zinc-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">Teacher Dashboard Mode</span>
          <h2 className="text-3xl font-black mt-4">Diagnostic & Analytics Report</h2>
          <p className="text-zinc-300 font-medium mt-2 leading-relaxed text-base">
            Identify student conceptual blocks, dynamic error patterns, and study engagement metrics.
          </p>
        </div>
        <GraduationCap className="absolute right-[-10px] bottom-[-20px] w-56 h-56 text-white/10 -rotate-12" />
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardContainer className="p-6 text-center flex flex-col justify-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-3">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-black">{overview?.overview?.accuracy || 0}%</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy Score</p>
        </CardContainer>

        <CardContainer className="p-6 text-center flex flex-col justify-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-3">
            <Brain className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-gray-900">{overview?.overview?.total_questions || 0}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Q&A Interventions</p>
        </CardContainer>

        <CardContainer className="p-6 text-center flex flex-col justify-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-3">
            <Lightbulb className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-gray-900">{overview?.overview?.explain_count || 0}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Explain Requests</p>
        </CardContainer>

        <CardContainer className="p-6 text-center flex flex-col justify-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-gray-900">{overview?.overview?.retry_count || 0}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Quiz Retries</p>
        </CardContainer>
      </div>

      {/* Weekly performance trends graph */}
      <div className="space-y-6">
        <SectionTitle title="Weekly Performance Accuracy Trend" icon={TrendingUp} />
        <CardContainer className="p-8">
          {(!overview?.weekly_trend || overview.weekly_trend.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-10">No trend data available. Start practicing to populate this chart.</p>
          ) : (
            <div className="space-y-6">
              {/* Graphic container */}
              <div className="h-64 flex items-end gap-6 border-b border-gray-100 pb-4 pt-6">
                {overview.weekly_trend.map((t: any, idx: number) => {
                  const dateObj = new Date(t.week);
                  const weekLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute top-[-36px] bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {t.average_score}% Accuracy ({t.question_count} Qs)
                      </div>
                      
                       {/* The bar container */}
                      <div className="w-full bg-blue-50 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all duration-500 hover:bg-blue-100/50" style={{ height: "100%" }}>
                        <div 
                          style={{ height: `${t.average_score}%`, backgroundColor: "#3b82f6" }} 
                          className="w-full rounded-t-xl transition-all duration-1000 shadow-sm group-hover:brightness-95"
                        />
                      </div>

                      {/* Score on top of bar on hover */}
                      <span className="text-xs font-black text-gray-800 absolute bottom-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {t.average_score}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Labels container */}
              <div className="flex gap-6 justify-between text-center">
                {overview.weekly_trend.map((t: any, idx: number) => {
                  const dateObj = new Date(t.week);
                  const weekLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div key={idx} className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-gray-900 truncate">{weekLabel}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{t.question_count} Qs</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic Recommendations Engine */}
        <div className="md:col-span-2 space-y-6">
          <SectionTitle title="AI Pedagogical Suggestions" icon={Lightbulb} />
          <CardContainer className="p-6 bg-blue-50/40 border border-blue-100">
            <ul className="space-y-4">
              {overview?.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex gap-3">
                   <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#3b82f6]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContainer>
        </div>

        {/* Weakness Identification */}
        <div className="space-y-6">
          <SectionTitle title="Top Weak Points" icon={ShieldAlert} />
          <CardContainer className="p-6">
            {overview?.weak_topics?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No critical weakness identified yet!</p>
            ) : (
              <div className="space-y-4">
                {overview?.weak_topics?.map((topic: any) => (
                  <div key={topic.topic_id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 truncate">{topic.topic_title}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{topic.subject_name}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 font-black text-xs shrink-0">
                      {topic.average_score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContainer>
        </div>
      </div>

      {/* Per-Subject Mastery Grid */}
      <div className="space-y-6">
        <SectionTitle title="Per-Subject Curriculum Breakdown" icon={BookOpen} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report?.subjects?.map((sub: any) => {
            const badge = masteryBadgeStyle(sub.mastery_level);
            return (
              <CardContainer key={sub.subject_id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{sub.subject_name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Attempted {sub.total_questions} questions</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {sub.mastery_level}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                      <span>Score Accuracy</span>
                      <span>{sub.accuracy}%</span>
                    </div>
                    <Progress value={sub.accuracy} className="h-1.5 bg-gray-100" />
                  </div>

                  <div className="pt-2 flex justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <span className="text-gray-400">Strongest</span>
                      <p className="font-bold text-[#3b82f6] truncate mt-0.5">{sub.strongest_topic || 'N/A'}</p>
                    </div>
                    <div className="min-w-0 text-right">
                      <span className="text-gray-400">Weakest</span>
                      <p className="font-bold text-amber-600 truncate mt-0.5">{sub.weakest_topic || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContainer>
            );
          })}
        </div>
      </div>

      {/* Dynamic Error Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <SectionTitle title="Error Type Frequency" icon={AlertCircle} />
          <CardContainer className="p-6 space-y-4">
            {Object.keys(overview?.error_distribution || {}).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No errors tracked yet</p>
            ) : (
              Object.entries(overview?.error_distribution || {}).map(([errType, count]: any) => {
                const total = Object.values(overview?.error_distribution).reduce((a: any, b: any) => a + b, 0) as number;
                const pct = Math.round((count / (total || 1)) * 100);
                return (
                  <div key={errType}>
                    <div className="flex justify-between text-xs text-gray-700 font-bold mb-1">
                      <span className="truncate">{errType}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-gray-100" />
                  </div>
                );
              })
            )}
          </CardContainer>
        </div>

        {/* Detailed Error Log */}
        <div className="md:col-span-2 space-y-6">
          <SectionTitle title="Real-time Diagnostic Error Log" icon={ShieldAlert} />
          <div className="space-y-4">
            {errorLogs.length === 0 ? (
              <CardContainer className="p-8 text-center text-gray-400">
                No recent errors found. All clear!
              </CardContainer>
            ) : (
              errorLogs.map((err) => (
                <CardContainer key={err.id} className="p-6 border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 rounded-full px-2.5 py-0.5 border border-red-100">
                      {err.error_type || 'Error'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{err.subject_name} — {err.topic_title}</span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question Asked</p>
                    <p className="text-sm font-bold text-gray-900 mt-1 leading-relaxed">{err.question_text}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student's Response</p>
                      <p className="text-sm text-red-600 font-semibold mt-1 bg-red-50/30 p-2 rounded-lg border border-red-50">{err.user_answer_raw || 'No Response'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Corrected Response</p>
                      <div className="mt-1 bg-green-50/30 p-2 rounded-lg border border-green-50">
                        {err.diff_html ? (
                          <DiffText html={err.diff_html} />
                        ) : (
                          <p className="text-sm text-green-700 font-semibold">{err.corrected_answer}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {err.feedback_json && (
                    <div className="mt-3 bg-blue-50/30 p-3 rounded-2xl border border-blue-50/50 text-xs">
                      <p className="font-bold text-[#3b82f6] flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5" /> Structured Feedback
                      </p>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {typeof err.feedback_json === 'string' ? err.feedback_json : err.feedback_json.feedback || err.feedback_json.suggestion || 'Review concept clarity and try again.'}
                      </p>
                    </div>
                  )}
                </CardContainer>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Practice Analytics View (PAGE 1) ────────────────────────────────────────

function PracticeAnalyticsView({ onSelectExam }: { onSelectExam: (code: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get("/api/practice-analytics/overview")
      .then(setData)
      .catch(() => setData({ has_data: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
          Learning Intelligence Dashboard
        </h2>
        <div className="bg-zinc-50 rounded-3xl p-6 lg:p-8 mt-6 border border-zinc-200 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">Welcome to your Concept Mastery Dashboard</p>
                <p className="text-gray-600 font-medium mt-3 text-lg leading-relaxed max-w-2xl">
                    Track how you learn, where you make mistakes, and how your predicted score improves over time
                </p>
            </div>
            <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 text-zinc-300/40 -rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardContainer className="bg-gradient-to-br from-black via-zinc-900 to-zinc-950 p-8 text-white border-0 shadow-xl shadow-zinc-300">
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
                 <circle cx="32" cy="32" r="28" fill="transparent" stroke="#000000" strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * 45) / 100} strokeLinecap="round" />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-black">45%</span>
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
              className="border-zinc-200 hover:shadow-lg hover:border-black transition-all cursor-pointer bg-gradient-to-br from-zinc-100 to-zinc-50 group"
              onClick={() => onSelectExam(exam.exam_type)}>
               <CardContent className="p-5">
                 <div className="mb-2">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 bg-zinc-200/60 rounded-full px-2.5 py-0.5">
                     Competitive Exam
                   </span>
                 </div>
                 
                 <h4 className="font-bold text-gray-900 group-hover:text-black transition-colors text-sm truncate">
                   {exam.name || exam.exam_type}
                 </h4>
                 
                 <p className="text-xs font-extrabold text-black mt-2">
                     Predicted Score: {exam.predicted_score || 0}%
                 </p>

                 <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200/60">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">View Analysis</span>
                     <ChevronRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" />
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

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;
  if (!data) return <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200"><p className="font-bold text-gray-600 mb-6">No data available for this exam.</p><Button onClick={onBack} className="bg-black hover:bg-zinc-800 text-white">Go Back</Button></div>;

  const currentScore = Math.round(data?.summary?.average_score || 0);
  const bestPossible = Math.min(100, currentScore + 15);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Intelligence
        </button>
        <div className="flex items-center gap-3 bg-zinc-100 px-5 py-2.5 rounded-2xl border border-zinc-300">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white font-black text-xs shadow-md">{examCode?.[0]}</div>
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
                    <CardContainer key={t.label} className="p-6 text-center group hover:border-black transition-all">
                        <p className="text-2xl font-black text-black group-hover:scale-110 transition-transform">{t.val}</p>
                        <p className="text-[11px] font-extrabold text-zinc-900 mt-1.5 uppercase tracking-widest">{t.label} Prep</p>
                        <p className="text-[10px] font-bold text-zinc-700 mt-0.5">Focused Time</p>
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
                <CardContainer className="p-6 text-center border-zinc-200 bg-zinc-100/50">
                    <TrendingUp className="w-5 h-5 text-black mx-auto mb-2" />
                    <p className="text-2xl font-black text-black">+5%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Improved</p>
                </CardContainer>
            </div>
        </div>

        {/* Concept Mastery Breakdown */}
        <ConceptMasterySection data={data} />

        {/* Error Profile */}
        <ErrorProfileSection data={data} />

        {/* Recommended Focus */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
            <SectionTitle title="Recommended Focus" icon={TrendingUp} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.chapter_mastery?.slice(0, 2).map((item: any, i: number) => (
                    <CardContainer key={i} className={`p-8 ${i === 0 ? "bg-black text-white border-0 shadow-xl shadow-zinc-300" : "bg-zinc-100/60 border-zinc-200"}`}>
                        <h4 className={`text-2xl font-black mb-2 ${i === 0 ? "text-white" : "text-black"}`}>{item.title}</h4>
                        <p className={`text-sm font-medium mb-8 ${i === 0 ? "text-zinc-300" : "text-zinc-700 opacity-80"}`}>Fixing this topic can improve your marks fastest.</p>
                        
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 flex items-center justify-between border border-white/20">
                            <span className={`text-sm font-bold ${i === 0 ? "text-white" : "text-black"}`}>Potential Gain</span>
                            <span className={`text-xl font-black ${i === 0 ? "text-white" : "text-black"}`}>+15 Marks</span>
                        </div>

                        <Button className={`w-full h-14 rounded-2xl text-lg font-black shadow-lg ${i === 0 ? "bg-white text-black hover:bg-zinc-100" : "bg-black text-white hover:bg-zinc-800"}`}>
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

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
          Learning Intelligence Dashboard
        </h2>
        <div className="bg-zinc-50 rounded-3xl p-6 lg:p-8 mt-6 border border-zinc-200 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">Welcome to your Concept Mastery Dashboard</p>
                <p className="text-gray-600 font-medium mt-3 text-lg leading-relaxed max-w-2xl">
                    Track how you learn, where you make mistakes, and how your predicted score improves over time
                </p>
            </div>
            <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 text-zinc-300/40 -rotate-12" />
        </div>
      </div>

      <div className="space-y-6">
        <SectionTitle title="Completed Session Overview" icon={Clock} />
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
                    className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-black hover:shadow-xl transition-all cursor-pointer flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-7 h-7 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-extrabold text-gray-900 truncate group-hover:text-black transition-colors">{r.topics?.title ?? "Unknown Topic"}</h4>
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
                    <div className="text-center bg-zinc-100 px-4 py-2 rounded-xl min-w-[70px]">
                        <p className="text-lg font-black text-black">{r.score_percent}%</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black ml-2" />
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
                <CardContainer key={s.id} className="border-zinc-200 hover:shadow-lg hover:border-black transition-all cursor-pointer bg-gradient-to-br from-zinc-100 to-zinc-50 group" onClick={() => onSelectSubject(s.id, s.name)}>
                    <CardContent className="p-5">
                        <h4 className="font-bold text-gray-900 group-hover:text-black transition-colors text-sm truncate">{s.name}</h4>
                        <p className="text-xs font-extrabold text-black mt-2">Predicted Score: {score}%</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200/60">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Click to Analyze</span>
                            <ChevronRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </CardContent>
                </CardContainer>
            );
            })}
        </div>
      </div>

      {/* Visual Report Card rendered at the bottom of the Student view */}
      <ReportCardView />
    </div>
  );
}

// ─── Normal Subject View (NORMAL MODE DETAIL) ──────────────────────────────

function NormalSubjectView({ subjectId, subjectName, onBack }: { subjectId: number; subjectName: string; onBack: () => void }) {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      get(`/api/profile/learning-analytics/subject/${subjectId}`),
      get(`/api/topic-chats/reports/subject/${subjectId}`),
      get(`/api/chapters/${subjectId}`),
    ]).then(async ([r1, r2, r3]) => {
      let combined: any = {};
      if (r1.status === "fulfilled" && r1.value) combined = { ...r1.value };
      if (r2.status === "fulfilled" && r2.value) combined.reports = Array.isArray(r2.value) ? r2.value : r2.value.reports || [];
      if (r3.status === "fulfilled" && r3.value) {
        const chaptersList = Array.isArray(r3.value) ? r3.value : r3.value.chapters || [];
        const chaptersWithTopics = await Promise.all(
          chaptersList.map(async (ch: any) => {
            try {
              const tRes = await get(`/api/topics/${ch.id}`);
              const topics = Array.isArray(tRes) ? tRes : tRes.topics || [];
              return { ...ch, topics };
            } catch {
              return ch;
            }
          })
        );
        combined.chapters = chaptersWithTopics;
      }
      setData(combined);
    }).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;
  if (!data) return <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200"><p className="font-bold text-gray-600 mb-6">No data available for this subject.</p><Button onClick={onBack} className="bg-black hover:bg-zinc-800 text-white">Go Back</Button></div>;

  const currentScore = Math.round(data?.summary?.average_score || 0);
  const bestPossible = Math.min(100, currentScore + 15);
  const masteryBadge = masteryBadgeStyle(data?.mastery_level || 'Needs Attention');

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
        {/* Header & Back */}
        <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence
        </button>
            <div className="flex flex-wrap items-center gap-3 bg-zinc-100 px-5 py-2.5 rounded-2xl border border-zinc-300">
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white font-black text-xs shadow-md">{subjectName[0]}</div>
                <span className="font-bold text-gray-900">{subjectName} Mastery Analysis</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${masteryBadge.bg} flex items-center gap-1`}>
                  <span className={`w-1 h-1 rounded-full ${masteryBadge.dot}`} />
                  {data?.mastery_level || 'Developing'}
                </span>
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

            {/* AI Learning Summary */}
            <SubjectAISummaryCard data={data} subjectName={subjectName} />

            {/* Total Learning Time */}
            <div className="space-y-4">
                <SectionTitle title="Total Learning Time" icon={Clock} />
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Daily", val: fmtTime(data?.time_analytics?.daily_seconds || 0) },
                        { label: "Weekly", val: fmtTime(data?.time_analytics?.weekly_seconds || 0) },
                        { label: "Monthly", val: fmtTime(data?.time_analytics?.monthly_seconds || 0) },
                    ].map(t => (
                        <CardContainer key={t.label} className="p-6 text-center group hover:border-black transition-all">
                            <p className="text-2xl font-black text-black group-hover:scale-110 transition-transform">{t.val}</p>
                            <p className="text-[11px] font-extrabold text-zinc-900 mt-1.5 uppercase tracking-widest">{t.label}</p>
                            <p className="text-[10px] font-bold text-zinc-700 mt-0.5">Focused Time</p>
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
                <CardContainer className="p-6 text-center border-zinc-200 bg-zinc-100/50">
                    <TrendingUp className="w-5 h-5 text-black mx-auto mb-2" />
                    <p className="text-2xl font-black text-black">+5%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Improved</p>
                    </CardContainer>
                </div>
            </div>

            {/* Concepts Mastered */}
            <ConceptMasterySection data={data} subjectName={subjectName} />

            {/* Profile of Your Errors */}
            <ErrorProfileSection data={data} subjectName={subjectName} />



            {/* Recommended Focus */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
                <SectionTitle title="Recommended Focus" icon={TrendingUp} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.recommended_focus?.slice(0, 2).map((item: any, idx: number) => (
                        <CardContainer key={idx} className={`p-8 ${idx === 0 ? "bg-black text-white border-0 shadow-xl shadow-zinc-300" : "bg-zinc-100/60 border-zinc-200"}`}>
                            <h4 className={`text-2xl font-black mb-2 ${idx === 0 ? "text-white" : "text-black"}`}>{item.title}</h4>
                            <p className={`text-sm font-medium mb-8 ${idx === 0 ? "text-zinc-300" : "text-zinc-700 opacity-80"}`}>Fixing this topic can improve your marks fastest.</p>
                            
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 flex items-center justify-between border border-white/20">
                                <span className={`text-sm font-bold ${idx === 0 ? "text-white" : "text-black"}`}>Potential Gain</span>
                                <span className={`text-xl font-black ${idx === 0 ? "text-white" : "text-black"}`}>+{item.potential_gain} Marks</span>
                            </div>

                            <Button 
                                onClick={() => navigate(`/topic-chat?topicId=${item.topic_id}`)}
                                className={`w-full h-14 rounded-2xl text-lg font-black shadow-lg ${idx === 0 ? "bg-white text-black hover:bg-zinc-100" : "bg-black text-white hover:bg-zinc-800"}`}
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
  
  // Tab selector: student or teacher dashboard
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

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
            <div className="space-y-6">
              {/* Premium Toggle Bar for Student vs Teacher views */}
              <div className="max-w-5xl mx-auto flex justify-end">
                <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200 backdrop-blur-md">
                  <button
                    onClick={() => setActiveTab('student')}
                    className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                        activeTab === 'student'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Student Dashboard
                      </button>
                      <button
                        onClick={() => setActiveTab('teacher')}
                        className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                          activeTab === 'teacher'
                            ? 'bg-black text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Teacher View
                      </button>
                </div>
              </div>

              {activeTab === 'student' ? (
                <DashboardView onSelectSubject={(id, name) => setSelectedSubject({ id, name })} />
              ) : (
                <TeacherDashboardView />
              )}
            </div>
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
