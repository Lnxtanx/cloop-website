import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Volume2, Headphones, Loader2, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { sendVoiceChatMessage, fetchVoiceChatMessages } from "@/lib/api/normal-chat";

type ConnectionStatus = "disconnected" | "connecting" | "idle" | "listening" | "speaking" | "thinking";

export default function VoiceChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);

  // Hidden textarea ref for voice assistant compatibility
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await sendVoiceChatMessage({
        message: text,
      });

      const aiMsg = {
        role: "assistant",
        content: res.aiMessage?.message || "",
        audio: res.aiMessage?.audio,
        id: res.aiMessage?.id || Date.now().toString(),
      };

      setMessages((p) => [...p, aiMsg]);

      // Play audio response if call is active
      if (aiMsg.content && aiMsg.audio) {
        setTimeout(() => {
          speak({
            id: aiMsg.id,
            message: aiMsg.content,
            audio: aiMsg.audio,
          });
        }, 100);
      }
    } catch (err) {
      console.error("Voice Chat error:", err);
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Sorry, I had trouble generating a response." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    isVoiceEnabled,
    setIsVoiceEnabled,
    speakingMessageId,
    isListening,
    isWaitingToSend,
    isSpeechSupported,
    speak,
    toggleListening,
    cancelSpeech,
    cancelAutoSend,
  } = useVoiceAssistant({
    setInput: setInputValue,
    inputRef: textareaRef,
    onAutoSend: (text) => {
      void handleSendMessage(text);
    },
    autoListenAfterSpeak: true, // Continuous hands-free call mode
  });

  // Start Call Handler
  const startCall = async () => {
    setIsCallActive(true);
    setIsVoiceEnabled(true);
    
    // Fetch last session or create new
    try {
      const data = await fetchVoiceChatMessages();
      if (data.messages && data.messages.length > 0) {
        const formatted = data.messages.map((m: any) => ({
          role: m.sender === "ai" ? "assistant" : "user",
          content: m.message,
          audio: undefined,
          id: m.id.toString(),
        }));
        setMessages(formatted);
      }
    } catch (e) {
      console.error("Failed to load session history:", e);
    }

    // Trigger Speech Recognition
    setTimeout(() => {
      toggleListening();
    }, 400);
  };

  // End Call Handler
  const endCall = () => {
    cancelSpeech();
    cancelAutoSend();
    setIsCallActive(false);
    navigate("/dashboard");
  };

  // Status mapping
  const status = !isCallActive
    ? "disconnected"
    : isLoading || isWaitingToSend
    ? "thinking"
    : isListening
    ? "listening"
    : speakingMessageId
    ? "speaking"
    : "idle";

  return (
    <DashboardLayout title="Voice Tutor Session" mainClassName="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden bg-white">
      {/* Hidden textarea required for useVoiceAssistant focus and triggers */}
      <textarea ref={textareaRef} value={inputValue} onChange={() => {}} className="hidden" />

      <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-tr from-blue-50/40 via-white to-indigo-50/30 relative overflow-hidden select-none">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center max-w-3xl w-full mx-auto z-10">
          <Button
            variant="ghost"
            onClick={endCall}
            className="text-gray-600 hover:text-blue-700 hover:bg-blue-50 gap-2 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Call
          </Button>

          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${status !== "disconnected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-xs font-semibold tracking-wider text-purple-600 uppercase">
              {status === "disconnected" ? "Offline" : "Live Session"}
            </span>
          </div>
        </div>

        {/* Central visualizer block */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto relative z-10">
          {status === "disconnected" ? (
            <div className="text-center bg-white/95 border border-blue-50/60 p-10 rounded-[32px] shadow-[0_10px_40px_rgba(147,51,234,0.06)] max-w-sm w-full mx-auto animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 mb-6 mx-auto">
                <Headphones className="w-10 h-10 text-blue-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Voice-to-Voice AI Tutor</h2>
              <Button
                onClick={startCall}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all text-base cursor-pointer"
              >
                Start Voice Call
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              {/* Animated Orb container */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Visualizer ripples */}
                {status === "listening" && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/5 voice-ripple-1" />
                    <div className="absolute inset-0 rounded-full bg-red-500/3 voice-ripple-2" />
                    <div className="absolute inset-0 rounded-full bg-red-500/1 voice-ripple-3" />
                  </>
                )}
                {status === "speaking" && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-blue-500/8 voice-ripple-1" />
                    <div className="absolute inset-0 rounded-full bg-blue-500/4 voice-ripple-2" />
                    <div className="absolute inset-0 rounded-full bg-blue-500/2 voice-ripple-3" />
                  </>
                )}

                {/* Orb itself */}
                <div
                  onClick={toggleListening}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-500 ${
                    status === "listening"
                      ? "bg-gradient-to-tr from-red-500 to-orange-500 voice-morph-sphere-fast shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                      : status === "speaking"
                      ? "bg-gradient-to-tr from-blue-600 to-fuchsia-500 voice-morph-sphere shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                      : status === "thinking"
                      ? "bg-gradient-to-tr from-indigo-500 to-blue-800 voice-pulse-active shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                      : "bg-gradient-to-tr from-blue-600 to-indigo-700 voice-breathe-glow"
                  }`}
                >
                  <div className="text-center text-white select-none">
                    {status === "listening" ? (
                      <Mic className="w-6 h-6 mx-auto text-red-100" />
                    ) : status === "speaking" ? (
                      <Volume2 className="w-6 h-6 mx-auto text-blue-100" />
                    ) : (
                      <Headphones className="w-6 h-6 mx-auto text-blue-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Status title */}
              <div className="mt-4 text-center">
                <p className="text-lg font-bold text-slate-800 tracking-wide uppercase text-gradient">
                  {status === "listening"
                    ? "Listening to you..."
                    : status === "speaking"
                    ? "AI Tutor is speaking..."
                    : status === "thinking"
                    ? "AI Tutor is processing..."
                    : "Call Connected"}
                </p>
                <p className="text-xs text-blue-600/80 mt-1 font-medium">
                  {!isVoiceEnabled ? "Your voice output is muted" : "Ask or talk about anything"}
                </p>
              </div>

              {/* Live Transcript Display Box */}
              <div className="mt-4 w-full max-w-md bg-white/80 border border-blue-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-xl p-4 min-h-[70px] max-h-[100px] overflow-y-auto scrollbar-hide text-center flex flex-col justify-center gap-1 animate-in fade-in slide-in-from-bottom-3 duration-300">
                {messages.length > 0 ? (
                  (() => {
                    const lastMsg = messages[messages.length - 1];
                    return (
                      <div className="animate-fade-in text-center flex flex-col items-center">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                          {lastMsg.role === "user" ? "You said" : "AI Tutor"}
                        </span>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed max-w-md mx-auto line-clamp-3">
                          {lastMsg.content}
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Start speaking to begin your live session...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls row */}
        {status !== "disconnected" && (
          <div className="pb-2 pt-2 max-w-md w-full mx-auto flex items-center justify-center gap-8 z-10 animate-in fade-in duration-500">
            {/* Toggle Mic Mute button */}
            <button
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 active:scale-95"
                  : isWaitingToSend
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 active:scale-95"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm active:scale-95"
              }`}
              title={isListening ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isListening ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>

            {/* End Call / Exit button */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 cursor-pointer"
              title="End Voice Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
