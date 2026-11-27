const sources = [
  {
    id: "ref-1",
    num: 1,
    citation:
      "Bastani, H. et al. (2025). Generative AI without guardrails can harm learning: Evidence from high school mathematics. PNAS, 122. Figures are relative to students who practised without AI.",
  },
  {
    id: "ref-2",
    num: 2,
    citation:
      "Kestin, G., Miller, K. et al. (2025). AI tutoring outperforms in-class active learning: an RCT introducing a novel research-based design in an authentic educational setting. Scientific Reports. “2×” is the learning gain in median test scores, as reported by the Hechinger Report.",
  },
  {
    id: "ref-3",
    num: 3,
    citation:
      "Wang, R. E., Ribeiro, A. T., Robinson, C. D., Loeb, S. & Demszky, D. (2024). Tutor CoPilot: A human-AI approach for scaling real-time expertise. Stanford University, arXiv:2410.03017 (preprint).",
  },
  {
    id: "ref-4",
    num: 4,
    citation:
      "De Simone, M. E. et al. (2025). From chalkboards to chatbots: Evaluating the impact of generative AI on learning outcomes in Nigeria. World Bank Policy Research Working Paper 11125.",
  },
  {
    id: "ref-5",
    num: 5,
    citation:
      "Lee, H.-P., Sarkar, A. et al. (2025). The impact of generative AI on critical thinking: A survey of knowledge workers. CHI 2025, Microsoft Research and Carnegie Mellon University.",
  },
  {
    id: "ref-6",
    num: 6,
    citation:
      "Central Board of Secondary Education (2024). Assessment and evaluation practices for 2024–25 (Circular 30/2024).",
  },
  {
    id: "ref-7",
    num: 7,
    citation: "Ministry of Education, Government of India (2020). National Education Policy 2020.",
  },
];

export const SourcesSection = (): JSX.Element => {
  return (
    <section
      id="sources"
      className="w-full bg-[#FAFAFC] border-t border-zinc-200 text-left scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sources</h2>
        <ol className="mt-4 space-y-2.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">
          {sources.map((src) => (
            <li
              key={src.id}
              id={src.id}
              className="flex items-start gap-2.5 scroll-mt-20 rounded-lg transition-colors target:bg-purple-50 target:px-2 target:py-1"
            >
              <span className="font-bold text-purple-700 shrink-0">[{src.num}]</span>
              <span>{src.citation}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
