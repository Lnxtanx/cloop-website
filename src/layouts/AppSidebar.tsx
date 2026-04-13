import { Home, Video, BarChart3, MessageCircle, User, Bell, PanelLeftClose, PanelLeftOpen, MessageSquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import favicon from "/favicon.ico";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Sessions", url: "/dashboard/sessions", icon: Video },
  { title: "Statistics", url: "/dashboard/statistics", icon: BarChart3 },
  { title: "Chat", url: "/dashboard/chat", icon: MessageCircle },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Floating toggle button - always visible when collapsed */}
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
            <img src={favicon} alt="Cloop" width={28} height={28} className="shrink-0" />
            {!collapsed && <span className="text-lg font-bold text-white">Cloop</span>}
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
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-all ${isActive ? "bg-purple-100 text-purple-800 font-bold" : "text-gray-800 hover:bg-purple-50 hover:text-purple-700"}`}
                        activeClassName=""
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    </>
  );
}
