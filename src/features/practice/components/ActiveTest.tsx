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
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-8 animate-fade-in px-2 sm:px-4 pb-safe">
      <div className="space-y-4 sm:space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between bg-white p-3 sm:p-5 rounded-2xl sm:rounded-[24px] border border-gray-100 shadow-xl shadow-blue-100/20">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-inner transition-colors ${timeLeft < 60 ? 'bg-red-50' : 'bg-blue-50'}`}>
              <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#3b82f6]'}`} />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5">Time</p>
              <p className={`text-lg sm:text-xl font-mono font-black ${timeLeft < 60 ? 'text-red-500' : 'text-gray-900'}`}>{formatTime(timeLeft)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5">Progress</p>
            <p className="text-lg sm:text-xl font-black text-[#8d33ff]">{currentIndex + 1} <span className="text-gray-300 font-bold ml-1">/ {questions.length}</span></p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-gray-100 shadow-2xl shadow-blue-100/30 min-h-[350px] sm:min-h-[450px] flex flex-col rounded-2xl sm:rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-blue-50/30 border-b border-gray-50 p-4 sm:p-6 lg:p-10">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-black text-[#3b82f6] bg-blue-100 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wide sm:tracking-widest">Active Question</span>
            </div>
            <CardTitle className="text-base sm:text-xl lg:text-2xl font-black leading-tight text-gray-900">{currentQ.question_text}</CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-10 space-y-3 sm:space-y-4 flex-grow">
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers[currentQ.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectAnswer(currentQ.id, option)}
                    className={`p-3 sm:p-5 text-left rounded-xl sm:rounded-2xl border-2 transition-all flex items-center gap-3 sm:gap-5 group ${
                      isSelected
                        ? 'border-[#3b82f6] bg-blue-50/50 text-[#3b82f6] shadow-lg shadow-blue-100'
                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 text-gray-700'
                    }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-black border-2 text-xs sm:text-sm transition-all ${
                      isSelected ? 'bg-[#8d33ff] border-[#8d33ff] text-white shadow-md' : 'border-gray-200 text-gray-300 bg-white group-hover:border-purple-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm sm:text-base font-bold">{option}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>

          <div className="p-3 sm:p-4 lg:px-10 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
            <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={onPrev} className="gap-2 h-10 sm:h-12 px-4 sm:px-6 border-2 font-black text-xs uppercase rounded-xl hover:bg-white active:scale-95 transition-all">
              <ArrowLeft className="w-4 h-4" /> Prev
            </Button>
            {currentIndex < questions.length - 1 ? (
                <Button size="sm" className="bg-[#3b82f6] hover:bg-[#2563eb] gap-2 h-10 sm:h-12 px-6 sm:px-8 font-black text-xs uppercase rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all" onClick={onNext}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-2 h-10 sm:h-12 px-6 sm:px-10 font-black text-xs uppercase rounded-xl shadow-lg shadow-green-100 active:scale-95 transition-all" onClick={onSubmit}>
                Finish
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Sidebar Palette */}
      <div className="space-y-4 sm:space-y-6 order-first lg:order-last">
        <Card className="shadow-xl shadow-blue-100/20 border-gray-100 rounded-2xl sm:rounded-[28px] overflow-hidden bg-white">
          <CardHeader className="pb-3 sm:pb-4 border-b border-gray-50 bg-blue-50/20 p-4 sm:p-6">
            <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-blue-400">Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-6 sm:grid-cols-4 gap-2 sm:gap-3">
              {questions.map((q, i) => {
                const active = currentIndex === i;
                const answered = userAnswers[q.id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => onJumpToQuestion(i)}
                    className={`h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                      active ? 'ring-4 ring-blue-100 bg-[#3b82f6] text-white shadow-lg shadow-blue-200 scale-105 sm:scale-110' :
                      answered ? 'bg-blue-100 text-[#3b82f6] border-2 border-blue-200 hover:bg-blue-200' :
                      'bg-gray-50 text-gray-400 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-50 space-y-2 sm:space-y-3 hidden sm:block">
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wide sm:tracking-widest">
                    <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" /> Active
                </div>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wide sm:tracking-widest">
                    <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" /> Answered
                </div>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" size="sm" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100 hover:border-red-200 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide sm:tracking-widest shadow-sm transition-all active:scale-95" onClick={onQuit}>
          Quit Practice
        </Button>
      </div>
    </div>
  );
};
