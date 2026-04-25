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
  Loader2 
} from "lucide-react";
import { PracticeQuestion } from "@/lib/api/practice";
import { toast } from "sonner";

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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-purple-100 shadow-sm bg-gradient-to-br from-purple-600 to-purple-800 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="w-32 h-32" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200 mb-1">Performance Summary</p>
                <h2 className="text-2xl font-bold tracking-tight">{examType}: {subject}</h2>
              </div>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-4xl font-bold tracking-tighter">{accuracy}%</p>
                  <p className="text-[10px] font-medium text-purple-200 uppercase tracking-widest">Accuracy Rate</p>
                </div>
                <div className="h-10 w-px bg-white/20 mb-1" />
                <div>
                  <p className="text-2xl font-bold tracking-tight">{formatTime(report.time_taken_sec)}</p>
                  <p className="text-[10px] font-medium text-purple-200 uppercase tracking-widest">Total Time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Correct</span>
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{correctCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500 flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-red-500" /> Incorrect</span>
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{incorrectCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500 flex items-center gap-2"><Target className="w-3.5 h-3.5 text-gray-400" /> Skipped</span>
                <span className="text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">{skippedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 font-bold px-6 h-9 gap-2 shadow-sm" onClick={onRetake}>
          <RotateCcw className="w-3.5 h-3.5" /> Retake Test
        </Button>
        <Button size="sm" variant="outline" className="font-bold px-6 h-9 border-purple-100 text-purple-600 hover:bg-purple-50" onClick={onViewHistory}>
          View History
        </Button>
      </div>

      <div className="space-y-4 pt-4 border-t border-purple-50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Analyse Your Answers</h3>
        </div>

        {report.questions.map((q, i) => (
          <div key={i} ref={el => questionRefs.current[q.id] = el}>
            <Card className="border border-purple-50 shadow-none overflow-hidden transition-all hover:border-purple-200 bg-white">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question {i + 1}</span>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    q.is_correct ? 'text-green-600 bg-green-50' : 
                    q.user_answer ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'
                  }`}>
                    {q.is_correct ? 'CORRECT' : q.user_answer ? 'INCORRECT' : 'SKIPPED'}
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold text-gray-800 leading-relaxed">
                  {q.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, idx) => {
                    const isCorrect = opt === q.correct_answer;
                    const isUserAnswer = opt === q.user_answer;
                    
                    return (
                      <div key={idx} className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-3 transition-all ${
                        isCorrect ? 'border-green-200 bg-green-50/50 text-green-900' : 
                        isUserAnswer && !isCorrect ? 'border-red-100 bg-red-50/50 text-red-900' : 
                        'border-gray-50 bg-gray-50/30 text-gray-500'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                          isCorrect ? 'bg-green-500 border-green-500 text-white' : 
                          isUserAnswer && !isCorrect ? 'bg-red-500 border-red-500 text-white' : 
                          'bg-white border-gray-200 text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpandedQuestionId(expandedQuestionId === q.id ? null : q.id)}
                    className={`h-8 text-[11px] font-bold gap-2 px-3 rounded-full transition-all ${
                      expandedQuestionId === q.id ? 'bg-purple-600 text-white hover:bg-purple-700' : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {expandedQuestionId === q.id ? 'Hide Explanation' : 'Explain More'}
                  </Button>

                  {expandedQuestionId === q.id && (
                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Explanation</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {q.explanation || "No explanation available for this question."}
                        </p>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const currentReportId = Number(reportId);
                          if (!currentReportId || isNaN(currentReportId)) return;

                          // Update current URL history entry so "Back" remembers this question
                          // Preserve existing params (like reportId)
                          const params: any = {};
                          searchParams.forEach((val, key) => { params[key] = val; });
                          setSearchParams({ ...params, fromQ: i.toString() }, { replace: true });
                          
                          const message = encodeURIComponent(`I have a doubt about this question: "${q.question_text}". The options were: ${q.options.join(", ")}. The correct answer is: ${q.correct_answer}. Can you explain it more?`);
                          navigate(`/dashboard/chat?q=${message}&fromReport=${currentReportId}&fromQ=${i}`);
                        }}
                        className="h-8 text-[11px] font-bold gap-2 px-4 rounded-full border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
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
  );
};
