import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LandingNavbar } from "./sections/DownloadAppSection";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { StudentsSection } from "./sections/StudentsSection";
import { ParentsSection } from "./sections/ParentsSection";
import { TeachersSection } from "./sections/TeachersSection";
import { GetAppSection } from "./sections/GetAppSection";
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

  // Support deep links like /#how-it-works, /#for-parents, or /?signin=1
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
        <StudentsSection />
        <ParentsSection />
        <TeachersSection />
        <GetAppSection onOpenSignIn={() => setSignInOpen(true)} />
      </main>

      <div className="bg-white border-t border-zinc-200/80">
        <Footer />
      </div>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  );
};

export default Index;
