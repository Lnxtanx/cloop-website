import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchChatSessions, deleteChatSession, ChatSession } from "@/lib/api/normal-chat";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHistoryProps {
  collapsed?: boolean;
}

export const ChatHistory = ({ collapsed }: ChatHistoryProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSessionId = searchParams.get("session");

  const loadSessions = async () => {
    try {
      const data = await fetchChatSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleNewChat = () => {
    setSearchParams({ session: "new" });
  };

  const handleSelectSession = (id: number) => {
    setSearchParams({ session: String(id) });
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;
    
    try {
      await deleteChatSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSessionId === String(id)) {
        setSearchParams({});
      }
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  if (collapsed) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm font-medium text-sm h-9 rounded-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-purple-600" />
          <span>New Chat</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-hide">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4 opacity-70">
          Recent Chats
        </div>
        
        <TooltipProvider>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-300" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-4 text-[11px] text-gray-400 italic">
              No recent chats
            </div>
          ) : (
            sessions.map((session) => (
              <Tooltip key={session.id}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleSelectSession(session.id)}
                    className={cn(
                      "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                      currentSessionId === String(session.id) 
                        ? "bg-purple-50 text-purple-700 font-medium" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <MessageSquare className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      currentSessionId === String(session.id) ? "text-purple-600" : "text-gray-400"
                    )} />
                    <span className="text-[13px] truncate pr-6">{session.title || "Untitled Chat"}</span>
                    
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-md transition-all text-gray-400 hover:text-red-500 z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px] text-[11px] py-1 px-2">
                  {session.title || "Untitled Chat"}
                </TooltipContent>
              </Tooltip>
            ))
          )}
        </TooltipProvider>
      </div>
    </div>
  );
};
