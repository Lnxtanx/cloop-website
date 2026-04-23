import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Copy, Check, Trash2, Home, Video, BarChart3, MessageCircle, User, Bell } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch chat history on mount
    fetchChatHistory();
  }, [navigate]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem("cloop_token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

      const response = await fetch(`${API_BASE_URL}/api/normal-chat`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.sender === "ai" ? "assistant" : "user",
            content: msg.message,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("cloop_token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

      const response = await fetch(`${API_BASE_URL}/api/normal-chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: data.aiMessage?.id?.toString() || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.aiMessage?.message || "I couldn't generate a response. Please try again.",
        timestamp: new Date(data.aiMessage?.created_at || new Date()),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear all chat history?")) {
      return;
    }

    try {
      const token = localStorage.getItem("cloop_token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

      const response = await fetch(`${API_BASE_URL}/api/normal-chat/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages([]);
      } else {
        console.error("Failed to clear chat history");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSendMessage();
    }
  };

  const NAV = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Video, label: "Sessions", path: "/dashboard/sessions" },
    { icon: BarChart3, label: "Statistics", path: "/dashboard/statistics" },
    { icon: MessageCircle, label: "Chat", path: "/dashboard/chat" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
  ];

  // Use position: fixed + inset: 0 for stable viewport-sized layout (like TopicChat)
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", fontFamily: "Inter,system-ui,sans-serif", background: "#fff" }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e5e7eb" }}>
        {/* Logo Header - purple gradient */}
        <div style={{ height: 56, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: "2px solid #7c3aed", background: "linear-gradient(to right, #7c3aed, #a855f7)" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#7c3aed", fontSize: 14, fontWeight: 800 }}>C</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Cloop</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "#f3e8ff" : "transparent",
                  color: active ? "#6b2d8f" : "#111827",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  width: "100%",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as any).style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as any).style.background = "transparent";
                }}
              >
                <Icon style={{ width: 20, height: 20 }} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RIGHT CHAT PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>
        {/* Header */}
        <div style={{ flexShrink: 0, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #E5E7EB", background: "linear-gradient(to right, hsl(330, 81%, 60%), hsl(340, 70%, 55%))" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>CLOOP AI</h1>
          <div style={{ fontSize: 13, color: "#fff", opacity: 0.8 }}>Your personal learning assistant</div>
        </div>

        {/* Messages Container - flex:1 fills all remaining space */}
        <div style={{ flex: 1, overflowY: "auto", background: "linear-gradient(to bottom, #F3E8FF, #fff)", padding: "24px 20px 12px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {isFetchingHistory ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "80px 0", color: "#9CA3AF", fontSize: 14 }}>
                <Loader2 className="animate-spin" style={{ width: 18, height: 18, color: "#7c3aed" }} />
                Loading chat history...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, margin: "0 auto 16px", background: "linear-gradient(to right, #7c3aed, #a855f7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 28, color: "#fff", fontWeight: 700 }}>C</span>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 600, color: "#1F2937", margin: 0 }}>Welcome to CLOOP AI</p>
                  <p style={{ fontSize: 14, color: "#6B7280", margin: "8px 0 0" }}>Your personal learning assistant</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: "16px 0 0" }}>Ask me anything about your studies!</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 480,
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: message.role === "user" ? "linear-gradient(to right, #7c3aed, #a855f7)" : "#f3f4f6",
                        color: message.role === "user" ? "#fff" : "#111827",
                        fontSize: 14,
                        lineHeight: 1.6,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</p>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          style={{
                            marginTop: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "#7c3aed",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check style={{ width: 14, height: 14 }} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy style={{ width: 14, height: 14 }} />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <div style={{ maxWidth: 480, padding: "12px 16px", borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                      <Loader2 className="animate-spin" style={{ width: 14, height: 14, color: "#7c3aed" }} />
                      <span style={{ fontSize: 14, color: "#6B7280" }}>CLOOP is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area - flexShrink:0 ALWAYS sticks to bottom */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #E5E7EB", background: "#fff", padding: "16px 20px", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CLOOP AI anything..."
                  className="resize-none"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1.5px solid #E5E7EB",
                    background: "#F9FAFB",
                    padding: "12px 16px",
                    fontSize: 14,
                    outline: "none",
                    color: "#111827",
                    fontFamily: "Inter, system-ui, sans-serif",
                    minHeight: 40,
                    maxHeight: 80,
                  }}
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isLoading || !inputValue.trim() ? "#E5E7EB" : "linear-gradient(to right, #7c3aed, #a855f7)",
                  color: "#fff",
                  cursor: isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingLeft: 4 }}>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Ctrl+Enter to send</p>
              {messages.length > 0 && (
                <Button
                  onClick={handleClearChat}
                  variant="ghost"
                  style={{
                    color: "#EF4444",
                    fontSize: 12,
                    padding: "4px 8px",
                    height: "auto",
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14, marginRight: 4 }} />
                  Clear Chat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
