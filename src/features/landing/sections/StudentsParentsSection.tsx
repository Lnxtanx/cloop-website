import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";

export const StudentsParentsSection = (): JSX.Element => {
  return (
    <section
      id="students"
      className="w-full bg-white border-b border-zinc-200 scroll-mt-16 text-left"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
            For students and parents
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            The dashboard grades mastery, not memory
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            A concept moves to mastered only when your child completes all three steps without help,
            so every number on the dashboard is evidence of what they can actually do.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: For students — Score prediction based on mastery */}
          <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFC] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-700">
                For students
              </p>
              <h3 className="mt-1.5 text-2xl font-bold text-zinc-950">
                Score prediction based on mastery
              </h3>

              {/* Score Predictor UI Card */}
              <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Score Predictor
                  </span>
                  <span className="text-xs text-zinc-500">Chapter 6, Pressure</span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold tracking-tight text-zinc-950">72%</span>
                  <span className="text-sm font-medium text-zinc-600">
                    estimated score · Chapter 6, Pressure
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 border border-zinc-200 px-3.5 py-2.5">
                    <span className="font-semibold text-zinc-900">Pressure in liquids</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mastered on your own
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50/70 border border-amber-200 px-3.5 py-2.5">
                    <span className="font-semibold text-zinc-900">Air pressure</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Practise next
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Your estimated score comes only from concepts you’ve mastered on your own, so it
                rises when your understanding does, not when you reread notes.
              </p>
              <p className="mt-2 text-xs text-zinc-400">Example figures.</p>
            </div>
          </div>

          {/* Card 2: For parents — Clear evidence of learning gaps */}
          <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFC] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-700">
                For parents
              </p>
              <h3 className="mt-1.5 text-2xl font-bold text-zinc-950">
                Clear evidence of learning gaps
              </h3>

              {/* Mastery Dashboard UI Card */}
              <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Mastery Dashboard
                  </span>
                  <span className="text-xs text-zinc-500">Chapter 6, Pressure</span>
                </div>

                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 border border-zinc-200 px-3.5 py-2.5">
                    <span className="font-semibold text-zinc-900">Pressure = force ÷ area</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      On their own
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50/40 border border-amber-200 px-3.5 py-2.5">
                    <span className="font-semibold text-zinc-900">Pressure in liquids</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Lightbulb className="w-3.5 h-3.5" />
                      With a hint
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg bg-rose-50/70 border border-rose-200 px-3.5 py-2.5">
                    <span className="font-semibold text-zinc-900">Air pressure</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Needs practice
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Each concept shows whether your child did it alone, needed a hint, or still needs
                practice. When they say “I’ve finished pressure”, you can see the one concept worth
                revisiting together.
              </p>
              <p className="mt-2 text-xs text-zinc-400">Example figures.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
