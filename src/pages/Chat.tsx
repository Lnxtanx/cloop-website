import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User } from "lucide-react";

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
  help: "I can help you with:\n• Explaining concepts from your courses\n• Solving practice problems\n• Preparing for quizzes\n• Recommending study resources\n\nJust ask me anything!",
  default: "That's a great question! Based on your current coursework, I'd recommend reviewing the relevant chapter materials first. Would you like me to break down this topic step by step?",
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);

    const lower = input.toLowerCase();
    const response = lower.includes("python") ? aiResponses.python : lower.includes("help") ? aiResponses.help : aiResponses.default;

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: response, sender: "ai" }]);
    }, 800);
    setInput("");
  };

  return (
    <DashboardLayout title="AI Chat">
      <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Tutor</h2>
        </div>

        <Card className="flex-1 flex flex-col border-border overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : ""}`}>
                {m.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full hero-gradient flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                  m.sender === "user" ? "hero-gradient text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}>
                  {m.text}
                </div>
                {m.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI tutor anything..."
                className="flex-1"
              />
              <Button type="submit" size="icon" className="hero-gradient border-0 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
