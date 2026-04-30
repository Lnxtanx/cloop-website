import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DownloadAppSection } from "./sections/DownloadAppSection";

export default function Contact() {
    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <DownloadAppSection />
            </div>
            <div className="py-20 px-5 lg:px-20">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 text-gray-900 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        Contact Cloop Web Support
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
                        <div>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                Have questions about the Cloop Web version? Our dedicated support team is here to help you get the most out of your web learning experience.
                            </p>

                            <div className="space-y-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Email Us</h3>
                                        <p className="text-lg text-purple-600 font-medium">support@cloopapp.com</p>
                                        <p className="text-sm text-gray-500 mt-1">We typically respond within 24 hours.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Office</h3>
                                        <p className="text-lg text-gray-600 leading-relaxed">123 Innovation Drive<br />Tech City, TC 94043</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 lg:p-10 rounded-[40px] border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                    <Input id="name" placeholder="Enter your name" className="rounded-xl border-gray-200 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <Input id="email" type="email" placeholder="you@example.com" className="rounded-xl border-gray-200 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                    <Textarea id="message" placeholder="How can we help with your web experience?" className="min-h-[150px] rounded-xl border-gray-200" />
                                </div>

                                <Button type="submit" className="w-full h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-purple-200">
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
