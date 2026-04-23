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
        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading your test history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed border-2 py-24 text-center bg-gray-50/30">
        <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">No History Available</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-xs mx-auto">You haven't completed any practice sessions yet. Start your learning journey today!</p>
        <Button onClick={onStartNew} className="bg-purple-600 hover:bg-purple-700 font-bold px-8 h-12 shadow-lg shadow-purple-200 transition-all active:scale-95">Take First Test</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {/* Table Header - Desktop Only */}
      <div className="hidden md:grid grid-cols-[1fr_120px_100px_150px] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <div>Exam & Subject</div>
        <div className="text-center">Performance</div>
        <div className="text-center">Time</div>
        <div className="text-right">Action</div>
      </div>

      <div className="space-y-2">
        {history.map((test) => {
          const scorePercent = Math.round((test.score || 0) / (test.total_questions || 1) * 100);
          
          return (
            <Card key={test.id} className="border-purple-50 hover:border-purple-200 hover:shadow-md transition-all group overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-[1fr_120px_100px_150px] items-center flex-1 gap-4">
                  {/* Left: Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      {test.exam_type[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{test.exam_type}: {test.subject}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-medium">
                        <Calendar className="w-3 h-3" /> {formatDate(test.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center justify-center md:border-x md:border-gray-50 px-2">
                    <p className="text-sm font-bold text-purple-700">{test.score} <span className="text-[10px] text-gray-400 font-normal">/ {test.total_questions}</span></p>
                    <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${scorePercent}%` }} />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-purple-300" /> {formatTime(test.time_taken_sec || 0)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-gray-300 mt-0.5 tracking-tighter">Duration</span>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(test.id)}
                      className="h-9 px-4 text-xs font-bold text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl gap-2 transition-all group/btn"
                    >
                      View Report 
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
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
