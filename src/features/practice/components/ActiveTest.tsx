import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, ArrowLeft, ArrowRight } from "lucide-react";
import { PracticeQuestion } from "@/lib/api/practice";

interface ActiveTestProps {
  questions: PracticeQuestion[];
  currentIndex: number;
  userAnswers: Record<number, string>;
  timeLeft: number;
  onSelectAnswer: (qid: number, ans: string) => void;
  onTimeUpdate: (qid: number, seconds: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onJumpToQuestion: (index: number) => void;
  onQuit: () => void;
  formatTime: (sec: number) => string;
}

export const ActiveTest = ({
  questions,
  currentIndex,
  userAnswers,
  timeLeft,
  onSelectAnswer,
  onTimeUpdate,
  onPrev,
  onNext,
  onSubmit,
  onJumpToQuestion,
  onQuit,
  formatTime
}: ActiveTestProps) => {
  const currentQ = questions[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      onTimeUpdate(currentQ.id, 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ.id, onTimeUpdate]);

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-8 animate-fade-in">
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between bg-white p-5 rounded-[24px] border border-gray-100 shadow-xl shadow-purple-100/20">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-inner transition-colors ${timeLeft < 60 ? 'bg-red-50' : 'bg-purple-50'}`}>
              <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#8d33ff]'}`} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Time Remaining</p>
              <p className={`text-xl font-mono font-black ${timeLeft < 60 ? 'text-red-500' : 'text-gray-900'}`}>{formatTime(timeLeft)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Question Progress</p>
            <p className="text-xl font-black text-[#8d33ff]">{currentIndex + 1} <span className="text-gray-300 font-bold ml-1">/ {questions.length}</span></p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-gray-100 shadow-2xl shadow-purple-100/30 min-h-[450px] flex flex-col rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-purple-50/30 border-b border-gray-50 p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-[#8d33ff] bg-purple-100 px-3 py-1 rounded-full uppercase tracking-widest">Active Question</span>
            </div>
            <CardTitle className="text-xl lg:text-2xl font-black leading-tight text-gray-900">{currentQ.question_text}</CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 lg:p-10 space-y-4 flex-grow">
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers[currentQ.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectAnswer(currentQ.id, option)}
                    className={`p-5 text-left rounded-2xl border-2 transition-all flex items-center gap-5 group ${
                      isSelected 
                        ? 'border-[#8d33ff] bg-purple-50/50 text-[#8d33ff] shadow-lg shadow-purple-100 ring-4 ring-purple-100/50' 
                        : 'border-gray-50 hover:border-purple-200 hover:bg-purple-50/30 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black border-2 text-sm transition-all ${
                      isSelected ? 'bg-[#8d33ff] border-[#8d33ff] text-white shadow-md rotate-[360deg]' : 'border-gray-200 text-gray-300 bg-white group-hover:border-purple-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-base font-bold">{option}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>

          <div className="p-6 lg:px-10 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
            <Button variant="outline" size="lg" disabled={currentIndex === 0} onClick={onPrev} className="gap-2 h-12 px-6 border-2 font-black text-xs uppercase rounded-xl hover:bg-white active:scale-95 transition-all">
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button size="lg" className="bg-[#8d33ff] hover:bg-[#7a2de0] gap-2 h-12 px-8 font-black text-xs uppercase rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all" onClick={onNext}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2 h-12 px-10 font-black text-xs uppercase rounded-xl shadow-lg shadow-green-100 active:scale-95 transition-all" onClick={onSubmit}>
                Finish Test
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Sidebar Palette */}
      <div className="space-y-6">
        <Card className="shadow-xl shadow-purple-100/20 border-gray-100 rounded-[28px] overflow-hidden bg-white">
          <CardHeader className="pb-4 border-b border-gray-50 bg-purple-50/20 p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Question Palette</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {questions.map((q, i) => {
                const active = currentIndex === i;
                const answered = userAnswers[q.id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => onJumpToQuestion(i)}
                    className={`h-11 w-11 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                      active ? 'ring-4 ring-purple-100 bg-[#8d33ff] text-white shadow-lg shadow-purple-200 scale-110' :
                      answered ? 'bg-purple-100 text-[#8d33ff] border-2 border-purple-200 hover:bg-purple-200' : 
                      'bg-gray-50 text-gray-400 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-3 h-3 rounded-sm bg-[#8d33ff]" /> Active
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-3 h-3 rounded-sm bg-purple-100 border border-purple-200" /> Answered
                </div>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" size="lg" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100 hover:border-red-200 h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95" onClick={onQuit}>
          Quit Practice
        </Button>
      </div>
    </div>
  );
};
