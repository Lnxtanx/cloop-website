import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Copy, Check, GitBranch, ArrowRight } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { 
  fetchNormalChatMessages, 
  sendNormalChatMessage,
  NormalChatResponse 
} from "@/lib/api/normal-chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fromReportId?: number | null;
  fromQIndex?: string | null;
}

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const fromReportParam = searchParams.get("fromReport");
  const fromQParam = searchParams.get("fromQ");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchChatHistory = useCallback(async (sid?: string) => {
    setIsFetchingHistory(true);
    try {
      const data: NormalChatResponse = await fetchNormalChatMessages(
        sid ? parseInt(sid) : undefined
      );

      if (data.messages && Array.isArray(data.messages)) {
        const formattedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.sender === "ai" ? "assistant" : "user",
          content: msg.message,
          timestamp: new Date(msg.created_at),
          fromReportId: msg.from_report_id,
          fromQIndex: msg.from_q_index,
        }));
        setMessages(formattedMessages);

        if (!sid && data.session_id) {
          setSearchParams({ session: String(data.session_id) }, { replace: true });
        }
        return data.session_id;
      } else {
        setMessages([]);
        return data.session_id;
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return null;
    } finally {
      setIsFetchingHistory(false);
    }
  }, [setSearchParams]);

  // Initial Loading and Deep-linking
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    const initializeChat = async () => {
      const activeSessionId = await fetchChatHistory(sessionId || undefined);
      
      const question = searchParams.get("q");
      if (question) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("q");
        newParams.delete("fromReport");
        newParams.delete("fromQ");
        setSearchParams(newParams, { replace: true });
        
        void handleSendMessage(
          question, 
          fromReportParam ? parseInt(fromReportParam) : null, 
          fromQParam,
          activeSessionId || undefined
        );
      }
    };

    void initializeChat();
  }, []);

  const handleSendMessage = async (
    customMessage?: string, 
    originReportId?: number | null, 
    qIndex?: string | null,
    explicitSessionId?: number
  ) => {
    const messageToSend = customMessage || inputValue;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
      fromReportId: originReportId,
      fromQIndex: qIndex
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const targetSid = explicitSessionId || ((sessionId && sessionId !== "new") ? parseInt(sessionId) : undefined);
      
      const result = await sendNormalChatMessage({
        message: messageToSend,
        session_id: targetSid,
        from_report_id: originReportId || undefined,
        from_q_index: qIndex || undefined
      });

      if ((!sessionId || sessionId === "new") && result.session_id) {
        setSearchParams({ session: String(result.session_id) }, { replace: true });
      }

      const assistantMessage: Message = {
        id: result.aiMessage?.id?.toString() || (Date.now() + 1).toString(),
        role: "assistant",
        content: result.aiMessage?.message || "I couldn't generate a response.",
        timestamp: new Date(result.aiMessage?.created_at || new Date()),
        fromReportId: result.aiMessage?.from_report_id ?? originReportId,
        fromQIndex: result.aiMessage?.from_q_index ?? qIndex,
      };
      
      setMessages((prev) => {
        // Sync the local user message with backend data to ensure persistence
        const updatedMessages = [...prev];
        // Find the index of the user message we just sent (searching from the end)
        let userMsgIndex = -1;
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (updatedMessages[i].role === "user" && updatedMessages[i].content === messageToSend) {
            userMsgIndex = i;
            break;
          }
        }
        
        if (userMsgIndex !== -1) {
          updatedMessages[userMsgIndex] = {
            ...updatedMessages[userMsgIndex],
            id: result.userMessage?.id?.toString() || updatedMessages[userMsgIndex].id,
            fromReportId: result.userMessage?.from_report_id ?? updatedMessages[userMsgIndex].fromReportId,
            fromQIndex: result.userMessage?.from_q_index ?? updatedMessages[userMsgIndex].fromQIndex,
          };
        }
        
        return [...updatedMessages, assistantMessage];
      });
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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <DashboardLayout title="Chat with AI Tutor" mainClassName="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden bg-white">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pt-6 pb-32 px-4 scroll-smooth bg-white"
      >
        <div className="max-w-3xl mx-auto">
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <p className="text-xs font-medium">Loading history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 mb-6 rounded-full overflow-hidden shadow-sm border border-gray-100 p-2 bg-white">
                <img src="/favicon.ico" alt="Cloop" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to AI Tutor</h2>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Your personal learning assistant. Ask me anything about your studies!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 py-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm self-start mt-1 ${
                    message.role === "user" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}>
                    {message.role === "user" ? "ME" : "AI"}
                  </div>
                  <div className={`flex flex-col max-w-[88%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                        message.role === "user"
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 border border-gray-100"
                      }`}
                    >
                      {message.role === "user" ? (
                        <>
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-gray-900">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-3 text-gray-900">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-gray-900">{children}</h3>,
                            code: ({ children }) => <code className="bg-gray-200/50 px-1.5 py-0.5 rounded text-purple-700 font-mono text-[13px]">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-3 text-[12px] shadow-inner">{children}</pre>,
                            strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {message.role === "assistant" && (
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <><Check className="w-3 h-3" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                        
                        {(message.fromReportId != null || (index > 0 && messages[index-1].role === "user" && messages[index-1].fromReportId != null)) && (
                          <button
                            onClick={() => {
                              const reportId = message.fromReportId ?? messages[index-1].fromReportId;
                              const qIndex = message.fromQIndex ?? messages[index-1].fromQIndex;
                              const qPart = qIndex ? `&fromQ=${qIndex}` : "";
                              navigate(`/dashboard/test-your-self?reportId=${reportId}${qPart}`);
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                            title="Go back to original question"
                          >
                            <GitBranch className="w-3 h-3" /> 
                            View in Report
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-200">
                    AI
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pb-4 pt-10 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="relative bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200 p-2 transition-shadow focus-within:shadow-[0_0_25px_rgba(0,0,0,0.08)]">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI Tutor anything..."
              className="w-full bg-transparent border-0 focus:ring-0 text-sm py-3 pl-4 pr-12 min-h-[44px] max-h-[180px] resize-none overflow-y-auto scrollbar-hide"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3">
              <Button
                onClick={() => void handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className={`w-8 h-8 rounded-xl p-0 flex items-center justify-center transition-all ${
                  isLoading || !inputValue.trim()
                    ? "bg-gray-100 text-gray-300"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="h-2" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
