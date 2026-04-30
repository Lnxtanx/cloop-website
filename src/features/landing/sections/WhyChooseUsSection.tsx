import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Monitor } from "lucide-react";

export const WhyChooseUsSection = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-[70px] px-5 py-10 lg:py-[50px] w-full min-h-[600px] lg:min-h-screen bg-[linear-gradient(180deg,rgba(234,165,251,1)_0%,rgba(159,124,251,1)_100%)]">
      <div className="relative w-full max-w-[420px] lg:w-[480px] aspect-[368/706] hidden lg:block">
        <img
          src="/1.png"
          alt="Real Time Score Predictor"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col w-full max-w-[700px] items-start justify-center gap-5 lg:gap-7">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-black text-white border border-white/30 uppercase tracking-widest mb-2">
            Beta Testing Mode • Web Version
        </div>

        <h1 className="w-full font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-tight">
          <span className="text-[#101566]">Improve Your Grades with Cloop&apos;s Real Time </span>
          <span className="text-white">Score Predictor</span>
        </h1>

        <p className="w-full font-medium text-[#39343f] text-lg md:text-2xl lg:text-3xl leading-relaxed">
          Cloop combines AI Tutor with a real time Error Corrections to predict
          real time scores and increase your grades.
        </p>

        <div className="block lg:hidden relative w-full max-w-[320px] md:max-w-[420px] mx-auto aspect-[368/706] mb-6">
          <img
            src="/1.png"
            alt="Real Time Score Predictor"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
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
              target="_blank"
              rel="noopener noreferrer"
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
                className="h-[59px] min-w-[185px] bg-white text-[#8d33ff] hover:bg-purple-50 rounded-[10.37px] border-2 border-white font-black text-lg gap-3 shadow-lg transition-transform hover:scale-105"
            >
                <Monitor className="w-5 h-5" /> Try Web Version
            </Button>
          </div>
          
          <p className="text-white/80 font-bold text-sm text-center lg:text-left italic">
            * Currently in Beta. Access full dashboard by clicking "Try Web Version" or Login.
          </p>
        </div>
      </div>
    </section>
  );
};
