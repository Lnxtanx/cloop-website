import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

const classConcepts = [
  {
    name: "Balanced vs. unbalanced forces",
    grasped: 27,
    total: 32,
    tag: "Ready for a challenge",
    status: "strong" as const,
  },
  {
    name: "Inertia in moving frames",
    grasped: 21,
    total: 32,
    tag: "Try another example (11 students)",
    status: "moderate" as const,
  },
  {
    name: "Action–reaction force pairs",
    grasped: 14,
    total: 32,
    tag: "Shared misconception · 14 students",
    status: "stuck" as const,
  },
];

export const TeachersSection = (): JSX.Element => {
  return (
    <section id="for-teachers" className="w-full bg-white border-b border-zinc-200/80 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            For teachers
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            Spot where your class is stuck before the next test
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            See which concepts your class has grasped and where several students share a
            misconception. Use their explanations to decide what to revisit tomorrow, who could
            use a different example and who is ready for a challenge.
          </p>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            This reflects NEP 2020’s emphasis on conceptual understanding, critical thinking and
            assessment that guides learning. You can act on what students understand while you’re
            still teaching the chapter.
          </p>
        </div>

        {/* Designer Visual: Pair an anonymised class report with one student response making the shared misconception clear */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          {/* Left Panel: Anonymised Class Report */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 bg-[#F7F8FB] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-200/80">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Anonymised Class Report
                  </p>
                  <p className="text-base font-bold text-zinc-950">
                    Class 9 · Laws of Motion
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  32 students
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                {classConcepts.map((item) => {
                  const pct = Math.round((item.grasped / item.total) * 100);
                  return (
                    <div
                      key={item.name}
                      className={`rounded-xl p-4 border ${
                        item.status === "stuck"
                          ? "bg-white border-amber-300 shadow-xs"
                          : "bg-white border-zinc-200/80"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-zinc-950">{item.name}</p>
                        <span className="text-xs font-semibold text-zinc-500">
                          {item.grasped}/{item.total} grasped
                        </span>
                      </div>

                      <div className="mt-2.5 w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "strong"
                              ? "bg-emerald-600"
                              : item.status === "moderate"
                              ? "bg-zinc-700"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
                        {item.status === "strong" ? (
                          <span className="text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {item.tag}
                          </span>
                        ) : item.status === "stuck" ? (
                          <span className="text-amber-800 inline-flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {item.tag}
                          </span>
                        ) : (
                          <span className="text-zinc-600">{item.tag}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: One anonymised student response exposing the shared misconception */}
          <div className="lg:col-span-6 rounded-2xl border border-amber-200 bg-amber-50/35 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-amber-200/80">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                    Shared Misconception · Student Explanation
                  </p>
                  <p className="text-base font-bold text-zinc-950">
                    Action–reaction force pairs
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
                  14 of 32 gave similar reasoning
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-white border border-zinc-200 p-4 text-sm text-zinc-700 leading-relaxed">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Question asked in Cloop
                  </p>
                  “A heavy truck collides with a small parked car. Which vehicle applies the larger
                  force during impact?”
                </div>

                <div className="rounded-xl bg-white border-l-4 border-l-amber-500 border border-zinc-200 p-4 text-sm text-zinc-900 leading-relaxed">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 mb-1">
                    Anonymised Student Response
                  </p>
                  “The truck applies a much bigger force on the car because the truck is way heavier
                  and the car gets pushed backwards while the truck barely slows down.”
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-zinc-950 text-white p-4 text-xs sm:text-sm leading-relaxed">
              <p className="font-semibold text-amber-300 text-xs uppercase tracking-wider mb-1">
                What this shows for tomorrow’s class
              </p>
              Students are confusing <strong>equal forces</strong> with{" "}
              <strong>equal acceleration</strong> — smaller mass accelerates more from the exact
              same force pair. Revisit with two spring balances before starting momentum.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
