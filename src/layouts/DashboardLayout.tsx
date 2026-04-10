import { ReactNode, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  title: string;
  mainClassName?: string;
  hideHeader?: boolean;
}

const DashboardLayout = ({ children, title, mainClassName, hideHeader }: Props) => {
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("JD");
  const [unreadCount, setUnreadCount] = useState(0);

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
      const name: string = payload.name ?? payload.email ?? "";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        setUserInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else {
        setUserInitials(name.slice(0, 2).toUpperCase() || "U");
      }
    } catch {
      navigate("/login");
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
      <div className="h-screen flex w-full overflow-hidden bg-secondary/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          {/* Header */}
          {!hideHeader && (
            <header className="h-14 shrink-0 border-b border-purple-800 bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-between px-6 gap-4 z-10 shadow-md">
              {/* Left: Title */}
              <h1 className="text-base font-semibold text-white hidden sm:block">{title}</h1>
              {/* Right: Notification + Profile */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative w-9 h-9 hover:bg-purple-500/30 cursor-pointer"
                  onClick={() => navigate("/dashboard/notifications")}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[8px] h-2 px-1 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full border border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
                <button
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-9 h-9 rounded-full border-2 border-purple-400 overflow-hidden bg-purple-800 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
                  title="Profile"
                >
                  <span className="text-white text-xs font-semibold">{userInitials}</span>
                </button>
              </div>
            </header>
          )}
          <main className={mainClassName ?? "flex-1 p-6 overflow-y-auto min-h-0"}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
