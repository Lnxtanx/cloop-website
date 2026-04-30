import { DownloadAppSection } from "./sections/DownloadAppSection";

export default function About() {
    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <DownloadAppSection />
            </div>
            <div className="py-20 px-5 lg:px-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 text-gray-900 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        About Cloop Web
                    </h1>

                    <div className="prose prose-lg text-gray-600 max-w-none">
                        <p className="text-xl lg:text-2xl mb-8 leading-relaxed font-medium text-gray-700">
                            Cloop Web is the desktop-optimized version of our AI-powered personalized tutoring platform, designed to provide a focused and expansive learning environment.
                        </p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mt-12 mb-6">Our Mission</h2>
                        <p className="mb-6 text-lg leading-relaxed">
                            We believe that personalized education is a right, not a privilege. Cloop Web brings our advanced AI tutoring system to your browser, making high-quality, private tutoring accessible on any computer, anywhere in the world.
                        </p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mt-12 mb-6">The Web Experience</h2>
                        <p className="mb-6 text-lg leading-relaxed">
                            This web version is specifically tailored for students who prefer a larger screen for deep study sessions. It integrates seamlessly with our mobile ecosystem, ensuring your progress, scores, and AI tutor conversations are always in sync.
                        </p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mt-12 mb-6">Our Story</h2>
                        <p className="mb-6 text-lg leading-relaxed">
                            Founded in 2024, Cloop emerged from a simple observation: every student learns differently. We built Cloop Web to bridge the gap between classroom learning and independent study, providing a safe space to fail, learn, and improve.
                        </p>
                        
                        <div className="mt-16 p-8 bg-purple-50 rounded-3xl border border-purple-100">
                            <h3 className="text-xl font-bold text-purple-900 mb-4">Contact Our Web Support Team</h3>
                            <p className="text-purple-800">
                                For inquiries specific to the Cloop Web experience, reach out to us at <a href="mailto:support@cloopapp.com" className="font-bold underline">support@cloopapp.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
