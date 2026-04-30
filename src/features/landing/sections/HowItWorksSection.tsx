import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  "✓ 24/7 AI tutor availability",
  "✓ Real-time score predictions",
  "✓ Personalized learning roadmaps",
  "✓ Error-type classification",
  "✓ Instant explanations",
  "✓ Adapts to your pace",
  "✓ 95% prediction accuracy",
];

const curriculums = [
  { name: "State Board" },
  { name: "CBSE" },
  { name: "ICSE" },
  { name: "IGCSE" },
  { name: "JEE/NEET" },
];

export const HowItWorksSection = (): JSX.Element => {
  return (
    <section id="features" className="flex flex-col items-center gap-10 lg:gap-[70px] py-20 px-5 w-full bg-[linear-gradient(180deg,rgba(234,165,251,1)_0%,rgba(159,124,251,1)_100%)]">
      <div className="flex flex-col items-center gap-6">
        <h2 className="font-extrabold text-black text-4xl lg:text-6xl text-center">
          Why Cloop?
        </h2>
      </div>

      <Card className="max-w-[800px] w-full rounded-[40px] lg:rounded-[60px] shadow-2xl bg-white/90 border-0">
        <CardContent className="p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <div key={index} className="font-bold text-black text-xl lg:text-2xl leading-relaxed">
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div id="ai-tutor" className="flex flex-col items-center gap-10 mt-10">
        <h3 className="font-bold text-[#0c111c] text-3xl lg:text-5xl text-center">
          Curriculum Supported
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {curriculums.map((curriculum, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-6 py-3 lg:px-10 lg:py-6 bg-[#e5eaf4] rounded-full hover:bg-[#d0d9e8] transition-colors"
            >
              <span className="font-medium text-[#0c111c] text-xl lg:text-3xl">
                {curriculum.name}
              </span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col max-w-[900px] items-center gap-6 mt-20">
        <h3 className="font-bold text-[#110c1c] text-4xl lg:text-7xl text-center">
          Study Without Fear
        </h3>
        <p className="font-bold text-white text-xl lg:text-3xl text-center leading-relaxed italic">
          &quot;Your mistakes are 100% private. We provide a safe space to fail,
          learn, and improve all while tracking your predicted score. No
          judgment, only razor sharp focus on improving grades.&quot;
        </p>
      </div>
    </section>
  );
};
