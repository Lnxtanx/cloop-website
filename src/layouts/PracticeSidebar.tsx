import { Home, BookOpen, BarChart3, History, MessageSquare, PanelLeftClose, PanelLeftOpen, Zap } from "lucide-react";
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

const practiceNavItems = [
  { title: "Home", url: "/dashboard/practice", icon: Home },
  { title: "Test Preparation", url: "/dashboard/test-your-self", icon: BookOpen },
  { title: "Dashboard", url: "/dashboard/statistics", icon: BarChart3 },
  { title: "History", url: "/dashboard/test-your-self?tab=history", icon: History },
  { title: "Chat with AI Tutor", url: "/dashboard/chat", icon: MessageSquare },
];

export function PracticeSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { toggleMode } = usePracticeMode();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {collapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed left-3 top-3 z-50 w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg transition-colors"
          title="Open sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}
      <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white sticky top-0 h-screen">
        <div className="h-14 flex items-center gap-2 px-3 border-b border-purple-600 bg-gradient-to-r from-purple-600 to-purple-700 shrink-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            title="Go to Dashboard"
          >
            <img src={favicon} alt="Cloop" width={28} height={28} className="shrink-0 rounded-lg shadow-sm" />
            {!collapsed && <span className="text-lg font-bold text-white tracking-tight">Test Preparation</span>}
          </button>
          <SidebarTrigger className="text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-lg shrink-0 w-8 h-8 ml-auto">
            {collapsed
              ? <PanelLeftOpen className="w-5 h-5" />
              : <PanelLeftClose className="w-5 h-5" />
            }
          </SidebarTrigger>
        </div>
      <SidebarContent className="pt-4 overflow-y-auto bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {location.pathname === "/dashboard/chat" && !collapsed ? (
                <div className="flex flex-col h-[calc(100vh-250px)]">
                  <ChatHistory collapsed={collapsed} />
                </div>
              ) : (
                practiceNavItems.map((item) => {
                  const itemUrl = new URL(item.url, window.location.origin);
                  const itemPath = itemUrl.pathname;
                  const itemTab = itemUrl.searchParams.get('tab');
                  
                  const currentTab = new URLSearchParams(location.search).get('tab');
                  const isPathMatch = location.pathname === itemPath;
                  const isTabMatch = itemTab === currentTab;
                  
                  const isActive = isPathMatch && isTabMatch;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                        <NavLink
                          to={item.url}
                          end
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-lg transition-all ${isActive ? "bg-purple-100 text-purple-800 font-bold" : "text-gray-800 hover:bg-purple-50 hover:text-purple-700"}`}
                          activeClassName=""
                        >
                          <item.icon className="w-[22px] h-[22px] shrink-0" />
                          {!collapsed && <span className="font-semibold">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
        <Button
          onClick={() => {
            toggleMode();
            toast("Switched to Normal Mode", {
              icon: <div className="w-2 h-2 rounded-full bg-gray-400" />
            });
          }}
          className={`w-full justify-center gap-3 h-10 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-none transition-all ${collapsed ? 'p-0' : ''}`}
          title={collapsed ? "Back to Normal Mode" : ""}
        >
          {!collapsed && <span className="font-bold text-base tracking-tight">Back to Normal Mode</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
