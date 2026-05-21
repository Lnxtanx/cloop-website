import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronLeft, Sparkles } from "lucide-react";
import { getSignupOptions, signupUser, SignupOptions } from "@/lib/api/signup";

type QuestionType = "text" | "single-choice" | "multi-choice";
interface QuestionOption { label: string; value: string; }
interface Question {
  key: string;
  bot: string;
  required: boolean;
  type: QuestionType;
  options?: QuestionOption[];
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
  type?: "error" | "warning" | "success";
};

const getQuestionsTemplate = (): Question[] => [
  { key: "name", bot: "Welcome to Cloop! 👋\n\nWhat's your name?", required: true, type: "text" },
  { key: "grade_level", bot: "Nice to meet you! 🎓\n\nWhich class/grade are you in?", required: true, type: "single-choice" },
  { key: "board", bot: "Great! Which board do you follow?", required: true, type: "single-choice" },
  { key: "subjects", bot: "Pick the subjects you want to learn (select all that apply)", required: false, type: "multi-choice" },
  { key: "preferred_language", bot: "What's your preferred language for learning?", required: false, type: "single-choice" },
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIndex] || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
            const targetLanguages = [
              { code: "EN", label: "English", value: "2" },
              { code: "HI", label: "Hindi (हिन्दी)", value: "1" },
              { code: "MR", label: "Marathi (मराठी)", value: "marathi" },
              { code: "KN", label: "Kannada (ಕನ್ನಡ)", value: "kannada" },
              { code: "TA", label: "Tamil (தமிழ்)", value: "4" },
              { code: "TE", label: "Telugu (తెలుగు)", value: "5" },
              { code: "ML", label: "Malayalam (മലയാളം)", value: "malayalam" },
              { code: "MN", label: "Manipuri (मणिपुरी)", value: "manipuri" },
              { code: "BN", label: "Bengali (বাংলা)", value: "3" },
              { code: "GU", label: "Gujarati (ગુજરાતી)", value: "gujarati" },
              { code: "PA", label: "Punjabi (ਪੰਜਾਬੀ)", value: "punjabi" },
              { code: "OR", label: "Odia (ଓଡ଼ିଆ)", value: "odia" },
              { code: "AS", label: "Assamese (অসমীয়া)", value: "assamese" },
              { code: "UR", label: "Urdu (اردو)", value: "urdu" },
              { code: "SA", label: "Sanskrit (संस्कृतम्)", value: "sanskrit" },
            ];
            const mappedOptions = targetLanguages.map((t) => {
              const dbLang = data.languages.find(
                (l) => l.code.toUpperCase() === t.code.toUpperCase()
              );
              return {
                label: t.label,
                value: dbLang ? String(dbLang.id) : t.value,
              };
            });
            return { ...q, options: mappedOptions };
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
      inputRef.current?.focus();
    }, 500);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || isLoading) return;

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
    if (!currentQuestion || isLoading) return;
    
    if (currentQuestion.type === "multi-choice") {
      const prev = (formData[currentQuestion.key] as string[]) || [];
      const next = prev.includes(option.value)
        ? prev.filter((v) => v !== option.value)
        : [...prev, option.value];
      setFormData((f) => ({ ...f, [currentQuestion.key]: next }));
      return;
    }

    addMessage({ id: Date.now() + 1, sender: "user", text: option.label });
    setFormData((f) => ({ ...f, [currentQuestion.key]: option.value }));
    showNextQuestion(currentIndex + 1);
  };

  const handleSelectAll = () => {
    if (!currentQuestion || currentQuestion.type !== "multi-choice" || !currentQuestion.options || isLoading) return;
    
    const allValues = currentQuestion.options.map(opt => opt.value);
    const areAllSelected = allValues.every(val => currentMultiSelection.includes(val));
    
    if (areAllSelected) {
      setFormData((f) => ({ ...f, [currentQuestion.key]: [] }));
    } else {
      setFormData((f) => ({ ...f, [currentQuestion.key]: allValues }));
    }
  };

  const currentMultiSelection = currentQuestion?.type === "multi-choice"
    ? (formData[currentQuestion.key] as string[]) || []
    : [];

  const handleMultiChoiceContinue = () => {
    if (!currentQuestion || isLoading) return;
    const selectedCount = currentMultiSelection.length;
    addMessage({ 
      id: Date.now() + 1, 
      sender: "user", 
      text: selectedCount > 0 ? `Selected ${selectedCount} subject${selectedCount > 1 ? 's' : ''}` : "Skip for now" 
    });
    showNextQuestion(currentIndex + 1);
  };

  const submitSignup = async () => {
    setIsLoading(true);
    setIsTyping(true);
    addMessage({ id: Date.now() + 1, sender: "bot", text: "Setting up your account..." });

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
      addMessage({ id: Date.now() + 2, sender: "bot", text: "🎉 You're all set!", type: "success" });
      addMessage({ id: Date.now() + 3, sender: "bot", text: `Your User ID is:\n\n**${guestId}**\n\nSave this ID to login next time.`, type: "success" });
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedGuestId);
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col safe-area-inset">
      {/* Minimal Header - ChatGPT style */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>
        
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="Cloop Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-gray-900 text-lg">Cloop</span>
        </Link>

        <Link 
          to="/login" 
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Log in
        </Link>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Loading State */}
          {!isOptionsLoaded && !error && (
            <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              </div>
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {/* Error State */}
          {error && !messages.length && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl">
              {error}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] md:max-w-[75%] ${
                  msg.sender === "bot"
                    ? "bg-gray-100 text-gray-900 rounded-2xl sm:rounded-3xl rounded-bl-md px-3.5 sm:px-4 py-2.5 sm:py-3"
                    : "bg-purple-600 text-white rounded-2xl sm:rounded-3xl rounded-br-md px-3.5 sm:px-4 py-2.5 sm:py-3"
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text.includes("**") ? (
                    msg.text.split("**").map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="font-bold">{part}</strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )
                  ) : (
                    msg.text
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1 text-gray-400 pl-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
            </div>
          )}

          {/* Completion State - User ID Card */}
          {hasCompleted && (
            <div className="pt-4 animate-fade-in">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Your User ID
                </p>
                <p className="text-2xl sm:text-3xl font-black text-purple-900 mb-3 sm:mb-4 tracking-tight break-all">
                  {generatedGuestId}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-purple-200 rounded-xl font-semibold text-purple-700 hover:bg-purple-50 transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4" />
                  Copy ID
                </button>
                <p className="text-[11px] sm:text-xs text-purple-600 mb-4 sm:mb-6">
                  ⚠️ Save this ID to login next time
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-11 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base"
                >
                  Continue to Login
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input/Options Area - Fixed at Bottom */}
      {!hasCompleted && currentQuestion && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white pb-safe">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {/* Text Input */}
            {currentQuestion.type === "text" && (
              <form onSubmit={handleTextSubmit} className="flex gap-2 sm:gap-3">
                <input
                  ref={inputRef}
                  aria-label="Your answer"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all text-sm sm:text-base"
                  disabled={isLoading || !isOptionsLoaded}
                  autoFocus
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 shrink-0"
                  disabled={isLoading || !inputValue.trim() || !isOptionsLoaded}
                  aria-label="Send"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </form>
            )}

            {/* Single/Multi Choice Options */}
            {(currentQuestion.type === "single-choice" || currentQuestion.type === "multi-choice") && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 justify-center items-center max-h-[40vh] overflow-y-auto px-1">
                  {currentQuestion.type === "multi-choice" && currentQuestion.options && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 ${
                        currentQuestion.options.length > 0 && currentQuestion.options.every(opt => currentMultiSelection.includes(opt.value))
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                          : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
                      }`}
                      disabled={isLoading}
                    >
                      {currentQuestion.options.length > 0 && currentQuestion.options.every(opt => currentMultiSelection.includes(opt.value)) ? "✓ Deselect All" : "Select All"}
                    </button>
                  )}
                  {currentQuestion.options?.map((opt) => {
                    const selected = currentQuestion.type === "multi-choice" && currentMultiSelection.includes(opt.value);
                    
                    let isComingSoon = false;
                    if (currentQuestion.key === "board") {
                      isComingSoon = opt.value === "3" || opt.label.toLowerCase().includes("state");
                    } else if (currentQuestion.key === "preferred_language") {
                      isComingSoon = opt.value !== "2" && !opt.label.toLowerCase().startsWith("english");
                    }

                    if (isComingSoon) {
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled
                          className="px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-2xl bg-gray-50 border border-gray-200 text-gray-400 opacity-60 cursor-not-allowed select-none text-center flex flex-col items-center justify-center shrink-0 min-h-[50px]"
                        >
                          <span className="text-xs sm:text-sm font-medium leading-tight">{opt.label}</span>
                          <span className="text-[8px] text-gray-400 font-normal mt-0.5 leading-none">Coming soon</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleOptionSelect(opt)}
                        className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[38px] flex items-center justify-center ${
                          selected
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                        }`}
                        disabled={isLoading}
                      >
                        {opt.label}
                        {selected && <Check className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.type === "multi-choice" && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleMultiChoiceContinue}
                      disabled={isLoading}
                      className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 font-semibold text-sm sm:text-base"
                    >
                      {currentMultiSelection.length > 0
                        ? `Continue with ${currentMultiSelection.length} selected`
                        : "Skip for now"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div className="mt-4 flex justify-center gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex 
                      ? "w-6 bg-purple-600" 
                      : idx < currentIndex 
                        ? "w-1.5 bg-purple-300" 
                        : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
