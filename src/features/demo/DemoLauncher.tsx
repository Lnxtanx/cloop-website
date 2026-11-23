import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Sparkles, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { createDemoSession } from "@/lib/api/demo";
import { Button } from "@/components/ui/button";

export default function DemoLauncher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const launchDemo = async () => {
    try {
      setStatus("loading");
      setErrorMessage("");

      // Automatically create a fresh, dedicated guest account for this visitor
      const data = await createDemoSession();

      const topicId = data.demoTopic?.topicId || 3474;
      const topicTitle = data.demoTopic?.topicTitle || "Concept 1: What Is a Force: Push and Pull";
      const chapterTitle = data.demoTopic?.chapterTitle || "Chapter 5: Exploring Forces";
      const subjectName = data.demoTopic?.subjectName || "Science";

      // Directly redirect to the live topic chat with demo=true
      navigate(
        `/topic-chat?topicId=${topicId}&topicTitle=${encodeURIComponent(
          topicTitle
        )}&chapterTitle=${encodeURIComponent(
          chapterTitle
        )}&subjectName=${encodeURIComponent(subjectName)}&demo=true`,
        { replace: true }
      );
    } catch (err: any) {
      console.error("[DemoLauncher] Failed to initialize demo:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to initialize demo session. Please try again."
      );
    }
  };

  useEffect(() => {
    launchDemo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-purple-100 rounded-3xl p-8 shadow-xl shadow-purple-500/5 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-purple-500/25">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        {status === "loading" ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Loading Cloop AI Tutor
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Preparing your interactive demo: <br />
              <span className="font-semibold text-purple-700">
                Class 8 Science • Concept 1: What Is a Force?
              </span>
            </p>

            <div className="flex items-center justify-center gap-3 py-3 text-purple-600 text-sm font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating your dedicated demo session...</span>
            </div>

            <div className="w-full bg-purple-100/60 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full animate-[progress_1.5s_ease-in-out_infinite] w-2/3" />
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Could Not Start Demo
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {errorMessage || "Unable to connect to the learning server."}
            </p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={launchDemo}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Demo
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full h-10 text-gray-500 hover:text-gray-900 text-sm"
              >
                Go to Homepage
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Powered by Cloop Interactive Learning Platform
      </div>
    </div>
  );
}
