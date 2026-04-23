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
  onPrev,
  onNext,
  onSubmit,
  onJumpToQuestion,
  onQuit,
  formatTime
}: ActiveTestProps) => {
  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_280px] gap-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-purple-600'}`} />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Remaining</p>
              <p className={`text-base font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>{formatTime(timeLeft)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Question</p>
            <p className="text-base font-bold text-purple-600">{currentIndex + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span></p>
          </div>
        </div>

        <Card className="border-purple-100 shadow-sm min-h-[350px] flex flex-col rounded-xl overflow-hidden">
          <CardHeader className="bg-purple-50/30 border-b p-4">
            <CardTitle className="text-sm font-bold leading-relaxed text-purple-950">{currentQ.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 flex-grow">
            <div className="grid grid-cols-1 gap-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers[currentQ.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectAnswer(currentQ.id, option)}
                    className={`p-3 text-left rounded-lg border transition-all flex items-center gap-3 ${
                      isSelected 
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm ring-1 ring-purple-600/10' 
                        : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold border text-[10px] transition-colors ${
                      isSelected ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'border-gray-200 text-gray-400 bg-white'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-xs font-semibold">{option}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
          <div className="p-3 bg-gray-50/50 border-t flex justify-between items-center">
            <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={onPrev} className="gap-1.5 h-8 px-3 border font-semibold text-[10px] uppercase">
              <ArrowLeft className="w-3 h-3" /> Prev
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1.5 h-8 px-4 font-semibold text-[10px] uppercase" onClick={onNext}>
                Next <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 h-8 px-5 font-semibold text-[10px] uppercase" onClick={onSubmit}>
                Finish Test
              </Button>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="shadow-sm border-purple-100 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b bg-purple-50/20 p-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Question Palette</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const active = currentIndex === i;
                const answered = userAnswers[q.id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => onJumpToQuestion(i)}
                    className={`h-9 w-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      active ? 'ring-2 ring-purple-600 ring-offset-1 bg-purple-600 text-white shadow-md' :
                      answered ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 
                      'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" size="sm" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100 h-9 font-bold text-xs" onClick={onQuit}>
          Quit Practice
        </Button>
      </div>
    </div>
  );
};
