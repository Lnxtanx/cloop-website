import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Target, ShieldCheck, ClipboardCheck } from "lucide-react";
import { getSignupOptions, signupUser, SignupOptions } from "@/lib/api/signup";
import { Footer } from "../landing/sections/Footer";
import { DownloadAppSection } from "../landing/sections/DownloadAppSection";

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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <DownloadAppSection />
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Side - Visual Hero */}
        <div className="hidden lg:flex flex-1 bg-[linear-gradient(137deg,rgba(104,59,218,1)_0%,rgba(180,129,230,1)_100%)] items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="text-white max-w-lg relative z-10 text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-sm font-bold mb-8 border border-white/30">
              <Sparkles className="w-4 h-4" /> Start Learning Today
            </div>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Join 50,000+ Students Mastering New Skills
            </h1>
            <p className="text-white/90 text-xl leading-relaxed mb-10">
              Unlock your potential with our AI-powered learning platform. Personalised for your curriculum.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <Brain className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-bold">AI Tutoring</div>
                  <div className="text-xs opacity-70">24/7 Availability</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <Target className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-bold">Score Goals</div>
                  <div className="text-xs opacity-70">Improvement Tracked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex flex-col p-6 lg:p-12 bg-white mx-auto w-full">
          <div className="flex-1 flex flex-col rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/50 overflow-hidden min-h-[500px]">
            <div className="px-6 py-5 border-b border-purple-50 bg-purple-50/50">
              <h2 className="text-xl font-bold text-gray-900">Chat Signup</h2>
              <p className="text-sm text-gray-500 font-medium">Complete signup through quick chat prompts.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: "450px" }}>
              {!isOptionsLoaded && !error && (
                <div className="flex items-center gap-2 text-purple-600 animate-pulse">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                  <p className="text-sm font-medium">Loading signup questions...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {error}
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"} animate-fade-in`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-base font-medium shadow-sm ${
                    msg.sender === "bot" 
                      ? "bg-gray-100 text-gray-900 rounded-tl-none" 
                      : "bg-[#8d33ff] text-white rounded-tr-none shadow-[#8d33ff]/20"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 text-gray-400 pl-2">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            <div className="border-t border-purple-50 bg-white p-6">
              {!currentQuestion && hasCompleted && (
                <div className="text-center py-4 animate-scale-in">
                  <p className="text-2xl font-bold text-green-600 mb-6 flex items-center justify-center gap-2">
                    <ClipboardCheck className="w-6 h-6" /> Signup Complete!
                  </p>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-[32px] p-8 mb-8 shadow-inner">
                    <p className="text-sm font-bold text-purple-900 mb-3 uppercase tracking-wider">Your Unique User ID</p>
                    <p className="text-4xl font-black text-[#8d33ff] mb-6 tracking-tight">{generatedGuestId}</p>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedGuestId);
                        toast.success("ID Copied!");
                      }}
                      variant="outline"
                      className="rounded-xl border-purple-200 text-purple-700 font-bold hover:bg-purple-100"
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-8 max-w-xs mx-auto">
                    ⚠️ Save this ID! You'll need it to login to your dashboard next time.
                  </p>
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-14 bg-[#8d33ff] hover:bg-[#7a2de0] text-white rounded-2xl text-lg font-black shadow-xl shadow-purple-200"
                  >
                    Go to Login Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}

              {currentQuestion && !hasCompleted && (
                <div className="space-y-4">
                  {currentQuestion.type === "text" && (
                    <form onSubmit={handleTextSubmit} className="flex gap-3">
                      <input
                        aria-label="Your answer"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 h-12 rounded-xl border border-gray-200 px-4 focus:outline-none focus:ring-2 focus:ring-[#8d33ff] focus:border-transparent font-medium"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        className="h-12 px-8 bg-[#8d33ff] hover:bg-[#7a2de0] rounded-xl font-black shadow-lg shadow-purple-100" 
                        disabled={isLoading || !inputValue.trim()}
                      >
                        Send
                      </Button>
                    </form>
                  )}

                  {(currentQuestion.type === "single-choice" || currentQuestion.type === "multi-choice") && (
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options?.map((opt) => {
                        const selected = currentQuestion.type === "multi-choice" && currentMultiSelection.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleOptionSelect(opt)}
                            className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-black transition-all ${
                              selected 
                                ? "bg-[#8d33ff] text-white border-[#8d33ff] shadow-lg shadow-purple-200" 
                                : "bg-white text-gray-700 border-gray-100 hover:border-purple-200 hover:bg-purple-50"
                            }`}
                            disabled={isLoading}
                          >
                            {opt.label}
                          </button>
                        );
                      })}

                      {currentQuestion.type === "multi-choice" && (
                        <div className="col-span-2 mt-2">
                          <Button 
                            type="button" 
                            onClick={handleMultiChoiceContinue} 
                            disabled={isLoading}
                            className="w-full h-12 bg-[#8d33ff] hover:bg-[#7a2de0] rounded-xl font-black"
                          >
                            Continue with Selected Subjects
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Signup;
