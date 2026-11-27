import { ArrowRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface GetAppSectionProps {
  onOpenSignIn: () => void;
}

export const GetAppSection = ({ onOpenSignIn }: GetAppSectionProps): JSX.Element => {
  const navigate = useNavigate();

  const handleMobileAppClick = (storeName: string) => {
    toast.info(`Cloop for ${storeName} is coming soon`, {
      description: "You can start your 7-day free trial right now on Cloop Web.",
      action: {
        label: "Start on Web",
        onClick: () => navigate("/signup"),
      },
    });
  };

  return (
    <section id="get-the-app" className="w-full bg-[#F7F8FB] scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="rounded-3xl bg-zinc-950 text-white px-6 sm:px-10 lg:px-14 py-12 sm:py-16 text-center shadow-sm">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl mx-auto">
            Try Cloop with a chapter you’re studying today
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl mx-auto">
            Start with the topic you’re least sure about. Work it through with Cloop and see what
            you can do on your own.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              type="button"
              onClick={() => navigate("/signup")}
              className="h-12 px-7 bg-white hover:bg-zinc-100 text-zinc-950 text-sm sm:text-base font-bold rounded-xl shadow-sm gap-2"
            >
              Try Cloop free for 7 days
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/demo")}
              className="h-12 px-5 bg-transparent border-zinc-700 hover:bg-zinc-900 text-white hover:text-white text-sm sm:text-base font-semibold rounded-xl gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              See a lesson
            </Button>
          </div>

          {/* Store Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleMobileAppClick("Google Play")}
              aria-label="Get it on Google Play"
              className="relative w-[184px] h-[54px] bg-black rounded-[8px] overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              <img
                className="absolute w-[62.80%] h-[42.58%] top-[42.62%] left-[30.40%]"
                alt="Google Play"
                src="/figmaAssets/google-play.svg"
              />
              <img
                className="absolute w-[28.78%] h-[15.67%] top-[16.91%] left-[30.56%]"
                alt="Get it on"
                src="/figmaAssets/get-it-on-3.svg"
              />
              <img
                className="absolute top-[10px] left-[14px] w-[30px] h-[34px]"
                alt="Google Play logo"
                src="/figmaAssets/google-play-logo-1.png"
              />
            </button>

            <button
              type="button"
              onClick={() => handleMobileAppClick("App Store")}
              aria-label="Download on the App Store"
              className="relative w-[172px] h-[54px] bg-[#0c0d10] rounded-[9px] border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              <img
                className="absolute w-[62.56%] h-[39.30%] top-[44.43%] left-[28.71%]"
                alt="App Store"
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
            </button>
          </div>

          <p className="mt-6 text-xs text-zinc-400">
            Already have a Guest ID or registered email?{" "}
            <button
              type="button"
              onClick={onOpenSignIn}
              className="text-white font-semibold underline underline-offset-4 hover:text-zinc-200"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
