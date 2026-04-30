import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DownloadAppSection } from "./sections/DownloadAppSection";
import { useNavigate } from "react-router-dom";

export default function Support() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <DownloadAppSection />
            </div>
            <div className="py-20 px-5 lg:px-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 text-gray-900 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        Support Center
                    </h1>

                    <div className="mb-16 mt-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                            Web Version FAQ
                        </h2>
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border rounded-2xl px-6 bg-gray-50/50">
                                <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
                                    How is Cloop Web different from the app?
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-gray-600 leading-relaxed pb-6">
                                    Cloop Web offers the same powerful AI tutoring as our mobile apps but is optimized for desktop usage. It provides a larger workspace for reviewing chapters and chatting with your personal AI tutor.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border rounded-2xl px-6 bg-gray-50/50">
                                <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
                                    Is my progress synced across devices?
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-gray-600 leading-relaxed pb-6">
                                    Absolutely! Your Cloop account is unified. Any progress you make on the web version will immediately reflect on your mobile app and vice versa.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border rounded-2xl px-6 bg-gray-50/50">
                                <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
                                    I forgot my User ID. How can I recover it?
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-gray-600 leading-relaxed pb-6">
                                    Since Cloop Web uses a unique User ID system for privacy, we recommend saving your ID securely. If you lose it, please contact <a href="mailto:support@cloopapp.com" className="text-purple-600 font-bold">support@cloopapp.com</a> with your registration details.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4" className="border rounded-2xl px-6 bg-gray-50/50">
                                <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
                                    Can I use Cloop Web for exam preparation?
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-gray-600 leading-relaxed pb-6">
                                    Yes! The web version is perfect for long study sessions. You can access all your subjects, track your predicted scores, and get instant feedback on errors.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-violet-700 p-10 lg:p-14 rounded-[40px] text-white shadow-xl shadow-purple-200">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Still need help with Cloop Web?</h2>
                            <p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">
                                Our technical support team is available to assist you with any web-specific issues or general inquiries.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    onClick={() => navigate("/contact")}
                                    className="h-14 px-10 bg-white text-purple-600 hover:bg-purple-50 rounded-xl text-lg font-bold"
                                >
                                    Contact Support
                                </Button>
                                <div className="flex items-center gap-2 text-white/80 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    support@cloopapp.com
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
