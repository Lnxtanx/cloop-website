import { Footer } from "./Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Monitor } from "lucide-react";

export const HeroSection = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="flex flex-col items-center w-full bg-white">
      <div className="w-full max-w-[1440px] px-5 lg:px-20 py-20 bg-[linear-gradient(137deg,rgba(104,59,218,1)_0%,rgba(180,129,230,1)_100%)] rounded-b-[40px] shadow-xl text-center text-white">
        <h1 className="text-4xl lg:text-6xl font-bold mb-10 leading-tight">
          Join 10,000+ students who are improving their grades with Cloop&apos;s Score Predictor.
        </h1>

        <p className="text-xl lg:text-2xl mb-12 max-w-[800px] mx-auto opacity-90">
          Choose a plan that fits your needs. Start with a 7-day free trial and explore all the features.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-[200px] h-[59px] bg-black rounded-[7.4px] overflow-hidden border-[1.48px] border-solid border-[#a6a6a6] block hover:scale-105 transition-transform"
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
            href="https://apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-[185px] h-[59px] bg-[#0c0d10] rounded-[10.37px] border-[1.48px] border-solid border-[#a6a6a6] block hover:scale-105 transition-transform"
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
            className="h-[59px] min-w-[200px] bg-white text-[#8d33ff] hover:bg-purple-50 rounded-[10.37px] border-2 border-white font-black text-lg gap-3 shadow-lg transition-transform hover:scale-105"
          >
            <Monitor className="w-5 h-5" /> Try Web Version
          </Button>
        </div>
      </div>

      <Footer />
    </section>
  );
};
