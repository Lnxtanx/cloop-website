import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { PracticeTest as PracticeTestType } from "@/lib/api/practice";

interface HistoryProps {
  history: PracticeTestType[];
  loading: boolean;
  onViewDetails: (id: number) => void;
  onStartNew: () => void;
  formatDate: (date: string) => string;
  formatTime: (sec: number) => string;
}

export const PracticeHistory = ({ 
  history, 
  loading, 
  onViewDetails, 
  onStartNew,
  formatDate,
  formatTime 
}: HistoryProps) => {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-purple-100 border-t-[#8d33ff] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading your test history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed border-2 py-24 text-center bg-purple-50/20 rounded-[32px]">
        <div className="bg-white w-20 h-20 rounded-3xl shadow-lg shadow-purple-100/50 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-purple-200" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">No History Available</h3>
        <p className="text-base text-gray-500 mt-2 mb-8 max-w-xs mx-auto font-medium">You haven't completed any practice sessions yet. Start your learning journey today!</p>
        <Button onClick={onStartNew} className="bg-[#8d33ff] hover:bg-[#7a2de0] font-black px-10 h-14 rounded-2xl shadow-xl shadow-purple-200 transition-all active:scale-95 text-lg">Take First Test</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Table Header - Desktop Only */}
      <div className="hidden md:grid grid-cols-[1fr_120px_100px_150px] px-6 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">
        <div>Exam & Subject</div>
        <div className="text-center">Accuracy</div>
        <div className="text-center">Duration</div>
        <div className="text-right">Action</div>
      </div>

      <div className="space-y-3">
        {history.map((test) => {
          const scorePercent = Math.round((test.score || 0) / (test.total_questions || 1) * 100);
          
          return (
            <Card key={test.id} className="border-gray-100 hover:border-[#8d33ff] hover:shadow-xl hover:shadow-purple-50 transition-all group overflow-hidden bg-white rounded-2xl cursor-pointer" onClick={() => onViewDetails(test.id)}>
              <CardContent className="p-0">
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-[1fr_120px_100px_150px] items-center gap-4">
                  {/* Left: Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-[#8d33ff] font-black text-sm shrink-0 group-hover:bg-[#8d33ff] group-hover:text-white transition-colors">
                      {test.exam_type[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-gray-900 text-[15px] truncate group-hover:text-[#8d33ff] transition-colors">{test.exam_type}: {test.subject}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(test.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center justify-center md:border-x md:border-gray-50 px-2">
                    <p className="text-sm font-black text-[#8d33ff]">{test.score} <span className="text-[11px] text-gray-400 font-bold">/ {test.total_questions}</span></p>
                    <div className="w-16 h-1.5 bg-gray-50 rounded-full mt-1.5 overflow-hidden border border-gray-100/50">
                      <div className={`h-full rounded-full transition-all duration-1000 ${scorePercent >= 80 ? 'bg-green-500' : scorePercent >= 50 ? 'bg-[#8d33ff]' : 'bg-red-400'}`} style={{ width: `${scorePercent}%` }} />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[13px] font-black text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8d33ff]" /> {formatTime(test.time_taken_sec || 0)}
                    </span>
                    <span className="text-[9px] uppercase font-black text-gray-400 mt-0.5 tracking-widest">Focused</span>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-10 px-4 text-xs font-black text-[#8d33ff] hover:bg-purple-50 rounded-xl gap-2 transition-all group/btn border border-transparent hover:border-[#8d33ff]/20"
                    >
                      Analytics 
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
