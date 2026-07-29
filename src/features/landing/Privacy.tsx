import { DownloadAppSection } from "./sections/DownloadAppSection";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-white">
            {/* Top sticky tagline bar */}
            <div className="w-full bg-[#F0F2F8] py-2 px-4 text-center text-[11px] sm:text-xs text-gray-500 tracking-wide border-b border-gray-200">
                <span>Conversation • Concept Mastery • Real-Time Correction • Score Prediction</span>
            </div>

            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <DownloadAppSection />
            </div>
            <div className="py-20 px-5 lg:px-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 text-black">
                        Privacy Policy
                    </h1>

                    <div className="prose prose-lg text-gray-600 max-w-none">
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-10 text-amber-800 text-sm font-medium">
                            This Privacy Policy applies specifically to the Cloop Web Version and associated services.
                        </div>

                        <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-gray-400">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">1. Introduction</h2>
                        <p className="mb-6 leading-relaxed">
                            Welcome to Cloop Web. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">2. Data We Collect</h2>
                        <p className="mb-4 leading-relaxed">
                            Through the Cloop Web interface, we may collect, use, store and transfer different kinds of personal data about you:
                        </p>
                        <ul className="list-disc pl-6 mb-8 space-y-3">
                            <li><strong>Identity Data:</strong> includes name, username, and grade level.</li>
                            <li><strong>Contact Data:</strong> includes email address and login identifiers.</li>
                            <li><strong>Technical Data:</strong> includes IP address, browser type/version, and web-specific usage patterns.</li>
                            <li><strong>Performance Data:</strong> includes your learning progress, quiz scores, and AI tutor interactions.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">3. How We Use Your Data</h2>
                        <p className="mb-6 leading-relaxed">
                            We use your data primarily to provide the AI-powered tutoring service on the web. This includes generating personalized learning paths and providing real-time score predictions.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">4. Contact Information</h2>
                        <p className="mb-6 leading-relaxed">
                            If you have any questions about this privacy policy or our privacy practices for the Cloop Web version, please contact our data privacy team at <a href="mailto:support@cloopapp.com" className="text-black font-bold underline">support@cloopapp.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
