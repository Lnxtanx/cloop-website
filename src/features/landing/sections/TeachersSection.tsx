import { useState } from "react";
import { AlertTriangle } from "lucide-react";

type CellStatus = "Own" | "Hint" | "Practise";

const columns = ["Force ÷ area", "Liquid pressure", "Air pressure", "Fast winds"];

const studentRows: { name: string; cells: CellStatus[] }[] = [
  { name: "Aarav", cells: ["Own", "Own", "Hint", "Practise"] },
  { name: "Diya", cells: ["Own", "Hint", "Practise", "Practise"] },
  { name: "Kabir", cells: ["Own", "Own", "Own", "Hint"] },
  { name: "Meera", cells: ["Own", "Own", "Practise", "Practise"] },
];

const cohortBars = [
  { concept: "Pressure = force ÷ area", pct: 86 },
  { concept: "Pressure in liquids", pct: 64 },
  { concept: "Air pressure", pct: 41 },
  { concept: "High-speed winds lower pressure", pct: 28 },
];

const teacherActions = [
  {
    title: "Plan tomorrow’s lesson",
    desc: "Start where the class is stuck: here, air pressure, not force and area.",
  },
  {
    title: "Group students by need",
    desc: "Pull aside the four students still practising one concept, not the whole class.",
  },
  {
    title: "Track the cohort over time",
    desc: "See each concept’s mastery rise across sections and chapters through the term.",
  },
];

const badgeClass = (status: CellStatus) => {
  if (status === "Own") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "Hint") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  return "bg-rose-50 text-rose-700 border-rose-200";
};

export const TeachersSection = (): JSX.Element => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <section
      id="teachers"
      className="w-full bg-[#FAF8FF] border-b border-zinc-200 scroll-mt-16 text-left"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
            Teacher Dashboard
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            See your whole class, concept by concept, before the next test.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Every lesson a student finishes updates the Teacher Dashboard. Read one student’s row,
            one concept’s column, or the whole cohort.
          </p>
        </div>

        {/* Side-by-side Class Heatmap & Cohort View */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Class heatmap */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-950">Class heatmap</h3>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-semibold">
                      <th className="py-2.5 pr-3 text-left" />
                      {columns.map((col, idx) => (
                        <th
                          key={col}
                          onMouseEnter={() => setHoveredCol(idx)}
                          onMouseLeave={() => setHoveredCol(null)}
                          className={`py-2.5 px-2 text-center whitespace-nowrap transition-colors ${
                            hoveredCol === idx ? "text-purple-700" : ""
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/80">
                    {studentRows.map((row) => (
                      <tr key={row.name} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 pr-3 font-bold text-zinc-950 whitespace-nowrap">
                          {row.name}
                        </td>
                        {row.cells.map((cell, cIdx) => (
                          <td
                            key={columns[cIdx]}
                            onMouseEnter={() => setHoveredCol(cIdx)}
                            onMouseLeave={() => setHoveredCol(null)}
                            className={`py-2.5 px-1.5 text-center ${
                              hoveredCol === cIdx ? "bg-purple-50/70" : ""
                            }`}
                          >
                            <span
                              className={`inline-block min-w-[68px] px-2.5 py-1 rounded-md border text-xs font-semibold ${badgeClass(
                                cell
                              )}`}
                            >
                              {cell}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
              Example class. Across a row: what one student needs. Down a column: a concept worth
              re-teaching.
            </p>
          </div>

          {/* Right: Cohort view · Class 8B */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-950">Cohort view · Class 8B</h3>

              <div className="mt-4 space-y-3.5">
                {cohortBars.map((item) => (
                  <div key={item.concept}>
                    <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium mb-1">
                      <span className="text-zinc-800">{item.concept}</span>
                      <span className="font-bold text-zinc-950">{item.pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.pct >= 75
                            ? "bg-emerald-600"
                            : item.pct >= 50
                            ? "bg-purple-600"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Most common mistake box */}
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Most common mistake this week
                </p>
                <p className="mt-1.5 text-sm text-zinc-900 leading-relaxed">
                  <strong>“Air only pushes down.”</strong> 11 students. The textbook shows air
                  pressure acts in all directions.
                </p>
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
              Share of students who mastered each concept on their own. Example figures.
            </p>
          </div>
        </div>

        {/* 3 Teacher Takeaways */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {teacherActions.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed"
            >
              <p className="font-bold text-zinc-950">{item.title}</p>
              <p className="mt-1.5 text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
