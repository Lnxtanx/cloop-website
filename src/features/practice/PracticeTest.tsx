import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { 
  generatePracticeTest, 
  submitPracticeTest, 
  fetchPracticeHistory, 
  fetchPracticeTestDetails,
  fetchStandardExams,
  fetchStandardSubjects,
  fetchStandardChapters,
  StandardExam,
  StandardSubject,
  StandardChapter,
  PracticeQuestion, 
  PracticeTest as PracticeTestType 
} from "@/lib/api/practice";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

// Sub-components
import { PracticeSelection } from "./components/PracticeSelection";
import { ActiveTest } from "./components/ActiveTest";
import { TestReport } from "./components/TestReport";
import { PracticeHistory } from "./components/PracticeHistory";

type TestState = "selection" | "loading" | "testing" | "reporting";
type SelectionStep = "exams" | "subjects" | "chapters";

const PracticeTest = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<TestState>("selection");
  const isHistoryTab = searchParams.get("tab") === "history";
  
  const [step, setStep] = useState<SelectionStep>("exams");
  const [exams, setExams] = useState<StandardExam[]>([]);
  const [subjects, setSubjects] = useState<StandardSubject[]>([]);
  const [chapters, setChapters] = useState<StandardChapter[]>([]);
  
  const [selectedExam, setSelectedExam] = useState<StandardExam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<StandardSubject | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);

  const [testId, setTestId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [history, setHistory] = useState<PracticeTestType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [report, setReport] = useState<{
    score: number;
    total_questions: number;
    time_taken_sec: number;
    questions: PracticeQuestion[];
  } | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    "Analyzing curriculum standards...",
    "Curating high-quality questions...",
    "Applying difficulty levels...",
    "Generating expert explanations...",
    "Finalizing your practice session...",
    "Almost ready, hang tight!"
  ];

  // Load Exams and Deep-linked Report on mount
  useEffect(() => {
    const init = async () => {
      // 1. Load Exams
      try {
        const data = await fetchStandardExams();
        setExams(data);
      } catch (err) {
        toast.error("Failed to load competitive exams");
      }

      // 2. Check for Deep-linked Report
      const reportId = searchParams.get("reportId");
      if (reportId) {
        handleViewDetails(parseInt(reportId));
      }
    };
    init();
  }, [searchParams]); // Re-run if search params change

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "loading") {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleSubmit = useCallback(async () => {
    if (!testId) return;
    setState("loading");
    
    const formattedAnswers = questions.map(q => ({
      question_id: q.id,
      user_answer: userAnswers[q.id] || null,
      time_spent_sec: timeSpentPerQuestion[q.id] || 0
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

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchPracticeHistory();
      setHistory(data);
    } catch (error: any) {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isHistoryTab && state === "selection") {
      loadHistory();
    }
  }, [isHistoryTab, state, loadHistory]);

  const handleExamSelect = async (exam: StandardExam) => {
    setSelectedExam(exam);
    try {
      const data = await fetchStandardSubjects(exam.id);
      setSubjects(data);
      setStep("subjects");
    } catch (err) {
      toast.error("Failed to load subjects");
    }
  };

  const handleSubjectSelect = async (sub: StandardSubject) => {
    setSelectedSubject(sub);
    try {
      const data = await fetchStandardChapters(sub.id);
      setChapters(data);
      setStep("chapters");
    } catch (err) {
      toast.error("Failed to load chapters");
    }
  };

  const handleStartTest = async () => {
    if (!selectedExam || !selectedSubject) return;
    setState("loading");
    try {
      const data = await generatePracticeTest(selectedExam.code, selectedSubject.name, selectedChapters);
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
      
      // Ensure the header info is available for TestReport
      setSelectedExam({ code: data.exam_type, name: data.exam_type } as any);
      setSelectedSubject({ name: data.subject } as any);

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
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && state === "testing") {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [state, timeLeft, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // 1. LOADING VIEW
  if (state === "loading") {
    return (
      <DashboardLayout title="Processing">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <BookOpen className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-purple-950">{loadingMessages[loadingMessageIndex]}</h3>
            <p className="text-sm text-muted-foreground">Our AI is preparing your unique practice session.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 2. TESTING VIEW
  if (state === "testing") {
    return (
      <DashboardLayout title={`${selectedExam?.code} Practice: ${selectedSubject?.name}`}>
        <ActiveTest
          questions={questions}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          timeLeft={timeLeft}
          onSelectAnswer={(qid, ans) => setUserAnswers({ ...userAnswers, [qid]: ans })}
          onTimeUpdate={(qid, time) => setTimeSpentPerQuestion(prev => ({ ...prev, [qid]: (prev[qid] || 0) + time }))}
          onPrev={() => setCurrentIndex(prev => prev - 1)}
          onNext={() => setCurrentIndex(prev => prev + 1)}
          onSubmit={handleSubmit}
          onJumpToQuestion={(i) => setCurrentIndex(i)}
          onQuit={() => { if (window.confirm("Quit practice? Progress will be lost.")) setState("selection"); }}
          formatTime={formatTime}
        />
      </DashboardLayout>
    );
  }

  // 3. REPORT VIEW
  if (state === "reporting" && report) {
    return (
      <DashboardLayout title="Performance Report">
        <TestReport
          examType={selectedExam?.code || "Test"}
          subject={selectedSubject?.name || "Subject"}
          report={report}
          onRetake={handleStartTest}
          onViewHistory={() => { setState("selection"); setSearchParams({ tab: "history" }); }}
          formatTime={formatTime}
        />
      </DashboardLayout>
    );
  }

  // 4. SELECTION / HISTORY VIEW
  return (
    <DashboardLayout title={isHistoryTab ? "Past Performance" : "Practice Dashboard"}>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-purple-950 tracking-tight">
            {isHistoryTab ? "Your Test History" : "Start New Practice"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isHistoryTab 
              ? "Review your past performance and identify areas for improvement."
              : "Select your target exam and master specific chapters with AI-powered questions."}
          </p>
        </div>

        {isHistoryTab ? (
          <PracticeHistory
            history={history}
            loading={loadingHistory}
            onViewDetails={handleViewDetails}
            onStartNew={() => setSearchParams({ tab: "new" })}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        ) : (
          <PracticeSelection
            step={step}
            exams={exams}
            subjects={subjects}
            chapters={chapters}
            selectedExam={selectedExam}
            selectedSubject={selectedSubject}
            selectedChapters={selectedChapters}
            onExamSelect={handleExamSelect}
            onSubjectSelect={handleSubjectSelect}
            onToggleChapter={(id) => setSelectedChapters(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
            onSelectAllChapters={(ids) => setSelectedChapters(ids)}
            onDeselectAllChapters={() => setSelectedChapters([])}
            onBack={() => setStep(step === "chapters" ? "subjects" : "exams")}
            onStartTest={handleStartTest}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PracticeTest;
