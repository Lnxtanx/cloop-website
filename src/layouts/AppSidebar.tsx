import { Home, Video, BarChart3, MessageCircle, User, Bell, PanelLeftClose, PanelLeftOpen, MessageSquare, BookOpen, Headphones, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import favicon from "/favicon.ico";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChatHistory } from "@/features/chat/components/ChatHistory";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Session Progress", url: "/dashboard/sessions", icon: Video },
  { title: "Dashboard", url: "/dashboard/statistics", icon: BarChart3 },
  { title: "Chat with AI Tutor", url: "/dashboard/chat", icon: MessageCircle },
  { title: "Voice Tutor", url: "/dashboard/voice-chat", icon: Headphones },
  { title: "AI Avatar", url: "/dashboard/avatar", icon: Sparkles },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
  const { state, toggleSidebar, setOpenMobile, isMobile, openMobile } = useSidebar();
  const { toggleMode } = usePracticeMode();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const checkIsMobile = useIsMobile();

  // Close mobile sidebar when navigating
  const handleNavClick = (url: string) => {
    navigate(url);
    if (isMobile || checkIsMobile) {
      setOpenMobile(false);
    }
  };

  // Close mobile sidebar after mode switch
  const handleModeSwitch = () => {
    toggleMode();
    toast("Switched to Test Preparation Mode", {
      icon: <div className="w-2 h-2 rounded-full bg-black" />
    });
    setTimeout(() => navigate("/dashboard/test-your-self"), 300);
    if (isMobile || checkIsMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      {/* Header with logo and toggle */}
      <div className="h-14 flex items-center gap-2 px-3 border-b border-zinc-800 bg-gradient-to-r from-black via-zinc-900 to-zinc-950 shrink-0">
        <button
          onClick={() => handleNavClick("/dashboard")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          title="Go to Dashboard"
        >
          <img src={favicon} alt="Cloop" width={28} height={28} className="shrink-0 rounded-lg shadow-sm" />
          {(!collapsed || isMobile) && <span className="text-lg font-bold text-white">Cloop</span>}
        </button>
        {/* Desktop toggle button - hidden on mobile */}
        {!isMobile && (
          <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg shrink-0 w-8 h-8 ml-auto">
            {collapsed
              ? <PanelLeftOpen className="w-5 h-5" />
              : <PanelLeftClose className="w-5 h-5" />
            }
          </SidebarTrigger>
        )}
      </div>

      <SidebarContent className="pt-4 overflow-y-auto bg-white pb-safe">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {location.pathname === "/dashboard/chat" && !collapsed ? (
                <div className="flex flex-col h-[calc(100vh-250px)]">
                  <ChatHistory collapsed={collapsed} />
                </div>
              ) : (
                navItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={collapsed && !isMobile ? item.title : undefined}>
                        <button
                          onClick={() => handleNavClick(item.url)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base sm:text-lg transition-all w-full ${isActive ? "bg-zinc-100 text-black font-bold border-l-4 border-black" : "text-gray-800 hover:bg-zinc-100 hover:text-black"}`}
                        >
                          <item.icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] shrink-0" />
                          {(!collapsed || isMobile) && <span className="font-semibold text-sm sm:text-base">{item.title}</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Test Prep button - safe area for iOS */}
      <SidebarFooter className="p-3 sm:p-4 bg-white border-t border-gray-100 pb-safe">
        <Button
          onClick={handleModeSwitch}
          className={`w-full justify-center gap-2 h-10 sm:h-11 px-3 bg-black hover:bg-zinc-800 text-white border border-zinc-800 shadow-md transition-all text-sm sm:text-base ${collapsed && !isMobile ? 'p-0' : ''}`}
          title={collapsed && !isMobile ? "Go to Test Preparation" : ""}
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          {(!collapsed || isMobile) && <span className="font-bold tracking-tight text-xs sm:text-sm">Go to Test Preparation</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
