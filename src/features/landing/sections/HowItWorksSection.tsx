import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "STEP 1",
    title: "Explain it",
    desc: 'Say why it works, in their own words, typed or spoken. "A taller column of water pushes harder."',
  },
  {
    step: "STEP 2",
    title: "Use it somewhere new",
    desc: 'Solve a problem they haven’t seen, with no hint. "Why is a dam wider at the bottom?"',
  },
  {
    step: "STEP 3",
    title: "Recall it later",
    desc: "Answer from memory at the end of the lesson, with no notes and no prompts.",
  },
];

const statusLegend = [
  {
    label: "Mastered on their own",
    classes: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    label: "Done with a hint",
    classes: "bg-amber-50 border-amber-200 text-amber-800",
  },
  {
    label: "Needs practice",
    classes: "bg-rose-50 border-rose-200 text-rose-700",
  },
];

const conceptFlow = [
  {
    stage: "Start from everyday life",
    summary: "A question about something your child has seen.",
    speaker: "Cloop",
    line: "Why are water tanks kept on the roof?",
  },
  {
    stage: "Ask for the reasoning",
    summary: "The first answer is a starting point, not the end.",
    speaker: "Your child · Cloop",
    line: "“So the water stays clean.” · What makes you say that?",
  },
  {
    stage: "Hint, not the answer",
    summary: "A narrower question; the next step stays theirs.",
    speaker: "Cloop",
    line: "If the tank sat on the ground, would the tap flow faster or slower?",
  },
  {
    stage: "Change the situation",
    summary: "A fresh problem, with no hint, shows real understanding.",
    speaker: "Cloop",
    line: "Why is a dam wider at the bottom than at the top?",
  },
  {
    stage: "Recall and record",
    summary: "From memory at the end, then saved to their mastery map.",
    speaker: "Mastery map",
    line: "Pressure in liquids · Mastered on their own",
  },
];

export const HowItWorksSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="mastery"
      className="w-full bg-[#FAF8FF] border-b border-zinc-200/80 text-zinc-950 scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Intro Block */}
        <div className="max-w-3xl text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
            Concept mastery
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-zinc-950 tracking-tight leading-[1.12]">
            How Cloop achieves concept mastery without compromising on academic performance
          </h2>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Every concept comes from your child’s school textbook and is checked the way exams
            check it: in their own words, on problems they haven’t seen, and from memory. A
            concept counts as mastered only when your child completes all three steps without help,
            so mastery and marks rise together.
          </p>
        </div>

        {/* Three Mastery Steps */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl bg-white border border-purple-200/70 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-purple-700">
                  {item.step}
                </p>
                <h3 className="mt-2 text-xl font-bold text-zinc-950">{item.title}</h3>
                <p className="mt-3 text-sm sm:text-[15px] text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recording Legend */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-zinc-600 font-medium">Every concept is recorded as</span>
          {statusLegend.map((item) => (
            <span
              key={item.label}
              className={`px-3 py-1 rounded-full border text-xs font-semibold ${item.classes}`}
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* #lesson: See it in one concept */}
        <div
          id="lesson"
          className="mt-12 rounded-2xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xs text-left scroll-mt-20"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-zinc-100">
            <div>
              <h3 className="text-2xl font-extrabold text-zinc-950">See it in one concept</h3>
              <p className="mt-1.5 text-sm sm:text-base text-zinc-600">
                Class 8 Science, Chapter 6: pressure in a liquid depends on the height of its column.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => navigate("/demo")}
              className="h-10 px-5 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-full gap-1.5 shadow-sm"
            >
              Open interactive lesson
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {conceptFlow.map((node, idx) => {
              const selected = idx === activeIndex;
              const isFinal = idx === conceptFlow.length - 1;
              return (
                <button
                  key={node.stage}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`text-left rounded-xl p-4 border transition-all flex flex-col justify-between ${
                    selected
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-[#FAFAFC] text-zinc-950 border-zinc-200 hover:border-purple-300 hover:bg-purple-50/40"
                  }`}
                >
                  <div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        selected ? "text-purple-100" : "text-purple-700"
                      }`}
                    >
                      {idx + 1}. {node.stage}
                    </span>
                    <p
                      className={`mt-1.5 text-xs leading-relaxed ${
                        selected ? "text-purple-100" : "text-zinc-600"
                      }`}
                    >
                      {node.summary}
                    </p>
                  </div>

                  <div
                    className={`mt-4 pt-3 border-t text-xs leading-relaxed ${
                      selected ? "border-white/20" : "border-zinc-200"
                    }`}
                  >
                    <span
                      className={`block font-bold mb-0.5 ${
                        isFinal
                          ? selected
                            ? "text-emerald-200"
                            : "text-emerald-700"
                          : selected
                          ? "text-white"
                          : "text-zinc-900"
                      }`}
                    >
                      {isFinal && <CheckCircle2 className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />}
                      {node.speaker}
                    </span>
                    <span className={selected ? "text-white/95 font-medium" : "text-zinc-700"}>
                      {node.line}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
