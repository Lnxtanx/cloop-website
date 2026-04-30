import { DownloadAppSection } from "./sections/DownloadAppSection";

export default function Terms() {
    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <DownloadAppSection />
            </div>
            <div className="py-20 px-5 lg:px-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 text-gray-900 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        Terms & Conditions
                    </h1>

                    <div className="prose prose-lg text-gray-600 max-w-none">
                        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-10 text-purple-800 text-sm font-medium">
                            These Terms and Conditions apply specifically to the usage of the Cloop Web platform.
                        </div>

                        <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-gray-400">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">1. Agreement to Terms</h2>
                        <p className="mb-6 leading-relaxed">
                            By accessing or using the Cloop Web platform, you agree to be bound by these Terms and Conditions. These terms govern your use of our web-based educational services and AI tutoring tools.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">2. Web Version Usage</h2>
                        <p className="mb-6 leading-relaxed">
                            Cloop Web is provided for personal, educational use. You agree to use the web interface as intended—for studying, interacting with the AI tutor, and tracking your own educational progress.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">3. User Accounts & IDs</h2>
                        <p className="mb-6 leading-relaxed">
                            Access to Cloop Web is managed through unique User IDs. You are responsible for maintaining the confidentiality of your ID. You agree to notify us immediately at <a href="mailto:support@cloopapp.com" className="text-purple-600 font-bold underline">support@cloopapp.com</a> if you suspect any unauthorized use of your account.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">4. Intellectual Property</h2>
                        <p className="mb-6 leading-relaxed">
                            The Cloop Web platform, including its design, AI models, and educational content, is the exclusive property of Cloop. Your use of the service does not grant you ownership of any content accessed through the web version.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">5. Limitation of Liability</h2>
                        <p className="mb-6 leading-relaxed">
                            Cloop Web is provided "as is". While our AI aims for high accuracy in tutoring and score prediction, Cloop is not liable for any indirect damages resulting from the use of our web platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
