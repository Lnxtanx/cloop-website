import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Monitor, Zap } from "lucide-react";

const steps = [
  {
    title: "Select a Learning Topic",
    frameIcon: "/2.png",
  },
  {
    title: "Chat with Personal AI Tutor",
    frameIcon: "/3.png",
  },
  {
    title: "Understand Common Errors",
    frameIcon: "/4.png",
  },
  {
    title: "Get Predicted Score",
    frameIcon: "/5.png",
  },
];

export const CurriculumSection = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center gap-[73px] px-2.5 py-[50px] w-full">
      <header className="flex flex-col max-w-[1437px] items-center justify-center gap-14">
        <div className="flex flex-col max-w-[1245px] items-center gap-[21px]">
          <h2 className="[font-family:'Inter',Helvetica] font-extrabold text-black text-4xl md:text-5xl lg:text-[64px] text-center tracking-[0] leading-tight lg:leading-[50px]">
            How Cloop Works?
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-0 w-full max-w-[1438px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-[15px] pt-[1.76px] pb-0 px-0"
          >
            <h3 className="[font-family:'Inter',Helvetica] font-extrabold text-[#443e4b] text-2xl md:text-3xl lg:text-[35.2px] text-center tracking-[0] leading-tight lg:leading-[87.9px] whitespace-normal lg:whitespace-nowrap px-4">
              {step.title}
            </h3>

            <div className="w-full overflow-hidden flex justify-center p-4">
              <img
                className="w-full h-[300px] md:h-[400px] object-contain"
                alt={step.title}
                src={step.frameIcon}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 w-full">
        <Button className="h-auto gap-[11.29px] px-[45.17px] py-[25.41px] rounded-[11.29px] bg-[#7317e6] hover:bg-[#5f12c4] text-[#f6f7f9] [font-family:'Avenir_Next_LT_Pro-Bold',Helvetica] font-bold text-[28.2px] leading-[33.9px] tracking-[0] shadow-xl shadow-purple-200">
          Download App <Zap className="w-6 h-6 fill-current text-yellow-300" />
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-6 w-full">
          <a
            href="https://play.google.com/store"
            className="relative w-[200px] h-[59px] bg-black rounded-[7.4px] overflow-hidden border-[1.48px] border-solid border-[#a6a6a6] block hover:scale-105 transition-transform"
            aria-label="Get it on Google Play"
          >
            <img
              className="absolute w-[62.80%] h-[42.58%] top-[42.62%] left-[30.40%]"
              alt="Google play"
              src="/figmaAssets/google-play.svg"
            />
            <img
              className="absolute w-[28.78%] h-[15.67%] top-[16.91%] left-[30.56%]"
              alt="Get it on"
              src="/figmaAssets/get-it-on-3.svg"
            />
            <img
              className="absolute top-[11px] left-[15px] w-[34px] h-[38px]"
              alt="Google play logo"
              src="/figmaAssets/google-play-logo-1.png"
            />
          </a>

          <a
            href="https://apple.com/app-store"
            className="relative w-[185px] h-[59px] bg-[#0c0d10] rounded-[10.37px] border-[1.48px] border-solid border-[#a6a6a6] block hover:scale-105 transition-transform"
            aria-label="Download on the App Store"
          >
            <img
              className="absolute w-[62.56%] h-[39.30%] top-[44.43%] left-[28.71%]"
              alt="App store"
              src="/figmaAssets/app-store-2.svg"
            />
            <img
              className="absolute w-[57.63%] h-[15.93%] top-[21.04%] left-[29.71%]"
              alt="Download on the"
              src="/figmaAssets/download-on-the-2.svg"
            />
            <img
              className="absolute w-[14.76%] h-[54.44%] top-[21.80%] left-[8.31%]"
              alt="Apple logo"
              src="/figmaAssets/apple-logo.svg"
            />
          </a>

          <Button 
            onClick={() => navigate("/login")}
            className="h-[59px] min-w-[200px] bg-white text-[#8d33ff] hover:bg-purple-50 rounded-[10.37px] border-2 border-[#8d33ff] font-black text-lg gap-3 shadow-lg transition-transform hover:scale-105"
          >
            <Monitor className="w-5 h-5" /> Try Web Version
          </Button>
        </div>
      </div>
    </section>
  );
};
