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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {exams.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
                <div className="w-12 h-12 border-2 border-purple-100 border-t-[#8d33ff] rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold">Loading competitive exams...</p>
            </div>
          ) : (
            exams.map((exam) => {
              const displayNames: Record<string, { name: string, desc: string }> = {
                "IIT-JEE": { 
                  name: "IIT-JEE (Main)", 
                  desc: "Concept-weighted practice aligned to JEE pattern" 
                },
                "NEET": { 
                  name: "NEET (UG)", 
                  desc: "Biology, Physics, Chemistry with detailed gap analysis" 
                },
                "KCET": { 
                  name: "KCET", 
                  desc: "Syllabus-based preparation with performance insights" 
                }
              };

              const content = displayNames[exam.code] || { 
                name: exam.name, 
                desc: `Official syllabus-based preparation for ${exam.name}.` 
              };

              return (
                <Card 
                  key={exam.id} 
                  className="rounded-3xl border-purple-200 hover:shadow-2xl hover:border-[#8d33ff] transition-all cursor-pointer bg-gradient-to-br from-purple-100 to-purple-50 group h-full flex flex-col"
                  onClick={() => onExamSelect(exam)}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-800 bg-purple-200/50 rounded-full px-3 py-1">
                        Competitive Exam
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-[#8d33ff] transition-colors leading-tight">
                        {content.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 font-medium leading-relaxed">
                        {content.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-200/30">
                      <span className="text-[10px] font-black text-[#8d33ff] uppercase tracking-widest">Start Practice</span>
                      <ChevronRight className="w-4 h-4 text-[#8d33ff] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      );

    case "subjects":
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-[#8d33ff] font-bold gap-2 rounded-xl hover:bg-purple-50">
              <ArrowLeft className="w-4 h-4" /> Back to Exams
            </Button>
            <div className="text-[11px] font-black text-[#8d33ff] bg-purple-100 px-4 py-1.5 rounded-full border border-purple-200 uppercase tracking-widest shadow-sm">
              {selectedExam?.name}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subjects.map((sub) => (
              <Card 
                key={sub.id} 
                className="rounded-3xl border-gray-100 hover:shadow-2xl hover:border-[#8d33ff] transition-all duration-300 cursor-pointer bg-white group relative overflow-hidden flex flex-col"
                onClick={() => onSubjectSelect(sub)}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-[#8d33ff] to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-7 flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-[#8d33ff] group-hover:bg-[#8d33ff] group-hover:text-white transition-all shadow-inner">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4 className="text-[15px] font-black text-gray-900 group-hover:text-[#8d33ff] transition-colors leading-tight">{sub.name}</h4>
                  <Button size="sm" variant="ghost" className="text-[10px] uppercase font-black tracking-widest text-[#8d33ff]/60 group-hover:text-[#8d33ff] p-0 h-auto">
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row md:items-center justify-between gap-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-[#8d33ff] font-bold gap-2 rounded-xl hover:bg-purple-50 self-start">
              <ArrowLeft className="w-4 h-4" /> Back to Subjects
            </Button>
            <div className="flex items-center gap-3">
               <Button variant="outline" size="sm" onClick={onDeselectAllChapters} className="h-9 text-[10px] font-black uppercase px-4 rounded-xl border-gray-200 hover:bg-gray-50 tracking-widest transition-all active:scale-95">Deselect All</Button>
               <Button variant="outline" size="sm" onClick={() => onSelectAllChapters(chapters.map(c => c.id))} className="h-9 text-[10px] font-black uppercase px-4 border-purple-200 text-[#8d33ff] hover:bg-purple-50 rounded-xl tracking-widest shadow-sm transition-all active:scale-95">Select Full Syllabus</Button>
            </div>
          </div>

          <Card className="border-gray-100 shadow-xl shadow-purple-100/30 overflow-hidden rounded-[32px] bg-white">
            <CardHeader className="bg-purple-50/50 border-b border-gray-50 p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#8d33ff] uppercase tracking-[0.2em] mb-1">Subject Syllabus</p>
                  <CardTitle className="text-xl lg:text-2xl font-black text-gray-900">{selectedSubject?.name}</CardTitle>
                </div>
                <div className="text-xs font-black bg-[#8d33ff] text-white px-4 py-2 rounded-2xl shadow-lg shadow-purple-200 ring-4 ring-white">
                  {selectedChapters.length} Chapters Active
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {chapters.length === 0 ? (
                <div className="p-20 text-center text-gray-400 font-bold">No chapters found for this subject.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {chapters.map((ch) => {
                    const isSelected = selectedChapters.includes(ch.id);
                    return (
                      <div 
                        key={ch.id} 
                        className={`flex items-center justify-between p-5 lg:px-8 hover:bg-purple-50/20 cursor-pointer transition-all ${isSelected ? 'bg-purple-50/40' : 'bg-white'}`}
                        onClick={() => onToggleChapter(ch.id)}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-[#8d33ff] border-[#8d33ff] rotate-[360deg] shadow-lg shadow-purple-200' : 'border-gray-200 bg-white'}`}>
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[4]" />}
                          </div>
                          <span className={`text-[15px] font-bold transition-colors ${isSelected ? 'text-[#8d33ff]' : 'text-gray-700'}`}>{ch.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            disabled={selectedChapters.length === 0}
            className="w-full h-16 text-lg font-black bg-[#8d33ff] hover:bg-[#7a2de0] shadow-xl shadow-purple-200 rounded-[20px] gap-3 transition-all active:scale-[0.98] mt-6"
            onClick={onStartTest}
          >
            Generate Practice Session
            <Zap className="w-5 h-5 fill-current text-yellow-300" />
          </Button>
        </div>
      );
  }
};
