import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Globe, ShieldCheck, MessageSquare, Target, BarChart3, BookOpen } from "lucide-react";
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
      icon: <MessageSquare className="w-5 h-5 text-[#6B4EFF]" />,
      iconBg: "bg-[#EEE9FF]",
      title: "AI Tutor",
      desc: "Personalized help for concept clarity",
    },
    {
      icon: <Target className="w-5 h-5 text-[#22C55E]" />,
      iconBg: "bg-[#E9FBF0]",
      title: "Real-time Correction",
      desc: "Instant error detection with clear explanations",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-[#F59E0B]" />,
      iconBg: "bg-[#FEF3C7]",
      title: "Score Predictor",
      desc: "AI predicts your scores based on performance",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-[#6B4EFF]" />,
      iconBg: "bg-[#EEE9FF]",
      title: "Test Prep",
      desc: "NEET & IIT prep with tests and detailed analysis",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F8] font-['Inter',system-ui,sans-serif]">
      {/* Top sticky tagline bar */}
      <div className="w-full bg-[#F0F2F8] py-2 px-4 text-center text-xs text-gray-500 tracking-wide border-b border-gray-200">
        Concept Mastery. Real-Time Correction. Predictable Scores.
      </div>

      {/* ── NAVBAR ── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-[#F0F2F8]">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-[#e9a4fa] rounded-xl flex items-center justify-center">
            <img
              src="/figmaAssets/logo.png"
              alt="Cloop Logo"
              className="w-7 h-auto"
            />
          </div>
          <span className="text-[#1a0a3c] font-bold text-2xl tracking-tight">Cloop</span>
        </div>

        {/* Beta pill */}
        <div className="flex items-center gap-2 bg-white border border-[#d0c8f5] text-[#6B4EFF] rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
          <span className="text-base">🧪</span>
          Beta – Free During Testing
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="flex flex-col items-center px-5 pt-0 pb-10">
        {/* Main headline */}
        <div className="-mt-16 text-center max-w-xl mb-2 animate-fade-up" style={{ "--animation-delay": "0s" } as React.CSSProperties}>
          <h1 className="text-[2rem] md:text-[2.5rem] font-extrabold text-[#1a0a3c] leading-tight tracking-tight">
            Concept mastery powered<br />
            by{" "}
            <span className="text-[#6B4EFF]">real-time correction</span>
          </h1>
          <p className="mt-3 text-gray-500 text-[15px] md:text-base font-medium">
            AI Tutor for Class 8–12 &bull; Score Predictor &bull; Test Prep for NEET &amp; IIT
          </p>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-4 mb-6 animate-fade-up" style={{ "--animation-delay": "0.1s" } as React.CSSProperties}>
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 ${f.iconBg} rounded-xl flex items-center justify-center`}>
                {f.icon}
              </div>
              <p className="text-[#1a0a3c] font-semibold text-sm leading-snug">{f.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── LOGIN CARD ── */}
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 px-8 py-8 animate-fade-up"
          style={{ "--animation-delay": "0.2s" } as React.CSSProperties}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#1a0a3c]">Welcome back!</h2>
            <p className="text-gray-400 text-sm mt-1">Enter your Guest ID or email to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Guest ID field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Guest ID / Registered Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="guest-id"
                  type="text"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]/30 focus:border-[#6B4EFF] transition"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Login CTA */}
            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#6B4EFF] hover:bg-[#5a3de0] text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? "Redirecting…" : "Continue to Learning Dashboard"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500">
              New to Cloop?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#6B4EFF] font-semibold hover:underline"
              >
                Start Free
              </button>
            </p>
          </form>
        </div>

        {/* ── VISIT STRIP ── */}
        <div className="mt-10 flex flex-col items-center gap-3 animate-fade-up" style={{ "--animation-delay": "0.3s" } as React.CSSProperties}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <Globe className="w-5 h-5 text-[#6B4EFF]" />
          </div>
          <p className="text-gray-500 text-sm">
            Visit website:{" "}
            <a
              href="https://www.cloopapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B4EFF] font-semibold hover:underline"
            >
              www.cloopapp.com
            </a>
          </p>
          <p className="flex items-center gap-1.5 text-gray-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Your data is safe with us. Privacy by design.
          </p>
        </div>
      </main>

      {/* ── FULL FOOTER ── */}
      <div className="bg-white border-t border-gray-100">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
