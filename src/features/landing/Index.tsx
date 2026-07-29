import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Globe, ShieldCheck, MessageSquare, Target, BarChart3, BookOpen, GraduationCap, Trophy, Brain, Sparkles } from "lucide-react";
import { Footer } from "./sections/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [guestId, setGuestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const value = guestId.trim();
    if (!value) {
      setError("Please enter your Guest ID or Registered Email.");
      return;
    }

    try {
      setIsLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrPhone: value }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.error || `Login failed (${response.status})`;
        setError(message);
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      localStorage.setItem("cloop_token", result.token);
      localStorage.setItem("cloop_user", JSON.stringify(result.user));
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5 text-black" />,
      iconBg: "bg-zinc-100",
      title: "AI Tutor",
      desc: "Personalized help for concept clarity",
      tags: ["24/7", "Doubts"],
    },
    {
      icon: <Target className="w-5 h-5 text-[#22C55E]" />,
      iconBg: "bg-[#E9FBF0]",
      title: "Real-time Correction",
      desc: "Instant error detection with clear explanations",
      tags: ["Live", "Feedback"],
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-[#F59E0B]" />,
      iconBg: "bg-[#FEF3C7]",
      title: "Score Predictor",
      desc: "AI predicts your scores based on performance",
      tags: ["Analytics", "Insights"],
    },
    {
      icon: <Globe className="w-5 h-5 text-black" />,
      iconBg: "bg-zinc-100",
      title: "Multilingual Support",
      desc: "Available in 10 languages",
      tags: ["English", "Regional"],
    },
  ];

  const gradeLevels = [
    { label: "CBSE", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "ICSE", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "State Board", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "IGCSE", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "JEE", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "NEET", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "KCET", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "CET", icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F8] font-['Inter',system-ui,sans-serif]">
      {/* Top sticky tagline bar */}
      <div className="w-full bg-[#F0F2F8] py-2 px-4 text-center text-[11px] sm:text-xs text-gray-500 tracking-wide border-b border-gray-200">
        <span>Conversations • Real-Time Correction • Concept Mastery • Score Prediction</span>
      </div>

      {/* ── NAVBAR ── */}
      <header className="flex items-center justify-between px-4 md:px-10 py-3 md:py-4 bg-[#F0F2F8]">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <img
              src="/figmaAssets/logo.png"
              alt="Cloop Logo"
              className="w-7 h-auto"
            />
          </div>
          <span className="text-[#1a0a3c] font-bold text-xl md:text-2xl tracking-tight">Cloop</span>
        </div>

        {/* Beta pill */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-white border border-zinc-300 text-black rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium shadow-sm whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-black" />
          <span className="hidden sm:inline">Beta –</span> Free
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="flex flex-col items-center px-4 md:px-5 pt-4 md:pt-6 pb-6 md:pb-10">
        {/* Main headline */}
        <div className="text-center max-w-xl mb-4 md:mb-6 animate-fade-up" style={{ "--animation-delay": "0s" } as React.CSSProperties}>
          <h1 className="text-[1.75rem] md:text-[2.5rem] font-extrabold text-[#1a0a3c] leading-tight tracking-tight">
            Master your subjects<br />
            with{" "}
            <span className="text-black underline underline-offset-4 decoration-zinc-400">AI-powered learning</span>
          </h1>
          <p className="mt-2 md:mt-3 text-gray-500 text-sm md:text-base font-medium">
            For Classes 5-12 and Competitive Exam Preparation
          </p>
          
          {/* Grade Level Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 max-w-lg mx-auto">
            {gradeLevels.map((grade, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white border border-zinc-200 text-zinc-900 rounded-full text-[11px] sm:text-xs font-medium shadow-sm"
              >
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                {grade.label}
              </span>
            ))}
          </div>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl mb-6 animate-fade-up" style={{ "--animation-delay": "0.1s" } as React.CSSProperties}>
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col gap-1.5 md:gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-8 h-8 md:w-9 md:h-9 ${f.iconBg} rounded-lg md:rounded-xl flex items-center justify-center shrink-0`}>
                {f.icon}
              </div>
              <p className="text-[#1a0a3c] font-semibold text-xs md:text-sm leading-snug">{f.title}</p>
              <p className="text-gray-400 text-[11px] md:text-xs leading-relaxed hidden md:block">{f.desc}</p>
              {/* Tags */}
              <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-auto">
                {f.tags.map((tag, j) => (
                  <span
                    key={j}
                    className={`text-[9px] sm:text-[10px] md:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                      f.iconBg === "bg-zinc-100"
                        ? "bg-zinc-100 text-zinc-900"
                        : f.iconBg === "bg-[#E9FBF0]"
                        ? "bg-green-50 text-green-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── LOGIN CARD ── */}
        <div
          className="w-full max-w-md bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 px-5 md:px-8 py-6 md:py-8 animate-fade-up"
          style={{ "--animation-delay": "0.2s" } as React.CSSProperties}
        >
          {/* Sign Up Section for New Users */}
          <div className="text-center mb-5">
            <h2 className="text-base md:text-lg font-bold text-[#1a0a3c]">New to Cloop?</h2>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-3 w-full py-3 md:py-3.5 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Sign Up
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or already have an account?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Sign In Section */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 md:gap-5">
            <div className="text-center mb-2">
              <h3 className="text-base font-bold text-[#1a0a3c]">Sign In</h3>
              <p className="text-gray-400 text-xs mt-1">Enter your Guest ID or email to continue learning.</p>
            </div>

            {/* Guest ID field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs md:text-sm font-medium text-gray-700">
                Guest ID / Registered Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="guest-id"
                  type="text"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs md:text-sm p-3 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Login CTA */}
            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-3.5 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? "Redirecting…" : "Continue Learning"}
            </button>
          </form>
        </div>

        {/* ── VISIT STRIP ── */}
        <div className="mt-6 md:mt-10 flex flex-col items-center gap-2 md:gap-3 animate-fade-up" style={{ "--animation-delay": "0.3s" } as React.CSSProperties}>
          <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <Globe className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </div>
          <p className="text-gray-500 text-xs md:text-sm">
            Visit website:{" "}
            <a
              href="https://www.cloopapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black font-semibold hover:underline"
            >
              www.cloopapp.com
            </a>
          </p>
          <p className="flex items-center gap-1.5 text-gray-400 text-xs">
            <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
            Your data is safe with us. Privacy by design.
          </p>
        </div>
      </main>

      {/* ── FULL FOOTER ── */}
      <div className="bg-white border-t border-gray-100 mt-4 md:mt-6">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
