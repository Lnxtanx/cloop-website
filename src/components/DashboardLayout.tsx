import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  title: string;
  mainClassName?: string;
  hideHeader?: boolean;
}

const DashboardLayout = ({ children, title, mainClassName, hideHeader }: Props) => {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden bg-secondary/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          {!hideHeader && (
            <header className="h-12 shrink-0 border-b border-border bg-card flex items-center justify-between px-4 gap-4 z-10">
              <h1 className="text-base font-semibold hidden sm:block">{title}</h1>
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search courses, chapters..." className="pl-9 bg-secondary/50 border-0 h-8 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative w-8 h-8">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
                </Button>
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="hero-gradient text-primary-foreground text-xs font-semibold">JD</AvatarFallback>
                </Avatar>
              </div>
            </header>
          )}
          <main className={mainClassName ?? "flex-1 p-6 overflow-y-auto"}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
