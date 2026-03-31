import { Home, Video, BarChart3, MessageCircle, User, Bell, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import cloopLogo from "@/assets/cloop-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
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
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border sticky top-0 h-screen">
      <div className="h-12 flex items-center gap-2 px-3 border-b border-sidebar-border shrink-0">
        <img src={cloopLogo} alt="Cloop" width={28} height={28} className="shrink-0" />
        {!collapsed && <span className="text-base font-bold text-foreground flex-1">Cloop</span>}
        <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0 w-7 h-7">
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </SidebarTrigger>
      </div>
      <SidebarContent className="pt-4 overflow-y-auto">
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
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
                        activeClassName=""
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
