import { Home, BookOpen, Video, BarChart3, MessageCircle, User, LogOut } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Chapters", url: "/dashboard/chapters", icon: BookOpen },
  { title: "Sessions", url: "/dashboard/sessions", icon: Video },
  { title: "Statistics", url: "/dashboard/statistics", icon: BarChart3 },
  { title: "Chat", url: "/dashboard/chat", icon: MessageCircle },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
        <img src={cloopLogo} alt="Cloop" width={32} height={32} />
        {!collapsed && <span className="text-lg font-bold text-foreground">Cloop</span>}
      </div>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
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
      <SidebarFooter className="p-4">
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
