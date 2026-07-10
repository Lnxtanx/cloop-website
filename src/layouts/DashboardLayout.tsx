import { ReactNode, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/AppSidebar";
import { PracticeSidebar } from "@/layouts/PracticeSidebar";
import { Bell, Zap, BookOpen, ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  children: ReactNode;
  title: string;
  mainClassName?: string;
  hideHeader?: boolean;
}

// Header component that uses sidebar context (must be inside SidebarProvider)
function DashboardHeader({ title, isPractice, userInitials, unreadCount, navigate }: {
  title: string;
  isPractice: boolean;
  userInitials: string;
  unreadCount: number;
  navigate: (path: string | number) => void;
}) {
  const { toggleSidebar, openMobile } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <header className="h-12 sm:h-14 shrink-0 border-b border-purple-800 bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 z-10 shadow-md safe-area-inset">
      {/* Left: Hamburger (mobile) + Back + Title */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        {/* Mobile hamburger menu */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 hover:bg-white/10 cursor-pointer -ml-1 mr-0.5 shrink-0"
            onClick={toggleSidebar}
            title="Open menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 hover:bg-white/10 cursor-pointer shrink-0"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>
        <h1 className="text-sm sm:text-base font-semibold text-white truncate hidden sm:block">{title}</h1>
        {isPractice && (
          <span className="bg-white/20 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
            Test Prep
          </span>
        )}
      </div>
      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 sm:w-9 sm:h-9 hover:bg-white/10 cursor-pointer"
          onClick={() => navigate("/dashboard/notifications")}
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 min-w-[8px] h-3.5 sm:h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full border border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
        <button
          onClick={() => navigate("/dashboard/profile")}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-purple-400 overflow-hidden bg-purple-800 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
          title="Profile"
        >
          <span className="text-white text-[10px] sm:text-xs font-semibold">{userInitials}</span>
        </button>
      </div>
    </header>
  );
}

const DashboardLayout = ({ children, title, mainClassName, hideHeader }: Props) => {
  const navigate = useNavigate();
  const { mode, toggleMode } = usePracticeMode();
  const [userInitials, setUserInitials] = useState("JD");
  const [unreadCount, setUnreadCount] = useState(0);

  const isPractice = mode === "PRACTICE";

  // Session timeout: logout after 30 minutes of inactivity
  const logoutTimeout = useCallback(() => {
    localStorage.removeItem("cloop_token");
    localStorage.removeItem("cloop_user");
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // 30 minutes of inactivity
      timeoutId = setTimeout(logoutTimeout, 30 * 60 * 1000);
    };

    // List of events to track user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start timer on mount
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [logoutTimeout]);

  // Get user initials from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem("cloop_token");
      if (!token) {
        navigate("/login");
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("cloop_token");
        localStorage.removeItem("cloop_user");
        navigate("/login", { replace: true });
        return;
      }

      const name: string = payload.name ?? payload.email ?? "";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        setUserInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else {
        setUserInitials(name.slice(0, 2).toUpperCase() || "U");
      }
    } catch {
      localStorage.removeItem("cloop_token");
      localStorage.removeItem("cloop_user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Fetch unread notification count
  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
    const token = localStorage.getItem("cloop_token");
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch {
        // silent
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <div className={`h-screen flex w-full overflow-hidden ${isPractice ? 'bg-purple-50/30' : 'bg-secondary/30'}`}>
        {isPractice ? <PracticeSidebar /> : <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          {/* Header */}
          {!hideHeader && (
            <DashboardHeader
              title={title}
              isPractice={isPractice}
              userInitials={userInitials}
              unreadCount={unreadCount}
              navigate={navigate}
            />
          )}
          <main className={mainClassName ?? "flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto min-h-0 relative pb-safe"}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
