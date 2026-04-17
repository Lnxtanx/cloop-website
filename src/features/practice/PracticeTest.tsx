import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  BookOpen,
  ChevronRight,
  Clock,
  AlertCircle,
  History,
  FileText,
  Calendar
} from "lucide-react";
import { 
  generatePracticeTest, 
  submitPracticeTest, 
  fetchPracticeHistory, 
  fetchPracticeTestDetails,
  PracticeQuestion, 
  PracticeTest as PracticeTestType 
} from "@/lib/api/practice";
import { toast } from "sonner";

type TestState = "selection" | "loading" | "testing" | "reporting" | "history";

const PracticeTest = () => {
  const [state, setState] = useState<TestState>("selection");
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [examType, setExamType] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [testId, setTestId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [history, setHistory] = useState<PracticeTestType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [report, setReport] = useState<{
    score: number;
    total_questions: number;
    time_taken_sec: number;
    questions: PracticeQuestion[];
  } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!testId) return;
    setState("loading");
    
    const formattedAnswers = questions.map(q => ({
      question_id: q.id,
      user_answer: userAnswers[q.id] || null
    }));

    try {
      const timeTaken = 600 - timeLeft;
      const data = await submitPracticeTest(testId, formattedAnswers, timeTaken);
      setReport(data);
      setState("reporting");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit test");
      setState("testing");
    }
  }, [testId, questions, userAnswers, timeLeft]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchPracticeHistory();
      setHistory(data);
    } catch (error: any) {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartTest = async (type: string, sub: string) => {
    setExamType(type);
    setSubject(sub);
    setState("loading");
    try {
      const data = await generatePracticeTest(type, sub);
      setTestId(data.test_id);
      setQuestions(data.questions);
      setTimeLeft(data.time_limit_sec);
      setState("testing");
      setCurrentIndex(0);
      setUserAnswers({});
    } catch (error: any) {
      toast.error(error.message || "Failed to start test");
      setState("selection");
    }
  };

  const handleViewDetails = async (id: number) => {
    setState("loading");
    try {
      const data = await fetchPracticeTestDetails(id);
      setExamType(data.exam_type);
      setSubject(data.subject);
      setReport({
        score: data.score || 0,
        total_questions: data.total_questions,
        time_taken_sec: data.time_taken_sec || 0,
        questions: data.questions || []
      });
      setState("reporting");
    } catch (error: any) {
      toast.error("Failed to load test details");
      setState("selection");
    }
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === "testing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && state === "testing") {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [state, timeLeft, handleSubmit]);

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. SELECTION / HISTORY VIEW
  if (state === "selection") {
    return (
      <DashboardLayout title="Test Your Self">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-purple-900">Practice Dashboard</h2>
            <p className="text-muted-foreground text-base">Challenge yourself with exam-style questions or review past performance.</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
              <button
                onClick={() => setActiveTab("new")}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === "new" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Take a Test
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === "history" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <History className="w-4 h-4" /> Past Results
              </button>
            </div>
          </div>

          {activeTab === "new" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                {/* NEET SECTION */}
                <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all overflow-hidden shadow-sm">
                  <div className="bg-purple-600 p-4 text-white text-center font-bold text-lg">NEET (UG)</div>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">Practice Biology, Physics, and Chemistry questions at NEET difficulty level.</p>
                    <div className="grid grid-cols-1 gap-2">
                      {["Biology", "Physics", "Chemistry"].map((sub) => (
                        <Button 
                          key={sub} 
                          variant="outline" 
                          className="justify-between group h-12 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                          onClick={() => handleStartTest("NEET", sub)}
                        >
                          {sub} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* IIT-JEE SECTION */}
                <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all overflow-hidden shadow-sm">
                  <div className="bg-blue-600 p-4 text-white text-center font-bold text-lg">IIT-JEE (Main)</div>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">Prepare for Engineering with high-difficulty Physics, Chemistry, and Math questions.</p>
                    <div className="grid grid-cols-1 gap-2">
                      {["Mathematics", "Physics", "Chemistry"].map((sub) => (
                        <Button 
                          key={sub} 
                          variant="outline" 
                          className="justify-between group h-12 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                          onClick={() => handleStartTest("IIT-JEE", sub)}
                        >
                          {sub} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Test Rules</p>
                    <ul className="text-sm text-amber-800 list-disc list-inside">
                      <li>Total 15 Multiple Choice Questions.</li>
                      <li>Time limit: 10 Minutes.</li>
                      <li>AI will generate a fresh set of questions every time.</li>
                      <li>Detailed explanations provided after submission.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {loadingHistory ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Fetching your test history...</p>
                </div>
              ) : history.length === 0 ? (
                <Card className="border-dashed border-2 py-20 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700">No Tests Found</h3>
                  <p className="text-muted-foreground mt-2 mb-6">You haven't taken any practice tests yet.</p>
                  <Button onClick={() => setActiveTab("new")} className="bg-purple-600">Take your first test</Button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {history.map((test) => (
                    <Card key={test.id} className="hover:shadow-md transition-all border-gray-100 group">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white ${
                            test.exam_type === 'NEET' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {test.exam_type[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{test.exam_type}: {test.subject}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(test.created_at)}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTime(test.time_taken_sec || 0)} taken</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-2xl font-black text-purple-600">{test.score} <span className="text-sm text-gray-400">/ {test.total_questions}</span></p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Final Score</p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="group-hover:bg-purple-600 group-hover:text-white transition-all gap-2"
                            onClick={() => handleViewDetails(test.id)}
                          >
                            View Report <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // 2. LOADING VIEW
  if (state === "loading") {
    return (
      <DashboardLayout title="Processing">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <BookOpen className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-900">Please wait...</h3>
            <p className="text-muted-foreground">Our AI is processing your request.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 3. TESTING VIEW
  if (state === "testing") {
    const currentQ = questions[currentIndex];
    return (
      <DashboardLayout title={`${examType} Practice: ${subject}`}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Time Remaining</p>
                  <p className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>{formatTime(timeLeft)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Progress</p>
                <p className="text-lg font-bold text-purple-600">{currentIndex + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span></p>
              </div>
            </div>

            <Card className="border-2 border-purple-100 shadow-md min-h-[400px] flex flex-col">
              <CardHeader className="bg-purple-50/50 border-b p-5">
                <CardTitle className="text-base font-semibold leading-relaxed">{currentQ.question_text}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4 flex-grow">
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = userAnswers[currentQ.id] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: option })}
                        className={`p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 ${
                          isSelected 
                            ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm' 
                            : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                          isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-200 text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-medium">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                <Button 
                  variant="outline" 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                
                {currentIndex < questions.length - 1 ? (
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 gap-2 px-8"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 gap-2 px-10"
                    onClick={handleSubmit}
                  >
                    Finish & Submit Test
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Question Palette</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => {
                    const active = currentIndex === i;
                    const answered = userAnswers[q.id] !== undefined;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-10 w-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                          active 
                            ? 'ring-2 ring-purple-600 ring-offset-2 bg-purple-600 text-white' 
                            : answered 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
              onClick={() => { if (window.confirm("Are you sure? progress will be lost.")) setState("selection"); }}
            >
              Quit Test
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 4. REPORT VIEW
  if (state === "reporting" && report) {
    const accuracy = Math.round((report.score / report.total_questions) * 100);
    return (
      <DashboardLayout title="Performance Report">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-purple-700 to-indigo-900 text-white">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest">Test Summary</div>
                  <h2 className="text-3xl font-extrabold">{examType}: {subject}</h2>
                  <div className="flex items-center gap-6 justify-center md:justify-start">
                    <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-300" /><span className="text-lg font-medium">{formatTime(report.time_taken_sec)}</span></div>
                    <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /><span className="text-lg font-medium">{report.score}/{report.total_questions}</span></div>
                  </div>
                </div>
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray={502} strokeDashoffset={502 - (502 * accuracy) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-black block">{accuracy}%</span>
                    <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Accuracy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-purple-600 hover:bg-purple-700 h-12 px-8 rounded-xl font-bold gap-2 text-lg shadow-lg shadow-purple-200" onClick={() => handleStartTest(examType, subject)}><RotateCcw className="w-5 h-5" /> Retake Test</Button>
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold text-lg border-2" onClick={() => { setState("selection"); setActiveTab("history"); }}>Back to History</Button>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3"><BookOpen className="w-6 h-6 text-purple-600" /> Question Review</h3>
            {report.questions.map((q, i) => (
              <Card key={i} className={`border-l-8 ${q.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-400">Question {i + 1}</span>
                    <span className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full ${q.is_correct ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {q.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {q.is_correct ? 'Correct' : q.user_answer ? 'Incorrect' : 'Skipped'}
                    </span>
                  </div>
                  <CardTitle className="text-base text-gray-800 leading-relaxed">{q.question_text}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border-2 flex items-center gap-3 text-sm ${opt === q.correct_answer ? 'border-green-200 bg-green-50 text-green-900 ring-1 ring-green-500' : opt === q.user_answer ? 'border-red-200 bg-red-50 text-red-900 ring-1 ring-red-500' : 'border-gray-100 bg-gray-50/50'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${opt === q.correct_answer ? 'bg-green-500 text-white' : opt === q.user_answer ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{String.fromCharCode(65 + idx)}</div>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><h4 className="text-blue-900 font-bold text-sm flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> Explanation</h4><p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};

export default PracticeTest;
