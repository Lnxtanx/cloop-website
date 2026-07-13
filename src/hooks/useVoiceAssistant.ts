import { useCallback, useEffect, useRef, useState } from "react";
import { convertTextToSpeech } from "@/lib/api/sarvam";
import { useToast } from "@/hooks/use-toast";

export interface VoiceMessage {
  id: string | number;
  message: string;
  audio?: string;
  message_type?: string;
}

interface UseVoiceAssistantProps {
  setInput: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  onAutoSend: (text: string) => void | Promise<void>;
  autoListenAfterSpeak?: boolean;
}

export function useVoiceAssistant({
  setInput,
  inputRef,
  onAutoSend,
  autoListenAfterSpeak = false,
}: UseVoiceAssistantProps) {
  const { toast } = useToast();
  const autoListenAfterSpeakRef = useRef(autoListenAfterSpeak);
  useEffect(() => {
    autoListenAfterSpeakRef.current = autoListenAfterSpeak;
  }, [autoListenAfterSpeak]);
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("cloop_voice_enabled");
    return saved !== null ? saved === "true" : true; // Default to true if not set
  });

  const [speakingMessageId, setSpeakingMessageId] = useState<number | string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isWaitingToSend, setIsWaitingToSend] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  });
  
  const recognitionRef = useRef<any>(null);
  const speakQueueRef = useRef<VoiceMessage[]>([]);
  const sendTimeoutRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const isWaitingToSendRef = useRef(isWaitingToSend);
  useEffect(() => {
    isWaitingToSendRef.current = isWaitingToSend;
  }, [isWaitingToSend]);

  // Sync voice enabled to localStorage
  const isVoiceEnabledRef = useRef(isVoiceEnabled);
  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
    localStorage.setItem("cloop_voice_enabled", String(isVoiceEnabled));
    if (!isVoiceEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      speakQueueRef.current = [];
      setSpeakingMessageId(null);
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
        sendTimeoutRef.current = null;
        setIsWaitingToSend(false);
      }
    }
  }, [isVoiceEnabled]);

  // Clean-up voice synthesis on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Define startListening: creates a fresh SpeechRecognition instance to avoid bad state bugs
  const startListening = useCallback(() => {
    if (isListeningRef.current || isWaitingToSendRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop active audio player when microphone begins recording
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingMessageId(null);

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true; // Enable real-time updates as the user speaks
      rec.lang = "en-IN"; // Target Indian English accent specifically

      rec.onstart = () => {
        setIsListening(true);
        setIsWaitingToSend(false);
      };

      rec.onend = () => {
        setIsListening(false);
        if (recognitionRef.current === rec) {
          recognitionRef.current = null;
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
        setIsWaitingToSend(false);
        if (recognitionRef.current === rec) {
          recognitionRef.current = null;
        }
        if (e.error === "not-allowed") {
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone permission in your browser settings to use voice input.",
            variant: "destructive",
          });
        }
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText && currentText.trim()) {
          setInput(currentText);
        }

        if (finalTranscript && finalTranscript.trim()) {
          // Clear any scheduled send timeout
          if (sendTimeoutRef.current) {
            clearTimeout(sendTimeoutRef.current);
          }

          setInput(finalTranscript);
          setIsWaitingToSend(true);

          // Voice-to-voice immediate sending (300ms pause makes it feel instant!)
          sendTimeoutRef.current = setTimeout(() => {
            setIsWaitingToSend(false);
            if (onAutoSendRef.current) {
              void onAutoSendRef.current(finalTranscript);
            }
            try {
              rec.stop();
            } catch {
              // ignore
            }
          }, 300);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }, [setInput, toast]);

  const speakNext = useCallback(async () => {
    if (speakQueueRef.current.length === 0) {
      setSpeakingMessageId(null);
      if (isVoiceEnabledRef.current && autoListenAfterSpeakRef.current) {
        setTimeout(() => {
          startListening();
        }, 300);
      }
      return;
    }

    const msg = speakQueueRef.current.shift()!;
    const cleanText = msg.message
      .replace(/<[^>]+>/g, "") // strip HTML tags
      .replace(/\*\*([^*]+)\*\*/g, "$1") // strip markdown bold
      .replace(/_([^_]+)_/g, "$1") // strip markdown italic
      .trim();

    if (!cleanText) {
      speakNext();
      return;
    }

    // Enhancement: Auto-mute/abort speech recognition if active when AI speaks
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.abort();
        setIsListening(false);
      } catch (e) {
        console.error("Failed to abort SpeechRecognition for TTS play:", e);
      }
    }

    try {
      setSpeakingMessageId(msg.id);
      
      // Use pre-rendered audio if available, otherwise fetch from backend
      let audioBase64 = msg.audio;
      if (!audioBase64) {
        audioBase64 = await convertTextToSpeech(cleanText, "priya", "en-IN");
      }
      
      if (!audioBase64) {
        throw new Error("No audio data returned from server");
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        speakNext();
      };
      
      audio.onerror = (e) => {
        console.error("Sarvam audio playback error:", e);
        // Wait 1 second before trying next to prevent fast-fail loops
        setTimeout(() => {
          speakNext();
        }, 1000);
      };
      
      await audio.play();
    } catch (e) {
      console.error("Sarvam TTS synthesis failed:", e);
      setSpeakingMessageId(null);
      // Wait 1 second before trying next to prevent fast-fail loops
      setTimeout(() => {
        speakNext();
      }, 1000);
    }
  }, [startListening]);

  const speak = useCallback((msg: VoiceMessage) => {
    // Toggle off if clicking the currently speaking message
    if (speakingMessageId === msg.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      speakQueueRef.current = [];
      setSpeakingMessageId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speakQueueRef.current = [msg];
    speakNext();
  }, [speakingMessageId, speakNext]);

  const speakMultiple = useCallback((msgs: VoiceMessage[]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Filter AI text messages
    const filtered = msgs.filter(m => 
      m.message_type !== "session_summary" && 
      m.message_type !== "score_prediction" && 
      m.message && 
      m.message.trim()
    );

    if (filtered.length === 0) {
      setSpeakingMessageId(null);
      return;
    }

    speakQueueRef.current = [...filtered];
    speakNext();
  }, [speakNext]);

  // Keep onAutoSend in ref to avoid re-triggering SpeechRecognition useEffect dependencies
  const onAutoSendRef = useRef(onAutoSend);
  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);

  const toggleListening = useCallback(() => {
    // If waiting to send, click mic to cancel auto-send and start editing
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
      setIsWaitingToSend(false);
      setIsListening(false);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    if (isListeningRef.current) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    } else {
      startListening();
    }
  }, [startListening]);

  const cancelAutoSend = useCallback(() => {
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    setIsWaitingToSend(false);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speakQueueRef.current = [];
    setSpeakingMessageId(null);
  }, []);

  return {
    isVoiceEnabled,
    setIsVoiceEnabled,
    speakingMessageId,
    isListening,
    isWaitingToSend,
    isSpeechSupported,
    speak,
    speakMultiple,
    toggleListening,
    cancelSpeech,
    cancelAutoSend,
  };
}
