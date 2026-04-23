import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./features/common/Index";
import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import Dashboard from "./features/dashboard/Dashboard";
import Chapters from "./features/subjects/Chapters";
import Topics from "./features/subjects/Topics";
import TopicChat from "./features/chat/TopicChat";
import Sessions from "./features/sessions/Sessions";
import Statistics from "./features/statistics/Statistics";
import Chat from "./features/chat/Chat";
import Profile from "./features/profile/Profile";
import PracticeTest from "./features/practice/PracticeTest";
import Notifications from "./features/notifications/Notifications";
import Feedback from "./features/feedback/Feedback";
import NotFound from "./features/common/NotFound";

import { PracticeModeProvider } from "./contexts/PracticeModeContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PracticeModeProvider>
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
              <Route path="/dashboard/test-your-self" element={<PracticeTest />} />
              <Route path="/dashboard/notifications" element={<Notifications />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PracticeModeProvider>
    </QueryClientProvider>
  );
};

export default App;
