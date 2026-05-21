import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DownloadAppSection } from "./sections/DownloadAppSection";
import { Footer } from "./sections/Footer";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;

        const subject = encodeURIComponent(`Cloop Support Request from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\n` +
            `Email: ${email}\n\n` +
            `Message:\n${message}`
        );

        window.location.href = `mailto:ninadvengurlekar@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <div>
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                    <DownloadAppSection />
                </div>
                <div className="py-20 px-5 lg:px-20">
                    <div className="max-w-xl mx-auto">
                        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-center text-gray-900 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                            Contact Cloop Support
                        </h1>
                        <p className="text-lg text-gray-500 text-center mb-10">
                            Have questions? Drop us a message below and we will get back to you!
                        </p>

                        <div className="bg-gray-50 p-8 lg:p-10 rounded-[40px] border border-gray-100 shadow-sm text-left">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send a Message</h2>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="rounded-xl border-gray-200 h-12"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="rounded-xl border-gray-200 h-12"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help with your learning experience?"
                                        className="min-h-[150px] rounded-xl border-gray-200"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-purple-200"
                                >
                                    Send Message
                                </Button>
                            </form>
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
