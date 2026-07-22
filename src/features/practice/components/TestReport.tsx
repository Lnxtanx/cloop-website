import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Target,
  MessageSquare,
  Send,
  Loader2,
  Activity,
  Sparkles
} from "lucide-react";
import { PracticeQuestion } from "@/lib/api/practice";
import { toast } from "sonner";

function SectionTitle({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      {Icon && (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />
        </div>
      )}
      <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">{title}</h3>
    </div>
  );
}

interface ReportProps {
  reportId: number;
  examType: string;
  subject: string;
  report: {
    score: number;
    total_questions: number;
    time_taken_sec: number;
    questions: PracticeQuestion[];
  };
  onRetake: () => void;
  onViewHistory: () => void;
  formatTime: (sec: number) => string;
}

export const TestReport = ({
  reportId,
  examType,
  subject,
  report,
  onRetake,
  onViewHistory,
  formatTime
}: ReportProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Auto-expand and scroll if returning from Chat
  useEffect(() => {
    const qIndex = searchParams.get("fromQ");
    if (qIndex !== null && report.questions.length > 0) {
      const idx = parseInt(qIndex);
      const question = report.questions[idx];
      if (question) {
        setExpandedQuestionId(question.id);
        setTimeout(() => {
          questionRefs.current[question.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [searchParams, report.questions]);

  const accuracy = Math.round((report.score / report.total_questions) * 100);
  const correctCount = report.score;
  const incorrectCount = report.questions.filter(q => q.user_answer && !q.is_correct).length;
  const skippedCount = report.questions.filter(q => !q.user_answer).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 animate-fade-in pb-16 sm:pb-20 px-2 sm:px-4">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="md:col-span-2 border-none bg-gradient-to-br from-[#3b82f6] to-blue-800 text-white shadow-2xl shadow-blue-200 overflow-hidden relative rounded-2xl sm:rounded-[32px]">
          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10">
            <Trophy className="w-24 h-24 sm:w-40 sm:h-40" />
          </div>
          <CardContent className="p-6 sm:p-10 relative z-10">
            <div className="flex flex-col h-full justify-between gap-4 sm:gap-6">
              <div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-blue-200 mb-1 sm:mb-2">Performance Summary</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">{examType}: {subject}</h2>
              </div>
              <div className="flex items-end gap-6 sm:gap-10">
                <div>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">{accuracy}%</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-wide sm:tracking-widest mt-1">Accuracy</p>
                </div>
                <div className="h-10 sm:h-14 w-px bg-white/20 mb-1" />
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">{formatTime(report.time_taken_sec)}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-wide sm:tracking-widest mt-1">Total Time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xl shadow-blue-100/30 bg-white rounded-2xl sm:rounded-[32px]">
          <CardContent className="p-5 sm:p-8 h-full flex flex-col justify-center">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-8">Score Matrix</p>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-gray-500 flex items-center gap-2 sm:gap-3"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> Correct</span>
                <span className="text-base sm:text-lg font-black text-green-600 bg-green-50 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl">{correctCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-gray-500 flex items-center gap-2 sm:gap-3"><XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" /> Incorrect</span>
                <span className="text-base sm:text-lg font-black text-red-600 bg-red-50 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl">{incorrectCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-gray-500 flex items-center gap-2 sm:gap-3"><Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" /> Skipped</span>
                <span className="text-base sm:text-lg font-black text-gray-700 bg-gray-50 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl">{skippedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Potential Bar */}
      <div className="space-y-3 sm:space-y-4">
          <SectionTitle title="Session Proficiency" icon={Activity} />
          <Card className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border-gray-100 shadow-lg">
                <div className="h-3 sm:h-4 w-full bg-gray-100 rounded-full overflow-hidden flex relative shadow-inner">
                    <div style={{ width: `${accuracy}%` }} className="bg-green-500 h-full transition-all duration-1000" />
                    <div style={{ width: `${100 - accuracy}%` }} className="bg-red-400 h-full opacity-60 transition-all duration-1000" />
                </div>
                <div className="flex justify-between mt-3 sm:mt-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wide sm:tracking-widest">Accuracy</span>
                        <span className="text-lg sm:text-xl font-black text-green-600">{accuracy}%</span>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wide sm:tracking-widest">Errors</span>
                        <span className="text-lg sm:text-xl font-black text-red-400">{100 - accuracy}%</span>
                    </div>
                </div>
          </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button className="bg-[#3b82f6] hover:bg-[#2563eb] font-black px-6 sm:px-8 h-10 sm:h-12 rounded-xl sm:rounded-2xl gap-2 sm:gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95 text-sm sm:text-base" onClick={onRetake}>
          <RotateCcw className="w-4 h-4" /> Retake Practice
        </Button>
        <Button variant="outline" className="font-black px-6 sm:px-8 h-10 sm:h-12 border-blue-100 text-[#3b82f6] hover:bg-blue-50 rounded-xl sm:rounded-2xl transition-all shadow-sm text-sm sm:text-base" onClick={onViewHistory}>
          Full History
        </Button>
      </div>

      {/* Question Analysis */}
      <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">Analysis of Answers</h3>
        </div>

        <div className="space-y-4 sm:space-y-6">
            {report.questions.map((q, i) => (
            <div key={i} ref={el => questionRefs.current[q.id] = el}>
                <Card className="border-gray-100 shadow-sm overflow-hidden transition-all hover:border-[#3b82f6] hover:shadow-lg bg-white rounded-2xl sm:rounded-3xl">
                <CardHeader className="p-4 sm:p-6 lg:p-8 pb-2 sm:pb-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Q{i + 1}</span>
                    <div className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-lg tracking-wide sm:tracking-widest ${
                        q.is_correct ? 'text-green-600 bg-green-100/50' :
                        q.user_answer ? 'text-red-600 bg-red-100/50' : 'text-gray-500 bg-gray-100/50'
                    }`}>
                        {q.is_correct ? 'CORRECT' : q.user_answer ? 'INCORRECT' : 'SKIPPED'}
                    </div>
                    </div>
                    <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-relaxed">
                    {q.question_text}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8 pt-0 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {q.options.map((opt, idx) => {
                        const isCorrect = opt === q.correct_answer;
                        const isUserAnswer = opt === q.user_answer;

                        return (
                        <div key={idx} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center gap-3 sm:gap-4 transition-all ${
                            isCorrect ? 'border-green-400 bg-green-50/30 text-green-900' :
                            isUserAnswer && !isCorrect ? 'border-red-400 bg-red-50/30 text-red-900' :
                            'border-gray-100 bg-gray-50/30 text-gray-500'
                        }`}>
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black border transition-colors ${
                            isCorrect ? 'bg-green-500 border-green-500 text-white' :
                            isUserAnswer && !isCorrect ? 'bg-red-500 border-red-500 text-white' :
                            'bg-white border-gray-200 text-gray-400'
                            }`}>
                            {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-xs sm:text-sm">{opt}</span>
                        </div>
                        );
                    })}
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-gray-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedQuestionId(expandedQuestionId === q.id ? null : q.id)}
                        className={`h-9 sm:h-10 text-[10px] sm:text-xs font-black gap-2 px-4 sm:px-5 rounded-xl transition-all ${
                        expandedQuestionId === q.id ? 'bg-[#3b82f6] text-white' : 'text-[#3b82f6] bg-blue-50 hover:bg-blue-100'
                        }`}
                    >
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {expandedQuestionId === q.id ? 'Hide' : 'Explanation'}
                    </Button>

                    {expandedQuestionId === q.id && (
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-blue-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 relative overflow-hidden">
                            <Sparkles className="absolute right-[-10px] top-[-10px] w-16 h-16 sm:w-24 sm:h-24 text-blue-200/40 -rotate-12" />
                            <div className="flex items-center gap-2 mb-2 sm:mb-3 relative z-10">
                            <span className="text-[9px] sm:text-[10px] font-black text-[#3b82f6] uppercase tracking-wide sm:tracking-widest">Concepts Applied</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium relative z-10">
                            {q.explanation || "Our AI is generating a detailed step-by-step walkthrough for this specific problem."}
                            </p>
                        </div>

                            <Button
                                onClick={() => {
                                const currentReportId = Number(reportId);
                                if (!currentReportId || isNaN(currentReportId)) return;
                                const params: any = {};
                                searchParams.forEach((val, key) => { params[key] = val; });
                                setSearchParams({ ...params, fromQ: i.toString() }, { replace: true });
                                const message = encodeURIComponent(`I have a doubt about this question: "${q.question_text}". Can you explain it more?`);
                                navigate(`/dashboard/chat?q=${message}&fromReport=${currentReportId}&fromQ=${i}`);
                                }}
                                className="h-10 sm:h-12 text-xs sm:text-sm font-black gap-2 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-100 text-[#3b82f6] hover:bg-blue-50 hover:border-[#3b82f6] transition-all shadow-sm"
                            >
                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Ask AI Tutor
                        </Button>
                        </div>
                    )}
                    </div>
                </CardContent>
                </Card>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};
