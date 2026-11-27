import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onOpenSignIn: () => void;
}

const heroQuestions = [
  {
    num: 1,
    text: "How do I answer a question that goes beyond my textbook but happens around me?",
  },
  {
    num: 2,
    text: "What is wrong with my thinking about this concept?",
  },
  {
    num: 3,
    text: "How can I use this concept to solve problems in my everyday life?",
  },
];

export const HeroSection = ({ onOpenSignIn }: HeroSectionProps): JSX.Element => {
  const navigate = useNavigate();

  const scrollToLesson = () => {
    const el = document.getElementById("lesson");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/demo");
    }
  };

  return (
    <section id="top" className="w-full bg-white text-zinc-950 border-b border-zinc-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Headline, Subcopy, 3 Numbered Questions, Black CTAs */}
          <div className="lg:col-span-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold text-zinc-950 tracking-tight leading-[1.08]">
              The AI tutor that helps your child question an answer
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
              Cloop is a Socratic AI tutor that turns school learning into everyday conversations,
              until your child masters each academic concept and can show the evidence. Along the
              way, they learn to ask three questions that matter in the age of AI.
            </p>

            {/* Three Core Questions */}
            <ol className="mt-7 space-y-3.5">
              {heroQuestions.map((item) => (
                <li key={item.num} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold shrink-0">
                    {item.num}
                  </span>
                  <span className="text-sm sm:text-[15px] text-zinc-800 leading-snug">
                    {item.text}
                  </span>
                </li>
              ))}
            </ol>

            {/* Primary Black CTA & Secondary Outline CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                type="button"
                onClick={() => navigate("/signup")}
                className="h-12 px-6 bg-black hover:bg-zinc-800 text-white text-sm sm:text-base font-bold rounded-full shadow-sm"
              >
                Try Cloop free for 7 days
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={scrollToLesson}
                className="h-12 px-6 bg-white border-zinc-300 hover:border-purple-500 hover:bg-purple-50/50 text-zinc-900 hover:text-purple-700 text-sm sm:text-base font-semibold rounded-full"
              >
                See a lesson
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              <span>Mapped to CBSE, ICSE, IB and IGCSE chapters, Classes 5–10.</span>
              <button
                type="button"
                onClick={onOpenSignIn}
                className="text-zinc-900 hover:text-purple-700 underline underline-offset-4 font-semibold"
              >
                Already registered? Sign in
              </button>
            </div>
          </div>

          {/* Right Column: Clean White & Purple Cloop Exchange Card (Class 8 Science · Pressure) */}
          <div className="lg:col-span-6">
            <div
              aria-label="Class 8 Science Pressure example conversation"
              className="rounded-2xl border border-purple-200/80 bg-[#FAF8FF] shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-5 py-3.5 bg-white border-b border-zinc-200/80 flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-bold text-zinc-950">
                  Class 8 Science · Pressure
                </span>
                <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  Anonymised lesson
                </span>
              </div>

              {/* Conversation Thread */}
              <div className="p-5 space-y-3.5 text-left">
                {/* Cloop opening question */}
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 text-zinc-900 px-4 py-3 text-sm leading-relaxed shadow-xs">
                    Why do you think water tanks are kept on the roof?
                  </div>
                </div>

                {/* Student initial answer */}
                <div className="flex justify-end">
                  <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-purple-600 text-white font-medium px-4 py-2.5 text-sm leading-relaxed shadow-xs">
                    So the water stays clean.
                  </div>
                </div>

                {/* Hint badge */}
                <div className="flex justify-center py-0.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    A hint, not the answer
                  </span>
                </div>

                {/* Cloop narrower hint */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 text-zinc-900 px-4 py-3 text-sm leading-relaxed shadow-xs">
                    If the tank sat on the ground, would a ground-floor tap flow faster or slower?
                  </div>
                </div>

                {/* Student revises answer & explains what changed their mind */}
                <div className="flex justify-end">
                  <div className="max-w-[86%] rounded-2xl rounded-tr-sm bg-purple-600 text-white font-medium px-4 py-3 text-sm leading-relaxed shadow-xs">
                    Slower. I thought height was only for keeping dust out, but a taller column of
                    water pushes down harder — so keeping the tank high makes taps flow faster.
                  </div>
                </div>

                {/* Explained on their own badge */}
                <div className="flex justify-center py-0.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    Explained on their own
                  </span>
                </div>

                {/* Follow-up fresh problem */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 text-zinc-900 px-4 py-3 text-sm leading-relaxed shadow-xs">
                    Good. Now a new one: why is a dam wider at the bottom than at the top?
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-white border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-500">
                <span>Student revised their answer after one hint</span>
                <button
                  type="button"
                  onClick={() => navigate("/demo")}
                  className="text-purple-700 hover:text-purple-900 font-semibold hover:underline"
                >
                  Try live chat →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
