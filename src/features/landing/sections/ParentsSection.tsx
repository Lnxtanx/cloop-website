import { CheckCircle2, Lightbulb, MessageSquareQuote } from "lucide-react";

export const ParentsSection = (): JSX.Element => {
  return (
    <section id="for-parents" className="w-full bg-[#F7F8FB] border-b border-zinc-200/80 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            For parents
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            See what your child can solve on their own
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Cloop’s learning report shows where your child needed a hint and what they could work
            out independently. It gives you a starting point for a conversation at home: “Can you
            show me how you figured that out?”
          </p>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Every time your child checks an assumption or spots a missing detail, they practise a
            skill they can use beyond school. When AI gives them a convincing answer, they’ll have
            questions of their own to ask.
          </p>
        </div>

        {/* Designer Visual: Two moments from the same lesson, captioned "With a hint" and "On my own" */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-xs text-left">
          <div className="pb-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Same Lesson · Learning Report
              </p>
              <p className="text-sm sm:text-base font-bold text-zinc-950">
                Class 8 Science · Chapter: Friction &amp; Motion
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
              2 moments from today’s session
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Moment 1: With a hint */}
            <figure className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 flex flex-col justify-between">
              <div>
                <figcaption className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <Lightbulb className="w-3.5 h-3.5" />
                  With a hint
                </figcaption>

                <div className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div className="rounded-xl bg-white border border-zinc-200/80 px-3.5 py-2.5 text-zinc-700">
                    <span className="block text-[11px] font-semibold text-zinc-400 mb-0.5">
                      Child hesitated
                    </span>
                    “Wet marble just feels slippery because water pushes your shoe sideways.”
                  </div>

                  <div className="rounded-xl bg-amber-100/70 border border-amber-200 px-3.5 py-2.5 text-zinc-800">
                    <span className="block text-[11px] font-semibold text-amber-800 mb-0.5">
                      Cloop’s hint
                    </span>
                    “Zoom in on the tiny rough bumps on your sole and the floor — what happens to
                    those gaps when water fills them?”
                  </div>

                  <div className="rounded-xl bg-white border border-zinc-200/80 px-3.5 py-2.5 text-zinc-900">
                    <span className="block text-[11px] font-semibold text-zinc-500 mb-0.5">
                      Child figured out next
                    </span>
                    “The bumps can’t lock together as much, so friction drops.”
                  </div>
                </div>
              </div>
            </figure>

            {/* Moment 2: On my own */}
            <figure className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 flex flex-col justify-between">
              <div>
                <figcaption className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  On my own
                </figcaption>

                <div className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div className="rounded-xl bg-white border border-zinc-200/80 px-3.5 py-2.5 text-zinc-700">
                    <span className="block text-[11px] font-semibold text-zinc-400 mb-0.5">
                      Fresh problem (same lesson, 6 mins later)
                    </span>
                    “Why do racing tyres have grooves cut into the rubber for wet roads?”
                  </div>

                  <div className="rounded-xl bg-emerald-100/70 border border-emerald-200 px-3.5 py-2.5 text-zinc-900">
                    <span className="block text-[11px] font-semibold text-emerald-800 mb-0.5">
                      Child solved independently · No hint used
                    </span>
                    “The grooves channel trapped water out from under the tyre so the rubber grips
                    the rough road again — otherwise friction drops just like on wet marble.”
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200/70 text-xs font-medium text-emerald-800">
                Transferred the idea to a new situation independently.
              </div>
            </figure>
          </div>

          {/* Conversation Starter Strip */}
          <div className="mt-5 rounded-xl bg-zinc-50 border border-zinc-200/80 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-sm text-zinc-700">
            <MessageSquareQuote className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>
              <strong className="text-zinc-900">Conversation starter at home:</strong> “Can you
              show me how you figured out why tyre grooves help on wet roads?”
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
