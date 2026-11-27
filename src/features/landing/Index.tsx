import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LandingNavbar } from "./sections/DownloadAppSection";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { ResearchSection } from "./sections/ResearchSection";
import { CriticalThinkingSection } from "./sections/CriticalThinkingSection";
import { StudentsParentsSection } from "./sections/StudentsParentsSection";
import { TeachersSection } from "./sections/TeachersSection";
import { GetAppSection } from "./sections/GetAppSection";
import { SourcesSection } from "./sections/SourcesSection";
import { SignInModal } from "./sections/SignInModal";
import { Footer } from "./sections/Footer";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [signInOpen, setSignInOpen] = useState(false);

  // Redirect logged-in users directly to their learning dashboard
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Support deep links like /#mastery, /#research, /#students, /#teachers, /#lesson, or /?signin=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signin") === "1") {
      setSignInOpen(true);
    }

    if (location.hash) {
      const targetId = location.hash.replace(/^#/, "");
      if (targetId === "login-card") {
        setSignInOpen(true);
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
  }, [location.hash, location.search]);

  return (
    <div className="min-h-screen bg-white font-['Inter',system-ui,sans-serif] flex flex-col">
      <LandingNavbar onOpenSignIn={() => setSignInOpen(true)} />

      <main className="flex-1">
        <HeroSection onOpenSignIn={() => setSignInOpen(true)} />
        <HowItWorksSection />
        <ResearchSection />
        <CriticalThinkingSection />
        <StudentsParentsSection />
        <TeachersSection />
        <GetAppSection onOpenSignIn={() => setSignInOpen(true)} />
        <SourcesSection />
      </main>

      <div className="bg-white border-t border-zinc-200">
        <Footer />
      </div>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  );
};

export default Index;
