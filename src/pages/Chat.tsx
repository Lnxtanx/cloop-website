import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

const initialMessages: Message[] = [
  { id: 1, text: "Hello! I'm your AI tutor. Ask me anything about your courses — from Python basics to Machine Learning concepts. How can I help you today?", sender: "ai" },
];

const aiResponses: Record<string, string> = {
  python: "Python is a versatile programming language great for beginners! It's used in web development, data science, AI, and more. In your current course, you're learning about functions and modules. Would you like me to explain decorators or lambda functions?",
  help: "I can help you with:\n\n• Explaining concepts from your courses\n• Solving practice problems\n• Preparing for quizzes\n• Recommending study resources\n\nJust ask me anything!",
  default: "That's a great question! Based on your current coursework, I'd recommend reviewing the relevant chapter materials first. Would you like me to break down this topic step by step?",
};

const suggestedPrompts = [
  "Explain Python decorators",
  "Help me prepare for my quiz",
  "What is Machine Learning?",
  "Solve a practice problem",
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg: Message = { id: Date.now(), text: msg, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    const lower = msg.toLowerCase();
    const response = lower.includes("python") ? aiResponses.python : lower.includes("help") ? aiResponses.help : aiResponses.default;

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: response, sender: "ai" }]);
    }, 1200);
  };

  return (
    <DashboardLayout title="AI Chat">
      <div className="animate-fade-in h-[calc(100vh-5rem)] flex flex-col max-w-3xl mx-auto">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : ""}`}>
              {m.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] text-sm leading-relaxed whitespace-pre-line ${
                m.sender === "user"
                  ? "bg-muted rounded-2xl rounded-br-sm px-4 py-3 text-foreground"
                  : "text-foreground pt-1"
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-1 pt-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* Suggested prompts - show only with initial message */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-2 text-xs rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2">
          <div className="relative flex items-end border border-border rounded-2xl bg-muted/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Message AI Tutor..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 max-h-[200px]"
            />
            <Button
              onClick={() => handleSend()}
              size="icon"
              disabled={!input.trim()}
              className="m-1.5 h-8 w-8 rounded-xl hero-gradient border-0 shrink-0 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
            AI Tutor can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
