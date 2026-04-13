import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cloopLogo from "@/assets/cloop-logo.png";
import { getSignupOptions, signupUser, SignupOptions } from "@/lib/api/signup";

type QuestionType = "text" | "single-choice" | "multi-choice";
interface QuestionOption { label: string; value: string; }
interface Question {
  key: string;
  bot: string;
  required: boolean;
  type: QuestionType;
  options?: QuestionOption[];
  answer?: string | string[];
}

interface SignupFormData {
  name?: string;
  email?: string;
  phone?: string;
  grade_level?: string;
  board?: string;
  subjects?: string[];
  preferred_language?: string;
  study_goal?: string;
}

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
  type?: "error" | "warning";
};

const getQuestionsTemplate = (): Question[] => [
  { key: "name", bot: "Welcome! To get started, what is your full name?", required: true, type: "text" },
  { key: "grade_level", bot: "Great! Which class/grade are you studying in?", required: true, type: "single-choice" },
  { key: "board", bot: "Select the board/school system you follow.", required: true, type: "single-choice" },
  { key: "subjects", bot: "Pick your subjects (choose one or more).", required: false, type: "multi-choice" },
  { key: "preferred_language", bot: "Preferred language for lessons?", required: false, type: "single-choice" },
  { key: "study_goal", bot: "What is your main study goal?", required: false, type: "single-choice", options: [
      { label: "Improve grades", value: "improve_grades" },
      { label: "Quick revision", value: "quick_revision" },
      { label: "Exam preparation", value: "exam_preparation" },
      { label: "General knowledge", value: "general_knowledge" },
    ]
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<SignupOptions | null>(null);
  const [questions, setQuestions] = useState<Question[]>(getQuestionsTemplate());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<SignupFormData>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [generatedGuestId, setGeneratedGuestId] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex] || null;

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await getSignupOptions();
        setOptions(data);

        const updated = getQuestionsTemplate().map((q) => {
          if (q.key === "grade_level") {
            return { ...q, options: data.grades.map((g) => ({ label: g, value: g })) };
          }
          if (q.key === "board") {
            return { ...q, options: data.boards.map((b) => ({ label: b.name, value: String(b.id) })) };
          }
          if (q.key === "subjects") {
            return { ...q, options: data.subjects.map((s) => ({ label: s.name, value: String(s.id) })) };
          }
          if (q.key === "preferred_language") {
            return { ...q, options: data.languages.map((l) => ({ label: l.name, value: String(l.id) })) };
          }
          return q;
        });

        setQuestions(updated);
        setMessages([{ id: Date.now(), sender: "bot", text: updated[0].bot }]);
      } catch (err) {
        console.error(err);
        setError("Unable to load signup options. Please try again.");
      }
    };

    loadOptions();
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const addMessage = (message: ChatMessage) => setMessages((prev) => [...prev, message]);

  const showNextQuestion = (nextIndex: number) => {
    if (nextIndex >= questions.length) {
      submitSignup();
      return;
    }

    setCurrentIndex(nextIndex);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ id: Date.now(), sender: "bot", text: questions[nextIndex].bot });
    }, 600);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    const trimmed = inputValue.trim();
    if (!trimmed && currentQuestion.required) {
      setError("Please provide an answer before proceeding.");
      return;
    }

    setError("");
    if (trimmed) {
      addMessage({ id: Date.now() + 1, sender: "user", text: trimmed });
      setFormData((f) => ({ ...f, [currentQuestion.key]: trimmed }));
    }

    setInputValue("");
    showNextQuestion(currentIndex + 1);
  };

  const handleOptionSelect = (option: QuestionOption) => {
    if (!currentQuestion) return;
    addMessage({ id: Date.now() + 1, sender: "user", text: option.label });
    if (currentQuestion.type === "multi-choice") {
      const prev = formData[currentQuestion.key] || [];
      const next = (prev as string[]).includes(option.value)
        ? (prev as string[]).filter((v) => v !== option.value)
        : [...(prev as string[]), option.value];
      setFormData((f) => ({ ...f, [currentQuestion.key]: next }));
      return;
    }
    setFormData((f) => ({ ...f, [currentQuestion.key]: option.value }));
    showNextQuestion(currentIndex + 1);
  };

  const currentMultiSelection = (currentQuestion && currentQuestion.type === "multi-choice")
    ? (formData[currentQuestion.key] as string[] || [])
    : [];

  const handleMultiChoiceContinue = () => {
    if (!currentQuestion) return;
    addMessage({ id: Date.now() + 1, sender: "user", text: currentMultiSelection.length ? "Subjects selected" : "No subjects" });
    showNextQuestion(currentIndex + 1);
  };

  const submitSignup = async () => {
    setIsLoading(true);
    setIsTyping(true);
    addMessage({ id: Date.now() + 1, sender: "bot", text: "Submitting your information..." });

    const payload = {
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      grade_level: formData.grade_level || "",
      board: formData.board || "",
      subjects: formData.subjects || [],
      preferred_language: formData.preferred_language || "",
      study_goal: formData.study_goal || "",
    };

    try {
      const result = await signupUser(payload);
      const guestId = result?.guestId || `GUEST-${Math.floor(10000 + Math.random() * 90000)}`;
      setGeneratedGuestId(guestId);
      setHasCompleted(true);
      setIsTyping(false);
      addMessage({ id: Date.now() + 2, sender: "bot", text: `🎉 Signup successful! Your User ID is: ${guestId}` });
      addMessage({ id: Date.now() + 3, sender: "bot", text: "⚠️ Save this ID! You'll need it to login next time." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      console.error(err);
      setError(message);
      addMessage({ id: Date.now() + 2, sender: "bot", text: message, type: "error" });
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isOptionsLoaded = !!options;

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h1 className="text-4xl font-bold mb-4">Start learning today!</h1>
          <p className="text-primary-foreground/80 text-lg">Join 50,000+ learners mastering new skills every day.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 max-w-3xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-foreground">
            <img src={cloopLogo} alt="Cloop" width={32} height={32} />
            Cloop Signup
          </Link>
        </div>

        <div className="flex-1 rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gray-50">
            <h2 className="text-xl font-semibold">Chat Signup</h2>
            <p className="text-sm text-muted-foreground">Complete signup through quick chat prompts.</p>
          </div>

          <div className="h-[65vh] overflow-y-auto p-4" style={{ minHeight: "300px" }}>
            {!isOptionsLoaded && !error && (
              <p className="text-sm text-muted-foreground">Loading signup questions...</p>
            )}

            {error && <p className="text-sm text-destructive mb-3">{error}</p>}

            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 max-w-[85%] ${msg.sender === "bot" ? "text-left" : "text-right ml-auto"}`}>
                <div className={`inline-block rounded-xl px-4 py-2 ${msg.sender === "bot" ? "bg-gray-100 text-gray-900" : "bg-primary text-white"}`}> 
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && <p className="text-sm text-muted-foreground">Typing...</p>}

            <div ref={scrollRef} />
          </div>

          <div className="border-t border-border bg-white p-4">
            {!currentQuestion && hasCompleted && (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-success mb-4">🎉 Signup Complete!</p>
                <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your User ID:</p>
                  <p className="text-2xl font-bold text-purple-700 mb-3">{generatedGuestId}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedGuestId)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">⚠️ Save this ID! You'll need it to login next time.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 hero-gradient text-white rounded-lg"
                >
                  Go to Login →
                </button>
              </div>
            )}

            {!currentQuestion && !hasCompleted && (
              <p className="text-sm text-muted-foreground">Loading questions...</p>
            )}

            {currentQuestion && !hasCompleted && (
              <div className="space-y-3">
                {currentQuestion.type === "text" && (
                  <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <input
                      aria-label="Your answer"
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your answer..."
                      className="flex-1 rounded-xl border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    />
                    <Button type="submit" className="min-w-fit" disabled={isLoading || !inputValue.trim()}>
                      Send
                    </Button>
                  </form>
                )}

                {(currentQuestion.type === "single-choice" || currentQuestion.type === "multi-choice") && (
                  <div className="grid grid-cols-2 gap-2">
                    {currentQuestion.options?.map((opt) => {
                      const selected = currentQuestion.type === "multi-choice" && currentMultiSelection.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleOptionSelect(opt)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm ${selected ? "bg-primary text-white" : "bg-white text-gray-800"}`}
                          disabled={isLoading}
                        >
                          {opt.label}
                        </button>
                      );
                    })}

                    {currentQuestion.type === "multi-choice" && currentMultiSelection.length > 0 && (
                      <div className="col-span-2 mt-2 flex flex-wrap gap-2">
                        {currentMultiSelection.map((value) => {
                          const option = currentQuestion.options?.find((opt) => opt.value === value);
                          if (!option) return null;
                          return (
                            <span key={value} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs">
                              {option.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {currentQuestion.type === "multi-choice" && (
                      <div className="col-span-2 mt-2">
                        <Button type="button" onClick={handleMultiChoiceContinue} disabled={isLoading}>
                          Continue
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
