import { ArrowRight, PlayCircle, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onOpenSignIn: () => void;
}

export const HeroSection = ({ onOpenSignIn }: HeroSectionProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white border-b border-zinc-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline + Subcopy + CTAs */}
          <div className="lg:col-span-6 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-zinc-950 tracking-tight leading-[1.12]">
              The AI tutor that helps your child think for themselves
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
              Cloop turns each chapter into a conversation. Your child learns to question an
              answer, explain why it works and apply the idea independently. That’s the kind of
              judgement they’ll need in a world of AI-generated answers.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                type="button"
                onClick={() => navigate("/signup")}
                className="h-12 px-6 bg-zinc-950 hover:bg-zinc-800 text-white text-sm sm:text-base font-semibold rounded-xl shadow-sm gap-2"
              >
                Try Cloop free for 7 days
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/demo")}
                className="h-12 px-5 border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-sm sm:text-base font-semibold rounded-xl gap-2"
              >
                <PlayCircle className="w-4 h-4 text-zinc-700" />
                See a lesson
              </Button>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-zinc-500">
              Already have a Guest ID or account?{" "}
              <button
                type="button"
                onClick={onOpenSignIn}
                className="font-semibold text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Right Column: Anonymised Cloop chat where a follow-up prompts rethinking */}
          <div className="lg:col-span-6">
            <div
              aria-label="Anonymised Cloop tutoring conversation example"
              className="rounded-2xl border border-zinc-200 bg-[#F7F8FB] shadow-sm overflow-hidden"
            >
              {/* Chat Chrome Header */}
              <div className="bg-white border-b border-zinc-200/80 px-5 py-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Anonymised Lesson Excerpt
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">
                    Class 8 Science · Force &amp; Pressure
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
                  1-on-1 chat
                </span>
              </div>

              {/* Conversation Body */}
              <div className="p-5 space-y-4 text-left">
                {/* Turn 1: Student initial answer */}
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-medium text-zinc-400 mb-1 px-1">Student</span>
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 text-white px-4 py-3 text-sm leading-relaxed shadow-xs">
                    A wider schoolbag strap feels lighter because the bag weighs less on wider
                    straps.
                  </div>
                </div>

                {/* Turn 2: Cloop follow-up prompting student to rethink */}
                <div className="flex flex-col items-start">
                  <span className="text-[11px] font-semibold text-zinc-600 mb-1 px-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    Cloop · Follow-up question
                  </span>
                  <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white border border-amber-200 px-4 py-3.5 text-sm text-zinc-800 leading-relaxed shadow-xs">
                    Wait — if the same books stay inside the bag, does its weight change when you
                    swap the strap? Think about what else changed on your shoulder, and{" "}
                    <span className="font-semibold text-zinc-950">explain why it hurts less</span>.
                  </div>
                </div>

                {/* Turn 3: Student rethinks & explains why */}
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-medium text-emerald-700 mb-1 px-1 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Student · Rethought explanation
                  </span>
                  <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-emerald-50 border border-emerald-200 text-zinc-900 px-4 py-3 text-sm leading-relaxed">
                    Oh — the weight stays the same! A wider strap spreads that same force over a
                    larger area, so the pressure on my shoulder is smaller.
                  </div>
                </div>
              </div>

              {/* Subtle Interactive Prompt Footer */}
              <div className="bg-white border-t border-zinc-200/80 px-5 py-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Prompted to rethink &amp; justify in own words</span>
                <button
                  type="button"
                  onClick={() => navigate("/demo")}
                  className="font-semibold text-zinc-950 hover:underline whitespace-nowrap"
                >
                  See a live lesson →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
