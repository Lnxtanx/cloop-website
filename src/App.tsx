import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Chapters from "./pages/Chapters";
import Topics from "./pages/Topics";
import TopicChat from "./pages/TopicChat";
import Sessions from "./pages/Sessions";
import Statistics from "./pages/Statistics";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topic-chat" element={<TopicChat />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/dashboard/statistics" element={<Statistics />} />
          <Route path="/dashboard/chat" element={<Chat />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
