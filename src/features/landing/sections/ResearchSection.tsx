const secondaryStudies = [
  {
    stat: "2×",
    title: "the learning gains, in less time:",
    body: "Harvard physics students taught by an AI tutor built on teaching research, which revealed one step at a time, against a well-run active-learning class.",
    meta: "194 students, randomised, Scientific Reports 2025",
    refId: "ref-2",
    refNum: 2,
    takeaway: "So Cloop reveals one step at a time and asks before it tells.",
  },
  {
    stat: "+4 pts",
    title: "more students mastered their maths topics",
    body: "when an AI guided tutors towards expert moves, such as asking guiding questions. With less experienced tutors, the gain was 9 points.",
    meta: "900 tutors, 1,800 students, randomised, Stanford 2024",
    refId: "ref-3",
    refNum: 3,
    takeaway: "So Cloop is built on those expert moves: guiding questions, hints, then a fresh problem.",
  },
  {
    stat: "6 weeks",
    title: "of teacher-guided, curriculum-aligned AI tutoring",
    body: "improved students' English results, among the most cost-effective education programmes the World Bank has evaluated.",
    meta: "800 students, randomised, Nigeria, World Bank 2025",
    refId: "ref-4",
    refNum: 4,
    takeaway: "So Cloop follows your child's school chapters and reports to their teacher.",
  },
];

export const ResearchSection = (): JSX.Element => {
  return (
    <section
      id="research"
      className="w-full bg-white border-b border-zinc-200 scroll-mt-16 text-left"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
            The research behind it
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            Cloop is built around new-age educational research in the AI era
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Recent studies of AI in real classrooms show when it helps students learn and when it
            gets in the way. Each part of Cloop’s approach follows one of them.
          </p>
        </div>

        {/* Featured Study: Bastani et al. (2025) */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-[#FAFAFC] p-6 sm:p-8 shadow-xs">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-950">
            The kind of AI help decides whether practice becomes learning
          </h3>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Standard AI assistant */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm font-bold text-zinc-900">Standard AI assistant</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-600 mb-1">
                    <span>During practice</span>
                    <span className="font-bold text-zinc-900">+48%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full w-[38%] rounded-full bg-zinc-700" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-600 mb-1">
                    <span>Test without AI</span>
                    <span className="font-bold text-red-600">−17%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-red-100 overflow-hidden">
                    <div className="h-full w-[24%] rounded-full bg-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Hint-giving AI tutor */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5">
              <p className="text-sm font-bold text-zinc-950">
                AI tutor that gives hints, not answers
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-600 mb-1">
                    <span>During practice</span>
                    <span className="font-bold text-purple-700">+127%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden">
                    <div className="h-full w-[92%] rounded-full bg-purple-600" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-600 mb-1">
                    <span>Test without AI</span>
                    <span className="font-bold text-emerald-700">No clear drop</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full w-[55%] rounded-full bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-200/80">
            <p className="text-xs text-zinc-500">
              Nearly 1,000 high-school maths students, randomised trial, Türkiye. Change in average
              score compared with students who practised without AI.{" "}
              <a
                href="#ref-1"
                className="font-semibold text-purple-700 hover:underline"
              >
                [1]
              </a>
            </p>
            <p className="text-sm font-semibold text-zinc-950">
              So Cloop gives a hint and keeps the answer back until your child has tried again.
            </p>
          </div>
        </div>

        {/* 3 Additional Research Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryStudies.map((study) => (
            <div
              key={study.refId}
              className="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col justify-between shadow-xs"
            >
              <div>
                <p className="text-3xl font-extrabold text-purple-700 tracking-tight">
                  {study.stat}
                </p>
                <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
                  <strong className="text-zinc-950">{study.title}</strong> {study.body}
                </p>
                <p className="mt-3 text-xs text-zinc-500">
                  {study.meta}{" "}
                  <a
                    href={`#${study.refId}`}
                    className="font-semibold text-purple-700 hover:underline"
                  >
                    [{study.refNum}]
                  </a>
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-zinc-100 text-sm font-semibold text-zinc-950">
                {study.takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
