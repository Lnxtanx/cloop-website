import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Headphones,
} from "lucide-react";
import { createLiveVoiceSession } from "@/lib/api/voice-chat";
import { useLiveVoiceTutor } from "@/hooks/useLiveVoiceTutor";

export default function VoiceChat() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const voice = useLiveVoiceTutor(sessionId);

  // 1. Initialise session on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());

        // Create or get voice session from backend
        const s = await createLiveVoiceSession();
        if (isMounted) {
          setSessionId(s.id);
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error("[VoiceChat] Init error:", err);
        if (isMounted) {
          // Fallback to local session ID if network fails
          setSessionId(Date.now());
          setIsInitializing(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Connect WebSocket once session ID is ready
  useEffect(() => {
    if (sessionId && !voice.isConnected && voice.connectionStatus === "disconnected") {
      voice.connect();
    }
  }, [sessionId, voice.isConnected, voice.connectionStatus, voice.connect]);

  // 3. Handle leave / end call
  const handleEndCall = useCallback(() => {
    voice.endSession();
    navigate("/dashboard");
  }, [voice, navigate]);

  return (
    <DashboardLayout title="Voice Tutor — Cloop AI" mainClassName="flex-1 flex flex-col h-full min-h-0 p-0 overflow-hidden">
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 bg-[#090A0F] text-white select-none font-['Inter',sans-serif] relative overflow-hidden h-full">
        
        {/* Ambient background glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            voice.isAiSpeaking
              ? "bg-purple-600/15 scale-125"
              : voice.isUserSpeaking
              ? "bg-emerald-600/15 scale-125"
              : "bg-indigo-600/5 scale-100"
          }`}
        />

        {/* Top Minimal Bar */}
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between z-10 shrink-0">
          <button
            onClick={handleEndCall}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer backdrop-blur-md"
            title="Leave Session"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
              C.
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Cloop AI Tutor
            </h2>
          </div>

          <button
            onClick={() => setShowSubtitles((prev) => !prev)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer backdrop-blur-md ${
              showSubtitles
                ? "bg-purple-600/40 border-purple-400 text-white"
                : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
            }`}
            title="Toggle Subtitles"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Dynamic Animated Waveform Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10 py-4 min-h-0">
          
          {/* Main Visualizer Stage */}
          <div className="relative flex items-center justify-center w-64 h-64">
            
            {/* Ambient pulsating outer waves */}
            <div
              className={`absolute rounded-full transition-all duration-500 pointer-events-none ${
                voice.isAiSpeaking
                  ? "w-60 h-60 bg-purple-500/20 animate-ping"
                  : voice.isUserSpeaking
                  ? "w-60 h-60 bg-emerald-500/20 animate-ping"
                  : "w-44 h-44 bg-white/5"
              }`}
            />

            {/* Glowing Core Sphere */}
            <div
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 z-10 ${
                voice.isAiSpeaking
                  ? "bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 shadow-purple-500/50 scale-105"
                  : voice.isUserSpeaking
                  ? "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-emerald-500/50 scale-105"
                  : "bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700/60 shadow-black/80"
              }`}
            >
              {isInitializing || voice.connectionStatus === "connecting" ? (
                <Loader2 className="w-9 h-9 text-white animate-spin" />
              ) : voice.isAiSpeaking ? (
                <Volume2 className="w-9 h-9 text-white animate-pulse" />
              ) : (
                <Mic className={`w-9 h-9 ${voice.isUserSpeaking ? "text-white" : "text-zinc-400"}`} />
              )}
            </div>

            {/* 16 Animated Dynamic Frequency Bars */}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
              {voice.frequencyData.slice(0, 16).map((val, i) => {
                const active = voice.isAiSpeaking || voice.isUserSpeaking;
                const height = active ? Math.max(12, val * 120) : 6;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      voice.isAiSpeaking
                        ? "bg-gradient-to-t from-purple-500 to-indigo-300 shadow-xs shadow-purple-400"
                        : voice.isUserSpeaking
                        ? "bg-gradient-to-t from-emerald-500 to-teal-200 shadow-xs shadow-emerald-400"
                        : "bg-zinc-700"
                    }`}
                    style={{
                      height: `${height}px`,
                      opacity: active ? 0.9 : 0.25,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Clean Status Pill */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wide backdrop-blur-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  voice.isAiSpeaking
                    ? "bg-purple-400 animate-pulse"
                    : voice.isUserSpeaking
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-zinc-500"
                }`}
              />
              <span>
                {isInitializing || voice.connectionStatus === "connecting"
                  ? "Connecting to Cloop AI..."
                  : voice.isAiSpeaking
                  ? "Cloop AI is speaking..."
                  : voice.isUserSpeaking
                  ? "Listening to you..."
                  : "Cloop AI is listening"}
              </span>
            </div>
          </div>

          {/* Clean Live Subtitle Pill */}
          {showSubtitles && (
            <div className="w-full max-w-lg min-h-[52px] bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-center backdrop-blur-md flex items-center justify-center">
              <p className="text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed">
                {voice.isAiSpeaking
                  ? voice.aiTranscript || "..."
                  : voice.userTranscript
                  ? `"${voice.userTranscript}"`
                  : "Ask any question or concept across all subjects..."}
              </p>
            </div>
          )}

        </div>

        {/* Bottom Control Bar */}
        <div className="max-w-md mx-auto w-full flex items-center justify-center gap-4 z-10 shrink-0 pb-2">
          {/* End Call / Leave */}
          <button
            onClick={handleEndCall}
            className="px-8 h-12 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
