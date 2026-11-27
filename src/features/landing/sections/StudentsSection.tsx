import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const StudentsSection = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section id="for-students" className="w-full bg-white border-b border-zinc-200/80 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              For students
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              See what you could score and what to revise next
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
              Finished a chapter? Find out how well you know it. Cloop’s Score Predictor uses the
              understanding you’ve shown across concepts to estimate your exam score. You can see
              which ideas you’ve mastered and go straight to the ones that still need practice.
            </p>
          </div>

          {/* Designer Visual: Estimated score beside a specific concept to revise (readable at a glance) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-zinc-200 bg-[#F7F8FB] p-4 sm:p-6 shadow-xs text-left">
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-200/80">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Chapter Summary · Class 10 Mathematics
                  </p>
                  <p className="text-sm font-bold text-zinc-900">
                    Quadratic Equations · 6 concepts
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  4 mastered
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {/* Left Card: Estimated Score */}
                <div className="rounded-xl bg-white border border-zinc-200 p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Estimated Exam Score
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold tracking-tight text-zinc-950">
                        78
                      </span>
                      <span className="text-lg font-semibold text-zinc-400">/ 100</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-100 space-y-2">
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-full w-[78%] rounded-full bg-zinc-950" />
                    </div>
                    <p className="text-xs text-zinc-500">
                      Strong on factorisation &amp; roots; 2 concepts still need work.
                    </p>
                  </div>
                </div>

                {/* Right Card: Specific Concept to Revise */}
                <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Concept to revise next
                      </span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        +12 marks upside
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-zinc-950 leading-snug">
                      Nature of Roots (Discriminant)
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                      Needed a hint when checking when{" "}
                      <span className="font-mono text-xs bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">
                        b² − 4ac = 0
                      </span>{" "}
                      gives two equal real roots.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/demo")}
                    className="mt-5 w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Practise this concept</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
