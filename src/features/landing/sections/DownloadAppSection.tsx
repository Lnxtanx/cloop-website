import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { label: "Features", href: "#features" },
  { label: "AI Tutor", href: "#ai-tutor" },
  { label: "Pricing", href: "#pricing" },
];

export const DownloadAppSection = (): JSX.Element => {
  const navigate = useNavigate();
  
  const scrollTo = (id: string) => {
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-3 w-full max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between flex-1 gap-4 md:gap-8">
        <div 
          className="relative w-[120px] md:w-[172.05px] h-[45px] md:h-[62px] bg-[#e9a4fa] rounded-[12.4px] flex items-center justify-center cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <img
            className="w-[80px] md:w-[115px] h-auto"
            alt="Logo"
            src="/figmaAssets/logo.png"
          />
        </div>

        <nav className="hidden md:flex items-center justify-end gap-9 flex-1">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollTo(item.href)}
              className="[font-family:'Inter',Helvetica] font-medium text-[#110c1c] text-[18px] md:text-[21.7px] tracking-[0] leading-[32.5px] whitespace-nowrap hover:text-[#8d33ff] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigate("/login")}
            className="[font-family:'Inter',Helvetica] font-medium text-[#110c1c] text-[18px] md:text-[21.7px] tracking-[0] leading-[32.5px] whitespace-nowrap hover:text-[#8d33ff] transition-colors"
          >
            Login
          </button>
        </nav>

        <Button 
          onClick={() => navigate("/signup")}
          className="h-[45px] md:h-[62px] min-w-[100px] md:min-w-[130.2px] px-[15px] md:px-[24.8px] bg-[#8d33ff] hover:bg-[#7a2de0] rounded-[10px] md:rounded-[12.4px] [font-family:'Inter',Helvetica] font-bold text-[#f9f7fc] text-[16px] md:text-[21.7px] tracking-[0] leading-[32.5px]"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
};
