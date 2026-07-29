import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, ArrowLeft, Zap, Check } from "lucide-react";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-0">
          {exams.length === 0 ? (
            <div className="col-span-full py-16 sm:py-20 text-center text-gray-400">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold text-sm sm:text-base">Loading competitive exams...</p>
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
                  className="rounded-2xl sm:rounded-3xl border-zinc-200 hover:shadow-2xl hover:border-black transition-all cursor-pointer bg-gradient-to-br from-zinc-100 to-zinc-50 group h-full flex flex-col"
                  onClick={() => onExamSelect(exam)}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    <div className="mb-3 sm:mb-4">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-zinc-800 bg-zinc-200/60 rounded-full px-2.5 sm:px-3 py-1">
                        Competitive Exam
                      </span>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-black transition-colors leading-tight">
                        {content.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1.5 sm:mt-2 line-clamp-2 font-medium leading-relaxed">
                        {content.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-200/50">
                      <span className="text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wider sm:tracking-widest">Start Practice</span>
                      <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
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
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-0">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-black font-bold gap-2 rounded-xl hover:bg-zinc-100 h-9 px-3">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="text-[9px] sm:text-[11px] font-black text-black bg-zinc-100 px-3 sm:px-4 py-1.5 rounded-full border border-zinc-200 uppercase tracking-wide sm:tracking-widest shadow-sm">
              {selectedExam?.name}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((sub) => (
              <Card
                key={sub.id}
                className="rounded-2xl sm:rounded-3xl border-gray-100 hover:shadow-2xl hover:border-black transition-all duration-300 cursor-pointer bg-white group relative overflow-hidden flex flex-col"
                onClick={() => onSubjectSelect(sub)}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-black to-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5 sm:p-7 flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all shadow-inner">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h4 className="text-sm sm:text-[15px] font-black text-gray-900 group-hover:text-black transition-colors leading-tight">{sub.name}</h4>
                  <Button size="sm" variant="ghost" className="text-[9px] sm:text-[10px] uppercase font-black tracking-wide sm:tracking-widest text-black/60 group-hover:text-black p-0 h-auto">
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-0 pb-safe">
          <div className="flex flex-col gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-black font-bold gap-2 rounded-xl hover:bg-zinc-100 self-start h-9 px-3">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Button variant="outline" size="sm" onClick={onDeselectAllChapters} className="h-9 text-[9px] sm:text-[10px] font-black uppercase px-3 sm:px-4 rounded-xl border-gray-200 hover:bg-gray-50 tracking-wide transition-all active:scale-95">Deselect All</Button>
                <Button variant="outline" size="sm" onClick={() => onSelectAllChapters(chapters.map(c => c.id))} className="h-9 text-[9px] sm:text-[10px] font-black uppercase px-3 sm:px-4 border-zinc-300 text-black hover:bg-zinc-100 rounded-xl tracking-wide shadow-sm transition-all active:scale-95">Select All</Button>
            </div>
          </div>

            <Card className="border-gray-100 shadow-xl shadow-zinc-100 overflow-hidden rounded-2xl sm:rounded-[32px] bg-white">
              <CardHeader className="bg-zinc-50 border-b border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1">Subject Syllabus</p>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">{selectedSubject?.name}</CardTitle>
                </div>
                  <div className="text-[10px] sm:text-xs font-black bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg shadow-zinc-300 self-start">
                    {selectedChapters.length} Chapters
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[350px] sm:max-h-[450px] lg:max-h-[500px] overflow-y-auto">
              {chapters.length === 0 ? (
                <div className="p-12 sm:p-20 text-center text-gray-400 font-bold text-sm">No chapters found for this subject.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {chapters.map((ch) => {
                    const isSelected = selectedChapters.includes(ch.id);
                    return (
                        <div
                          key={ch.id}
                          className={`flex items-center justify-between p-4 sm:p-5 lg:px-8 hover:bg-zinc-50 cursor-pointer transition-all active:bg-zinc-100 ${isSelected ? 'bg-zinc-50' : 'bg-white'}`}
                          onClick={() => onToggleChapter(ch.id)}
                        >
                          <div className="flex items-center gap-3 sm:gap-5">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-black border-black shadow-lg shadow-zinc-300' : 'border-gray-200 bg-white'}`}>
                              {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[4]" />}
                            </div>
                          <span className={`text-sm sm:text-[15px] font-bold transition-colors ${isSelected ? 'text-black' : 'text-gray-700'}`}>{ch.title}</span>
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
              className="w-full h-12 sm:h-14 lg:h-16 text-base sm:text-lg font-black bg-black hover:bg-zinc-800 text-white shadow-xl shadow-zinc-300 rounded-2xl sm:rounded-[20px] gap-2 sm:gap-3 transition-all active:scale-[0.98]"
              onClick={onStartTest}
            >
            Generate Practice Session
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-yellow-300" />
          </Button>
        </div>
      );
  }
};
