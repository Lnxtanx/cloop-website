import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { BookOpen } from "lucide-react";
import {
  fetchStandardExams,
  fetchStandardSubjects,
  fetchStandardChapters,
  generatePracticeTest,
  submitPracticeTest,
  fetchPracticeHistory,
  fetchPracticeTestDetails,
  StandardExam,
  StandardSubject,
  StandardChapter,
  PracticeQuestion
} from "@/lib/api/practice";
import { PracticeSelection } from "./components/PracticeSelection";
import { ActiveTest } from "./components/ActiveTest";
import { TestReport } from "./components/TestReport";
import { PracticeHistory } from "./components/PracticeHistory";

type TestState = "selection" | "loading" | "testing" | "reporting";

const loadingMessages = [
  "Gathering curriculum standards...",
  "Analyzing your historical weak points...",
  "Synthesizing high-yield questions...",
  "Calibrating difficulty vector...",
  "Finalizing practice environment..."
];

export const PracticeTest = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const reportIdParam = searchParams.get("reportId");

  const [state, setState] = useState<TestState>("selection");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Selection States
  const [step, setStep] = useState<"exams" | "subjects" | "chapters">("exams");
  const [exams, setExams] = useState<StandardExam[]>([]);
  const [subjects, setSubjects] = useState<StandardSubject[]>([]);
  const [chapters, setChapters] = useState<StandardChapter[]>([]);

  const [selectedExam, setSelectedExam] = useState<StandardExam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<StandardSubject | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);

  // Testing States
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testId, setTestId] = useState<number | null>(null);

  // Reporting States
  const [report, setReport] = useState<{
    score: number;
    total_questions: number;
    time_taken_sec: number;
    questions: PracticeQuestion[];
  } | null>(null);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isHistoryTab = activeTabParam === "history";

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (!token) navigate("/");
  }, [navigate]);

  // Load initial exams or history based on tab
  useEffect(() => {
    if (isHistoryTab) {
      loadHistory();
    } else {
      loadExams();
    }
  }, [isHistoryTab]);

  // Load deep-linked report card if URL contains reportId
  useEffect(() => {
    if (reportIdParam) {
      const id = Number(reportIdParam);
      if (!isNaN(id)) {
        fetchReportCard(id);
      }
    }
  }, [reportIdParam]);

  const loadExams = async () => {
    try {
      const data = await fetchStandardExams();
      setExams(data);
    } catch (err) {
      console.error("Failed to load exams", err);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchPracticeHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchReportCard = async (reportId: number) => {
    try {
      setState("loading");
      const rep = await fetchPracticeTestDetails(reportId);
      setReport({
        score: rep.score || 0,
        total_questions: rep.total_questions || 0,
        time_taken_sec: rep.time_taken_sec || 0,
        questions: rep.questions || []
      });
      setTestId(reportId);
      setState("reporting");
    } catch (err) {
      console.error("Failed to fetch report", err);
      setState("selection");
    }
  };

  const handleExamSelect = async (exam: StandardExam) => {
    setSelectedExam(exam);
    setStep("subjects");
    try {
      const data = await fetchStandardSubjects(exam.id);
      setSubjects(data);
    } catch (err) {
      console.error("Failed to load subjects", err);
    }
  };

  const handleSubjectSelect = async (subject: StandardSubject) => {
    setSelectedSubject(subject);
    setStep("chapters");
    try {
      const data = await fetchStandardChapters(subject.id);
      setChapters(data);
    } catch (err) {
      console.error("Failed to load chapters", err);
    }
  };

  const handleStartTest = async () => {
    if (!selectedExam || !selectedSubject || selectedChapters.length === 0) return;

    setState("loading");
    setLoadingMessageIndex(0);

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    try {
      const session = await generatePracticeTest(
        selectedExam.code,
        selectedSubject.name,
        selectedChapters
      );
      clearInterval(interval);
      setTestId(session.test_id);
      setQuestions(session.questions);
      setCurrentIndex(0);
      setUserAnswers({});
      setTimeSpentPerQuestion({});
      setTimeLeft(session.time_limit_sec || 10 * 60);
      setState("testing");
    } catch (err) {
      clearInterval(interval);
      console.error("Failed to create test session", err);
      alert("Failed to create practice session. Please try again.");
      setState("selection");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!testId) return;

    setState("loading");
    setLoadingMessageIndex(0);

    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      user_answer: userAnswers[q.id] || null
    }));

    const totalTimeSpent = Object.values(timeSpentPerQuestion).reduce((a, b) => a + b, 0);

    try {
      const result = await submitPracticeTest(
        testId,
        answersPayload,
        totalTimeSpent
      );
      setReport(result);
      setSearchParams({ reportId: testId.toString() });
      setState("reporting");
    } catch (err) {
      console.error("Failed to submit answers", err);
      alert("Failed to calculate report. Please try again.");
      setState("testing");
    }
  }, [testId, questions, userAnswers, timeSpentPerQuestion, setSearchParams]);

  const handleViewDetails = (reportId: number) => {
    setSearchParams({ reportId: reportId.toString() });
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] space-y-6 sm:space-y-8 px-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center px-4">{loadingMessages[loadingMessageIndex]}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Our AI is preparing your unique practice session.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 2. TESTING VIEW
  if (state === "testing") {
    return (
      <DashboardLayout title={`${selectedExam?.code} Practice`}>
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
          reportId={testId || Number(searchParams.get("reportId"))}
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
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-12 px-2 sm:px-4">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {isHistoryTab ? "Your Test History" : "Test Preparation Engine"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            {isHistoryTab
              ? "Review your past performance and identify areas for improvement."
              : "Practice with purpose. Every test improves your concept clarity and predicted score"}
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
