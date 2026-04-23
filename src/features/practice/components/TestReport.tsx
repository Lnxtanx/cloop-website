import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, BookOpen, CheckCircle2, XCircle, AlertCircle, RotateCcw, Target, MessageSquare, Send, Loader2 } from "lucide-react";
import { PracticeQuestion } from "@/lib/api/practice";
import { toast } from "sonner";

interface ReportProps {
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

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export const TestReport = ({
  examType,
  subject,
  report,
  onRetake,
  onViewHistory,
  formatTime
}: ReportProps) => {
  const accuracy = Math.round((report.score / report.total_questions) * 100);
  const correctCount = report.score;
  const incorrectCount = report.questions.filter(q => q.user_answer && !q.is_correct).length;
  const skippedCount = report.questions.filter(q => !q.user_answer).length;

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<Record<number, ChatMessage[]>>({});
  const [loadingAi, setLoadingAi] = useState<Record<number, boolean>>({});
  const [userInput, setUserInput] = useState("");

  const handleStartDiscussion = async (q: PracticeQuestion) => {
    if (activeChatId === q.id) {
      setActiveChatId(null);
      return;
    }

    setActiveChatId(q.id);
    
    if (chats[q.id]) return;

    setLoadingAi(prev => ({ ...prev, [q.id]: true }));
    try {
      setChats(prev => ({
        ...prev,
        [q.id]: [{ role: 'ai', content: q.explanation || "Let me help you understand this question." }]
      }));
    } finally {
      setLoadingAi(prev => ({ ...prev, [q.id]: false }));
    }
  };

  const handleSendMessage = async (qId: number) => {
    if (!userInput.trim()) return;

    const userMsg = userInput.trim();
    setUserInput("");

    setChats(prev => ({
      ...prev,
      [qId]: [...(prev[qId] || []), { role: 'user', content: userMsg }]
    }));

    setLoadingAi(prev => ({ ...prev, [qId]: true }));

    try {
      const token = localStorage.getItem("cloop_token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
      
      const response = await fetch(`${API_BASE_URL}/api/normal-chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Discussion about Question: "${report.questions.find(q => q.id === qId)?.question_text}". User says: ${userMsg}`,
          context: "PRACTICE_TEST_DISCUSSION"
        }),
      });

      if (!response.ok) throw new Error("AI failed to respond");

      const data = await response.json();
      
      setChats(prev => ({
        ...prev,
        [qId]: [...(prev[qId] || []), { role: 'ai', content: data.message }]
      }));
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setLoadingAi(prev => ({ ...prev, [qId]: false }));
    }
  };

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
          <Card key={i} className="border border-purple-50 shadow-none overflow-hidden transition-all hover:border-purple-200 bg-white">
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
                  onClick={() => handleStartDiscussion(q)}
                  className={`h-8 text-[11px] font-bold gap-2 px-3 rounded-full transition-all ${
                    activeChatId === q.id ? 'bg-purple-600 text-white hover:bg-purple-700' : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {activeChatId === q.id ? 'Close Discussion' : 'Explain More'}
                </Button>

                {activeChatId === q.id && (
                  <div className="mt-4 border-t border-purple-50 pt-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-2">
                      {(chats[q.id] || []).map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm font-medium ${
                            msg.role === 'user' 
                              ? 'bg-purple-600 text-white rounded-tr-none' 
                              : 'bg-purple-50 text-purple-900 rounded-tl-none border border-purple-100'
                          }`}>
                            {msg.role === 'ai' && <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Cloop AI</p>}
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {loadingAi[q.id] && (
                        <div className="flex justify-start">
                          <div className="bg-purple-50 text-purple-400 p-3 rounded-2xl rounded-tl-none border border-purple-100 flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-[10px] font-bold">Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 focus-within:border-purple-300 transition-colors">
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(q.id)}
                        placeholder="Ask something about this question..."
                        className="flex-1 bg-transparent border-none outline-none text-xs px-2 py-1 placeholder:text-gray-400 font-medium"
                      />
                      <Button 
                        size="icon" 
                        className="h-8 w-8 rounded-lg bg-purple-600 hover:bg-purple-700 shadow-sm"
                        disabled={!userInput.trim() || loadingAi[q.id]}
                        onClick={() => handleSendMessage(q.id)}
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
