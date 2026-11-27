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
      description: "You can start your 7-day free trial on Cloop Web right now.",
      action: {
        label: "Start on Web",
        onClick: () => navigate("/signup"),
      },
    });
  };

  return (
    <section id="get" className="w-full bg-white text-zinc-950 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
        <div className="rounded-3xl border border-purple-200/80 bg-[#FAF8FF] px-6 sm:px-12 py-12 sm:py-14 shadow-xs">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-extrabold tracking-tight leading-tight text-zinc-950">
            Try Cloop with a chapter from this week.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl mx-auto">
            Seven days free. Pick a chapter and see which concepts your child can already use on
            their own.
          </p>

          {/* Primary Black Action & Secondary Outline */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              type="button"
              onClick={() => navigate("/signup")}
              className="h-12 px-7 bg-black hover:bg-zinc-800 text-white text-sm sm:text-base font-bold rounded-full shadow-sm"
            >
              Try Cloop free for 7 days
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/demo")}
              className="h-12 px-6 bg-white border-zinc-300 hover:border-purple-500 hover:bg-purple-50/50 text-zinc-900 hover:text-purple-700 text-sm sm:text-base font-semibold rounded-full"
            >
              See a lesson
            </Button>
          </div>

          {/* Black Store Download Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleMobileAppClick("Google Play")}
              aria-label="Get it on Google Play"
              className="relative w-[184px] h-[54px] bg-black hover:bg-zinc-900 rounded-[9px] overflow-hidden border border-black transition-colors shadow-sm"
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
              className="relative w-[172px] h-[54px] bg-black hover:bg-zinc-900 rounded-[9px] border border-black transition-colors shadow-sm"
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

          <p className="mt-6 text-xs text-zinc-500">
            Already have a Guest ID or registered email?{" "}
            <button
              type="button"
              onClick={onOpenSignIn}
              className="text-zinc-950 hover:text-purple-700 font-semibold underline underline-offset-4"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
