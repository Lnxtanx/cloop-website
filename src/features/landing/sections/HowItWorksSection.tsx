import { useState } from "react";
import { CheckCircle2, CircleDot, Lightbulb, Sparkles } from "lucide-react";

interface ConceptPreview {
  id: string;
  order: string;
  topicName: string;
  status: "Mastered" | "In progress" | "Next up";
  studentUnsure: string;
  cloopHint: string;
  cloopChangedDetail: string;
  studentMastery: string;
}

const chapterConcepts: ConceptPreview[] = [
  {
    id: "push-pull",
    order: "Concept 1",
    topicName: "What Is a Force: Push and Pull",
    status: "Mastered",
    studentUnsure: "When a football rolls along the grass, does something keep pushing it forward?",
    cloopHint:
      "Think about what touches the ball after it leaves your foot — is the kick still acting, or did something else slow it down?",
    cloopChangedDetail:
      "Suppose you roll the exact same ball on smooth ice instead of grass. What changes, and why?",
    studentMastery:
      "A force isn't needed to keep it moving — friction from grass slows it down, so on smooth ice it rolls much farther.",
  },
  {
    id: "pressure-liquids",
    order: "Concept 2",
    topicName: "Pressure in Liquids & Depth",
    status: "In progress",
    studentUnsure: "I'm not sure why the bottom hole in the bottle shoots water further than the top.",
    cloopHint:
      "Compare how much water is sitting above the top hole versus above the bottom hole pressing down.",
    cloopChangedDetail:
      "Now suppose the water level drops halfway down the bottle. Does the bottom jet change?",
    studentMastery:
      "Yes — less water above means less pressure at the bottom, so the jet doesn't go as far as the bottle empties.",
  },
  {
    id: "moment-force",
    order: "Concept 3",
    topicName: "Turning Effect of a Force",
    status: "Next up",
    studentUnsure: "Why does pushing near the door hinges feel so much harder than near the handle?",
    cloopHint:
      "Keep the push size the same and look at the distance from the hinge where your hand presses.",
    cloopChangedDetail:
      "What if you move your hand halfway toward the hinges — how would your push have to change to swing the door the same way?",
    studentMastery:
      "With half the distance from the hinge, I'd need twice the force to get the same turning effect.",
  },
];

export const HowItWorksSection = (): JSX.Element => {
  const [selectedId, setSelectedId] = useState<string>("pressure-liquids");
  const activeConcept =
    chapterConcepts.find((c) => c.id === selectedId) || chapterConcepts[1];

  return (
    <section id="how-it-works" className="w-full bg-[#F7F8FB] border-b border-zinc-200/80 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Intro Copy */}
        <div className="max-w-3xl text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            How Cloop works
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            One chapter, mapped concept by concept
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Choose the chapter you’re studying at school. Cloop has mapped your curriculum concept
            by concept, so you can work through one idea at a time.
          </p>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Cloop is a Socratic tutor. It uses your answer to decide what to ask next. If you’re
            unsure, it offers a hint. If you’ve understood, it changes a detail and asks you to
            think again. When you can explain the idea and use it to solve a fresh problem on your
            own, you’re demonstrating concept mastery.
          </p>
        </div>

        {/* Paired Visual: Chapter Concept Map + Real Chat (Topic Name visible in both) */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Chapter Concept Map */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Chapter Concept Map
                  </p>
                  <p className="text-base font-bold text-zinc-950 mt-0.5">
                    Chapter 5 · Exploring Forces
                  </p>
                </div>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                  3 concepts
                </span>
              </div>

              {/* Active Topic Name Banner (explicitly pinned in map) */}
              <div className="mt-4 rounded-xl bg-zinc-950 text-white px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                    Selected Topic
                  </p>
                  <p className="text-sm font-semibold truncate">{activeConcept.topicName}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-white shrink-0">
                  {activeConcept.order}
                </span>
              </div>

              {/* Concept Nodes */}
              <div className="mt-4 space-y-2.5" role="tablist" aria-label="Chapter concepts">
                {chapterConcepts.map((concept) => {
                  const isActive = concept.id === activeConcept.id;
                  return (
                    <button
                      key={concept.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedId(concept.id)}
                      className={`w-full text-left rounded-xl p-3.5 border transition-all flex items-start justify-between gap-3 ${
                        isActive
                          ? "border-zinc-950 bg-zinc-50 shadow-xs"
                          : "border-zinc-200/80 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {concept.status === "Mastered" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <CircleDot
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isActive ? "text-zinc-950" : "text-zinc-400"
                            }`}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-zinc-400">{concept.order}</p>
                          <p className="text-sm font-semibold text-zinc-900 leading-snug">
                            {concept.topicName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          concept.status === "Mastered"
                            ? "bg-emerald-50 text-emerald-700"
                            : isActive
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {concept.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-400">
              Select a concept node to see its paired Socratic chat.
            </p>
          </div>

          {/* Right Card: Real Chat about the selected concept (same Topic Name pinned at top) */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden flex flex-col text-left">
            <div className="px-5 py-4 border-b border-zinc-200/80 bg-white flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Socratic Tutor Chat · {activeConcept.order}
                </p>
                <p className="text-base font-bold text-zinc-950">{activeConcept.topicName}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Concept mastery flow
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4 bg-[#FAFAFC] flex-1">
              {/* Unsure student turn */}
              <div className="flex flex-col items-end">
                <span className="text-[11px] text-zinc-400 mb-1 px-1">Student</span>
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 text-white px-4 py-2.5 text-sm leading-relaxed">
                  {activeConcept.studentUnsure}
                </div>
              </div>

              {/* Hint offered */}
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold text-amber-700 mb-1 px-1 inline-flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Cloop offers a hint
                </span>
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-amber-50/70 border border-amber-200 text-zinc-800 px-4 py-2.5 text-sm leading-relaxed">
                  {activeConcept.cloopHint}
                </div>
              </div>

              {/* Detail changed */}
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold text-zinc-600 mb-1 px-1">
                  Cloop changes a detail
                </span>
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 text-zinc-800 px-4 py-2.5 text-sm leading-relaxed">
                  {activeConcept.cloopChangedDetail}
                </div>
              </div>

              {/* Student solves on their own */}
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-semibold text-emerald-700 mb-1 px-1">
                  Student explains independently · Concept mastery
                </span>
                <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-emerald-50 border border-emerald-200 text-zinc-900 px-4 py-2.5 text-sm leading-relaxed">
                  {activeConcept.studentMastery}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
