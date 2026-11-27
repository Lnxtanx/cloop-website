import { CheckCircle2, MapPin, MessageSquare, ClipboardCheck } from "lucide-react";

const thinkingRows = [
  {
    skill: "Thinking beyond the textbook",
    question: "How do I answer a question that goes beyond my textbook but happens around me?",
    example:
      'Starts every concept from something your child has seen. "Why are water tanks kept on the roof?"',
  },
  {
    skill: "Finding the flaw in my thinking",
    question: "What is wrong with my thinking about this concept?",
    example:
      'Asks a narrower question that exposes the gap, instead of giving the answer. "If clean water were the reason, would a tank on the ground work as well?"',
  },
  {
    skill: "Applying it to everyday problems",
    question: "How can I use this concept to solve problems in my everyday life?",
    example:
      'Changes the situation and asks again. "Why is a dam wider at the bottom than at the top?"',
  },
  {
    skill: "Self-correction",
    question: "What changed my mind?",
    example:
      'Lets your child revise an answer after a hint, then records what they did on their own. From "keeps water clean" to "taller column, more pressure".',
  },
];

const importanceCards = [
  {
    title: "AI makes it easy to stop thinking",
    desc: "Among 319 knowledge workers, more confidence in AI went with less critical thinking.",
    refNum: 5,
  },
  {
    title: "Board exams test it",
    desc: "From 2024–25, 50% of the CBSE Class 10 theory paper is competency-focused questions.",
    refNum: 6,
  },
  {
    title: "NEP 2020 asks for it",
    desc: 'Teaching focused on "key concepts, ideas, applications, and problem-solving".',
    refNum: 7,
  },
];

const comparisonRows = [
  {
    label: "Starts from",
    chatgpt: "Whatever question or page you bring",
    cloop: "Your child’s school chapter, with its concepts mapped",
  },
  {
    label: "When stuck",
    chatgpt: "Explains, or guides in Study Mode",
    cloop: "A hint first; the answer after another try",
  },
  {
    label: "What it records",
    chatgpt: "The chat",
    cloop: "Each concept: mastered on their own, done with a hint, or needs practice",
  },
  {
    label: "Who sees progress",
    chatgpt: "You",
    cloop: "Student, parent and teacher, each with their own view",
  },
];

export const CriticalThinkingSection = (): JSX.Element => {
  return (
    <section
      id="thinking"
      className="w-full bg-[#FAF8FF] border-b border-zinc-200 scroll-mt-16 text-left"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Part A: Thinking skills, inside the syllabus */}
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
            Thinking skills, inside the syllabus
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            Cloop builds critical thinking skills through academic curriculum learning
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Thinking skills stick when they are used on real content. Cloop practises them inside
            the chapter your child will be examined on, not in a separate course.
          </p>
        </div>

        {/* Thinking Skills Table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="hidden md:grid md:grid-cols-12 bg-zinc-50 border-b border-zinc-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <div className="col-span-3">Thinking skill</div>
            <div className="col-span-4">The question it trains</div>
            <div className="col-span-5">What Cloop does, with a Class 8 example</div>
          </div>

          <div className="divide-y divide-zinc-200">
            {thinkingRows.map((row) => (
              <div
                key={row.skill}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 px-5 sm:px-6 py-5 text-sm leading-relaxed"
              >
                <div className="md:col-span-3 font-bold text-zinc-950">{row.skill}</div>
                <div className="md:col-span-4 text-zinc-700 font-medium">{row.question}</div>
                <div className="md:col-span-5 text-zinc-600">{row.example}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why is critical thinking important? */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-zinc-950">Why is critical thinking important?</h3>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            {importanceCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed"
              >
                <p className="font-bold text-zinc-950">{card.title}</p>
                <p className="mt-2 text-zinc-600">
                  {card.desc}{" "}
                  <a
                    href={`#ref-${card.refNum}`}
                    className="font-semibold text-purple-700 hover:underline"
                  >
                    [{card.refNum}]
                  </a>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Part B: Cloop vs ChatGPT */}
        <div className="mt-16 pt-16 border-t border-purple-200/60">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
              Cloop vs ChatGPT
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              Cloop is not ChatGPT. Cloop is customised for academic learning.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
              ChatGPT’s Study Mode can also guide with questions and check understanding. The
              difference is what Cloop starts from and what it keeps track of.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
            <div className="grid grid-cols-12 bg-zinc-50 border-b border-zinc-200 px-5 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider">
              <div className="col-span-3 text-zinc-500" />
              <div className="col-span-4 text-zinc-500">ChatGPT</div>
              <div className="col-span-5 text-purple-700">Cloop</div>
            </div>

            <div className="divide-y divide-zinc-200">
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 sm:px-6 py-4 text-sm leading-relaxed items-center"
                >
                  <div className="md:col-span-3 font-bold text-zinc-950">{row.label}</div>
                  <div className="md:col-span-4 text-zinc-500">{row.chatgpt}</div>
                  <div className="md:col-span-5 font-medium text-zinc-950">{row.cloop}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Linked Product Screens Strip (same concept across Chapter Map, Tutor Exchange, Mastery Report) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Screen 1: Chapter Map */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                1. Chapter map
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-950">Class 8 Science · Chapter 6</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600">
                  Pressure = force ÷ area
                </li>
                <li className="px-3 py-2 rounded-lg bg-purple-600 text-white font-semibold flex items-center justify-between">
                  <span>Pressure in liquids</span>
                  <span className="text-[10px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </li>
                <li className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600">
                  Air pressure
                </li>
              </ul>
            </div>

            {/* Screen 2: Tutor Exchange */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
                2. Tutor exchange
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-950">Pressure in liquids</p>
              <div className="mt-3 space-y-2 text-xs leading-relaxed">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-zinc-700">
                  <strong className="text-zinc-950">Cloop:</strong> Would a ground-floor tap flow
                  faster or slower if the tank sat on the ground?
                </div>
                <div className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-zinc-900">
                  <strong className="text-purple-700">Student:</strong> Slower — less water column
                  height means lower liquid pressure.
                </div>
              </div>
            </div>

            {/* Screen 3: Mastery Report */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-700" />
                3. Mastery report
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-950">Pressure in liquids</p>
              <div className="mt-3 rounded-lg bg-emerald-50/40 border border-emerald-200 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900">Concept status</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Mastered on their own
                  </span>
                </div>
                <p className="text-zinc-600">
                  Visible in student score prediction, parent gap summary, and teacher cohort view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
