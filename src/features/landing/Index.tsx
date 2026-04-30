import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DownloadAppSection } from "./sections/DownloadAppSection";
import { WhyChooseUsSection } from "./sections/WhyChooseUsSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { CurriculumSection } from "./sections/CurriculumSection";
import { HeroSection } from "./sections/HeroSection";

const Index = () => {
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col w-full bg-white min-h-screen">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <DownloadAppSection />
      </div>
      <WhyChooseUsSection />
      <HowItWorksSection />
      <CurriculumSection />
      <HeroSection />
    </div>
  );
};

export default Index;
