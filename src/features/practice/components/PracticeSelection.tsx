import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, ArrowLeft, Zap, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { StandardExam, StandardSubject, StandardChapter } from "@/lib/api/practice";

interface SelectionProps {
  step: "exams" | "subjects" | "chapters";
  exams: StandardExam[];
  subjects: StandardSubject[];
  chapters: StandardChapter[];
  selectedExam: StandardExam | null;
  selectedSubject: StandardSubject | null;
  selectedChapters: number[];
  onExamSelect: (exam: StandardExam) => void;
  onSubjectSelect: (sub: StandardSubject) => void;
  onToggleChapter: (id: number) => void;
  onSelectAllChapters: (ids: number[]) => void;
  onDeselectAllChapters: () => void;
  onBack: () => void;
  onStartTest: () => void;
}

export const PracticeSelection = ({
  step,
  exams,
  subjects,
  chapters,
  selectedExam,
  selectedSubject,
  selectedChapters,
  onExamSelect,
  onSubjectSelect,
  onToggleChapter,
  onSelectAllChapters,
  onDeselectAllChapters,
  onBack,
  onStartTest
}: SelectionProps) => {
  switch (step) {
    case "exams":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {exams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">Loading exams...</div>
          ) : (
            exams.map((exam) => (
              <Card 
                key={exam.id} 
                className="border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50 group h-full"
                onClick={() => onExamSelect(exam)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-200/50 rounded-full px-2.5 py-0.5">
                      Competitive Exam
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors text-sm">
                      {exam.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      Official syllabus-based preparation for {exam.name}.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200/30">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">Select Exam</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      );

    case "subjects":
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-purple-600 font-semibold gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Exams
            </Button>
            <div className="text-sm font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-tight">
              {selectedExam?.name}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => (
              <Card 
                key={sub.id} 
                className="border-purple-100 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer bg-white group relative overflow-hidden"
                onClick={() => onSubjectSelect(sub)}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors text-sm">{sub.name}</h4>
                  <Button size="sm" variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-purple-400 group-hover:text-purple-600 p-0 h-auto">
                    Select Subject
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );

    case "chapters":
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-purple-600 font-semibold gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Subjects
            </Button>
            <div className="flex gap-2">
               <Button variant="outline" size="xs" onClick={onDeselectAllChapters} className="h-7 text-[10px] font-bold uppercase px-3">Deselect All</Button>
               <Button variant="outline" size="xs" onClick={() => onSelectAllChapters(chapters.map(c => c.id))} className="h-7 text-[10px] font-bold uppercase px-3 border-purple-200 text-purple-600">Select All Syllabus</Button>
            </div>
          </div>

          <Card className="border-purple-100 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-purple-900">Syllabus: {selectedSubject?.name}</CardTitle>
                  <p className="text-[11px] text-gray-500 font-medium">Select specific chapters to practice</p>
                </div>
                <div className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                  {selectedChapters.length} Selected
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {chapters.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm">No chapters found for this subject.</div>
              ) : (
                chapters.map((ch) => (
                  <div 
                    key={ch.id} 
                    className={`flex items-center justify-between p-4 border-b border-purple-50 last:border-0 hover:bg-purple-50/30 cursor-pointer transition-colors ${selectedChapters.includes(ch.id) ? 'bg-purple-50/50' : 'bg-white'}`}
                    onClick={() => onToggleChapter(ch.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedChapters.includes(ch.id) ? 'bg-purple-600 border-purple-600' : 'border-purple-100'}`}>
                        {selectedChapters.includes(ch.id) && <Check className="w-3 h-3 text-white stroke-[4]" />}
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${selectedChapters.includes(ch.id) ? 'text-purple-900' : 'text-gray-600'}`}>{ch.title}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Button 
            disabled={selectedChapters.length === 0}
            className="w-full h-12 text-sm font-bold bg-purple-600 hover:bg-purple-700 shadow-md rounded-xl gap-2 transition-all active:scale-[0.98]"
            onClick={onStartTest}
          >
            Generate {selectedExam?.code} {selectedSubject?.name} Practice
            <Zap className="w-4 h-4 fill-current" />
          </Button>
        </div>
      );
  }
};
