import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, ShieldCheck, Brain, Target } from "lucide-react";
import { Footer } from "../landing/sections/Footer";
import { DownloadAppSection } from "../landing/sections/DownloadAppSection";

const Login = () => {
  const [guestId, setGuestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const value = guestId.trim();
    if (!value) {
      setError("Please enter your Student ID or Registered Mobile.");
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <DownloadAppSection />
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Side - Visual Hero */}
        <div className="hidden lg:flex flex-1 bg-[linear-gradient(137deg,rgba(104,59,218,1)_0%,rgba(180,129,230,1)_100%)] items-center justify-center p-12 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="text-white max-w-lg relative z-10 text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-sm font-bold mb-8 border border-white/30">
              <Sparkles className="w-4 h-4" /> AI-Powered Excellence
            </div>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Concept Mastery Powered by Real-Time Correction
            </h1>
            <p className="text-white/90 text-xl leading-relaxed mb-10">
              AI Tutor for Class 8–12 • NEET & IIT Test Prep<br />
              <span className="font-bold">Diagnose. Correct. Improve. Predict.</span>
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <Brain className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-bold">Personalized</div>
                  <div className="text-xs opacity-70">Adaptive Learning Path</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <Target className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-bold">95% Accuracy</div>
                  <div className="text-xs opacity-70">Score Prediction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md text-left">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 font-medium">Log in to your Cloop Web dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="guestId" className="text-sm font-bold text-gray-700 ml-1 text-left">Student ID / Registered Mobile</Label>
                <Input
                  id="guestId"
                  type="text"
                  placeholder="GUEST-12345 or +91..."
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  className="h-14 rounded-2xl border-gray-200 focus:ring-[#8d33ff] focus:border-[#8d33ff] text-lg px-4"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button 
                  type="submit" 
                  className="w-full h-14 bg-[#8d33ff] hover:bg-[#7a2de0] text-white rounded-2xl text-lg font-bold shadow-xl shadow-purple-200 transition-all active:scale-[0.98]" 
                  disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Continue to Learning Dashboard"}
              </Button>
            </form>

            <div className="mt-10 pt-10 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-medium mb-4">New to Cloop?</p>
              <Link to="/signup">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-[#8d33ff]/20 text-[#8d33ff] font-bold hover:bg-[#8d33ff]/5 hover:border-[#8d33ff]/40 gap-2">
                      Start Free <ArrowRight className="w-4 h-4" />
                  </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding - Replaced with full landing footer */}
      <div className="border-t border-gray-100">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
