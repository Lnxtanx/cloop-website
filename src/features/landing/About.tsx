import { DownloadAppSection } from "./sections/DownloadAppSection";
import { Footer } from "./sections/Footer";
import { Linkedin, Compass, Brain, Target, Award, ArrowUpRight, HelpCircle } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-[#F0F2F8] font-['Inter',system-ui,sans-serif] flex flex-col justify-between">
            <div>
                {/* Top sticky tagline bar */}
                <div className="w-full bg-[#F0F2F8] py-2 px-4 text-center text-[11px] sm:text-xs text-gray-500 tracking-wide border-b border-gray-200">
                    <span>Conversation • Concept Mastery • Real-Time Correction • Score Prediction</span>
                </div>

                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                    <DownloadAppSection />
                </div>
                
                <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-up">
                    {/* Hero Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4">
                            Our Mission & Philosophy
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a0a3c] mb-6 leading-tight tracking-tight">
                            Building India’s Concept Mastery <span className="text-[#6B4EFF]">Infrastructure</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-500 font-medium">
                            Predicting exam scores based on concept mastery, not memory. Making NCF’s vision for India’s education work on the ground.
                        </p>
                    </div>

                    {/* Grid of Sections */}
                    <div className="space-y-16">
                        
                        {/* Section 1: About Cloop */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 transition-all hover:shadow-2xl">
                            <div className="grid lg:grid-cols-12 gap-8 items-center">
                                <div className="lg:col-span-5 text-left">
                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                        <Brain className="w-6 h-6 text-[#6B4EFF]" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-[#1a0a3c] mb-4">
                                        About Cloop
                                    </h2>
                                    <p className="text-purple-600 font-bold text-lg leading-relaxed mb-4">
                                        Cloop is not another edtech startup. We are building what NCF envisioned but couldn’t implement; a system that measures understanding, not memory.
                                    </p>
                                </div>
                                <div className="lg:col-span-7 bg-[#F7F6FE] rounded-2xl p-6 lg:p-8 border border-purple-50 text-left">
                                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
                                        We started with a question: <strong>What if students could know their exam scores before exam day, based on how well they understand concepts?</strong>
                                    </p>
                                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
                                        That led to Cloop, where students explain concepts in their own words through simple conceptual conversations with an AI Tutor.
                                    </p>
                                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
                                        Cloop believes that education is not about memory. If you can articulate how something works in real life, you’ve understood it for life.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: How Cloop Aligns to NCF Vision */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 transition-all hover:shadow-2xl text-left">
                            <div className="max-w-4xl mb-10">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-[#1a0a3c] mb-4">
                                    How Cloop Aligns to NCF Vision
                                </h2>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    NCF 2023 calls for understanding over memorization, competency-based progression, and formative assessment. On paper, it’s everything education should be. In classrooms, nothing has changed. Teachers still teach to tests. Students still cram. Parents still judge success by marks. This gap is the result of our inability to change—it has nothing to do with lack of products or infrastructure.
                                </p>
                            </div>

                            <p className="font-bold text-gray-800 text-lg mb-6">
                                Cloop provides the infrastructure through three NCF-aligned principles:
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {/* Principle 1 */}
                                <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-green-100 flex flex-col gap-4">
                                    <div className="w-10 h-10 bg-green-200/50 rounded-xl flex items-center justify-center self-start">
                                        <Compass className="w-5 h-5 text-green-700" />
                                    </div>
                                    <h3 className="font-extrabold text-[#1a0a3c] text-lg">
                                        Dialogue Over Definitions
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Students explain concepts in conversations, not multiple-choice tests. This reveals understanding vs. memorization immediately.
                                    </p>
                                </div>

                                {/* Principle 2 */}
                                <div className="bg-[#FEF3C7] rounded-2xl p-6 border border-amber-100 flex flex-col gap-4">
                                    <div className="w-10 h-10 bg-amber-200/50 rounded-xl flex items-center justify-center self-start">
                                        <HelpCircle className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <h3 className="font-extrabold text-[#1a0a3c] text-lg">
                                        Errors as Learning Data
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        When students make mistakes, we classify them - concept gap, procedural error, or calculation slip. Each needs different remediation. This data shows where teaching methods fail.
                                    </p>
                                </div>

                                {/* Principle 3 */}
                                <div className="bg-[#EEF2FF] rounded-2xl p-6 border border-indigo-100 flex flex-col gap-4">
                                    <div className="w-10 h-10 bg-indigo-200/50 rounded-xl flex items-center justify-center self-start">
                                        <Award className="w-5 h-5 text-indigo-700" />
                                    </div>
                                    <h3 className="font-extrabold text-[#1a0a3c] text-lg">
                                        Mastery Over Marks
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        We don’t show “7 out of 10 correct.” We show “15 of 44 concepts mastered.” Students see exactly where they stand and what mastery looks like.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 text-purple-950">
                                <p className="font-medium text-base sm:text-lg leading-relaxed">
                                    <strong>The result?</strong> A error dataset that can help NCERT/Publishers see where textbooks fail. Teachers know where methods need changing. Policymakers get evidence, not assumptions. This is NCF’s vision with tools that actually work.
                                </p>
                            </div>
                        </div>

                        {/* Section 3: The Cloop Vision for India */}
                        <div className="bg-[linear-gradient(137deg,rgba(104,59,218,1)_0%,rgba(180,129,230,1)_100%)] rounded-3xl shadow-xl p-8 lg:p-12 text-white relative overflow-hidden text-left">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                                <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                                <div className="lg:col-span-6">
                                    <span className="inline-block bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6 border border-white/30">
                                        National Impact
                                    </span>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                                        The Cloop Vision for India
                                    </h2>
                                    <p className="text-white/95 text-lg leading-relaxed mb-6">
                                        Cloop is building India’s first national concept mastery infrastructure. Every student conversation creates data. Every error reveals a pattern. When this aggregates across millions of students, it becomes a real-time map of how Indian students learn and where they struggle.
                                    </p>
                                </div>
                                <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20">
                                    <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
                                        Imagine <strong>NCERT</strong> seeing that 60% of Class 9 students misunderstand oxidation-reduction—not from surveys, but from actual learning conversations.
                                    </p>
                                    <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
                                        Imagine <strong>textbook publishers</strong> knowing which explanations work in Karnataka but confuse students in West Bengal.
                                    </p>
                                    <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
                                        Imagine <strong>teacher training</strong> focused on the exact concepts where students consistently struggle.
                                    </p>
                                    <p className="text-[#FFD946] font-bold text-base sm:text-lg leading-relaxed pt-4 border-t border-white/25">
                                        At 1 million students, the error corrections and conversations become the most comprehensive learning dataset in Indian education history. Not theories. Real data from real learning happening every day.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Team */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 text-left">
                            <div className="max-w-4xl mb-8">
                                <h2 className="text-3xl font-extrabold text-[#1a0a3c] mb-2">
                                    Team
                                </h2>
                                <div className="w-12 h-1 bg-[#6B4EFF] rounded-full mb-6" />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
                                {/* Ninad Card */}
                                <div className="group bg-[#F8F9FC] rounded-2xl p-6 border border-gray-100 flex items-center justify-between transition-all hover:border-[#6B4EFF]/20 hover:bg-white hover:shadow-lg">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-extrabold text-[#1a0a3c] text-xl tracking-tight">
                                            Ninad Vengurlekar
                                        </h3>
                                    </div>
                                    <a
                                        href="https://www.linkedin.com/in/ninad0270"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-11 h-11 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:bg-[#0077b5]/5 transition-all shadow-sm"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                </div>

                                {/* Vivek Card */}
                                <div className="group bg-[#F8F9FC] rounded-2xl p-6 border border-gray-100 flex items-center justify-between transition-all hover:border-[#6B4EFF]/20 hover:bg-white hover:shadow-lg">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-extrabold text-[#1a0a3c] text-xl tracking-tight">
                                            Vivek Yadav
                                        </h3>
                                    </div>
                                    <a
                                        href="https://www.linkedin.com/in/lnxtanx"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-11 h-11 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:bg-[#0077b5]/5 transition-all shadow-sm"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            <div className="bg-white border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}
