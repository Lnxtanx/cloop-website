import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, FileText } from "lucide-react";
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
      <div className="text-center py-16">
        <div className="w-8 h-8 border-3 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-muted-foreground font-medium">Fetching history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed border-2 py-20 text-center bg-gray-50/30">
        <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">No Tests Found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs mx-auto">You haven't taken any practice tests yet.</p>
        <Button onClick={onStartNew} size="sm" className="bg-purple-600 font-bold px-6">Take your first test</Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 max-w-4xl mx-auto">
      {history.map((test) => (
        <Card key={test.id} className="hover:shadow-sm transition-all border-gray-100 group overflow-hidden bg-white">
          <CardContent className="p-0 flex items-stretch">
            <div className={`w-1.5 ${test.score && (test.score / test.total_questions >= 0.8) ? 'bg-green-500' : 'bg-purple-500'}`} />
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between flex-1 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-purple-600 text-sm shadow-sm">
                  {test.exam_type[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight">{test.exam_type}: {test.subject}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(test.created_at)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(test.time_taken_sec || 0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-bold text-purple-600">{test.score} <span className="text-[10px] text-gray-400 font-medium">/ {test.total_questions}</span></p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Score</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group-hover:bg-purple-600 group-hover:text-white transition-all gap-1.5 h-8 px-4 border text-xs font-semibold"
                  onClick={() => onViewDetails(test.id)}
                >
                  View Report <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
