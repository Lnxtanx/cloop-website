import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  MessageCircle,
  Brain,
  TrendingUp,
  ArrowRight,
  Star,
  CheckCircle,
  Award,
  Target,
  Sparkles,
  Zap,
  Shield,
  Play,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import favicon from "/favicon.ico";

const steps = [
  { icon: BookOpen, title: "Select a Learning Topic", desc: "Choose from a wide range of subjects tailored to your curriculum and learning goals.", color: "from-purple-500 to-indigo-600" },
  { icon: MessageCircle, title: "Chat with Personal AI Tutor", desc: "Get instant, personalized guidance through interactive AI-powered conversations.", color: "from-violet-500 to-purple-600" },
  { icon: Brain, title: "Understand Common Errors", desc: "Learn from your mistakes with detailed feedback on where you went wrong and how to improve.", color: "from-fuchsia-500 to-violet-600" },
  { icon: TrendingUp, title: "Get Predicted Score", desc: "Track your progress and see predicted scores to stay motivated and focused.", color: "from-purple-600 to-pink-600" },
];

const stats = [
  { value: "AI-Powered", label: "Personalized Learning", icon: Brain },
  { value: "24/7", label: "Tutor Availability", icon: MessageCircle },
  { value: "Real-time", label: "Feedback & Scoring", icon: TrendingUp },
  { value: "Secure", label: "Platform", icon: Shield },
];

const features = [
  { icon: BookOpen, title: "Interactive Chapters", desc: "Learn at your own pace with structured, engaging content organized into bite-sized chapters.", gradient: "from-purple-500 to-indigo-600" },
  { icon: MessageCircle, title: "AI Chat Support", desc: "Get instant help from our AI tutor whenever you're stuck on a concept.", gradient: "from-violet-500 to-purple-600" },
  { icon: TrendingUp, title: "Track Progress", desc: "Visualize your learning journey with detailed statistics and performance insights.", gradient: "from-fuchsia-500 to-violet-600" },
  { icon: Brain, title: "Score Prediction", desc: "Know where you stand with AI-powered predicted scores based on your performance.", gradient: "from-purple-600 to-pink-600" },
  { icon: Zap, title: "Instant Feedback", desc: "Receive real-time feedback on your answers to accelerate your learning.", gradient: "from-indigo-500 to-purple-600" },
  { icon: Award, title: "Achievement Badges", desc: "Earn badges and rewards as you progress through your learning journey.", gradient: "from-violet-600 to-fuchsia-600" },
  { icon: Shield, title: "Secure Platform", desc: "Your data is protected with enterprise-grade security and privacy.", gradient: "from-purple-500 to-violet-700" },
  { icon: Sparkles, title: "Personalized Path", desc: "AI-curated learning paths adapted to your strengths and weaknesses.", gradient: "from-fuchsia-500 to-purple-600" },
];

const testimonials = [
  { name: "Student Feedback", role: "Testing Phase", content: "The AI tutor helps me understand concepts at my own pace. Great for exam preparation!", rating: 5, image: "SF" },
  { name: "Beta User", role: "Early Tester", content: "Love the personalized learning path. The score predictions are motivating and accurate.", rating: 5, image: "BU" },
  { name: "Test Student", role: "Pilot Program", content: "Having an AI tutor available anytime has improved my study routine significantly.", rating: 5, image: "TS" },
];

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100">
        <div className="container mx-auto flex items-center justify-between h-18 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={favicon} alt="Cloop" width={36} height={36} />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Cloop</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">How It Works</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Testimonials</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600 hover:bg-purple-50">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-purple-200">
                Get Started
              </Button>
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-purple-100 py-4 px-6 space-y-4 animate-fade-in">
            <a href="#how-it-works" className="block text-sm font-medium text-gray-600 hover:text-purple-600">How It Works</a>
            <a href="#features" className="block text-sm font-medium text-gray-600 hover:text-purple-600">Features</a>
            <a href="#testimonials" className="block text-sm font-medium text-gray-600 hover:text-purple-600">Testimonials</a>
            <div className="flex flex-col gap-3 pt-4 border-t border-purple-100">
              <Link to="/login"><Button variant="ghost" className="w-full justify-start">Log in</Button></Link>
              <Link to="/signup"><Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600">Get Started</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-fuchsia-300/15 rounded-full blur-3xl" />
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-amber-200">
              <Sparkles className="w-4 h-4" /> Currently in Beta Testing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Learn Smarter,
              <span className="block bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Grow Faster</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              An AI-powered educational platform providing personalized tutoring, topic-based learning, and progress tracking. Currently in testing phase.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-xl shadow-purple-300/50 gap-2">
                  Join Beta Program <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-2">
                <Play className="w-4 h-4" /> Learn More
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span>Free during testing phase</span>
              </div>
            </div>
          </div>
          
          {/* Hero Visual - CSS-based illustration */}
          <div className="hidden lg:block animate-float">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-purple-200/50 p-8 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">AI Tutor Session</div>
                    <div className="text-sm text-gray-500">Mathematics • Algebra</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-sm text-gray-700">How can I help you understand quadratic equations today?</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-4">
                    <div className="text-sm text-white">I'm struggling with factoring. Can you explain it step by step?</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Progress: 75% complete</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full w-3/4" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">PS</div>
                    <div>
                      <div className="text-sm font-medium">Priya S.</div>
                      <div className="text-xs text-gray-500">Score: 92%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl shadow-purple-200/30 p-4 border border-purple-100 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-gray-900">+28%</span>
                </div>
                <div className="text-xs text-gray-500">Score Improvement</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl shadow-purple-200/30 p-4 border border-purple-100 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-900">Top 5%</span>
                </div>
                <div className="text-xs text-gray-500">Class Rank</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <stat.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm md:text-base opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Cloop Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="container mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Simple Workflow
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Cloop Works?</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">A simple, effective way to master any subject with AI-powered guidance.</p>
        </div>
        <div className="container mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200" />
          {steps.map((step, i) => (
            <div key={step.title} className="relative bg-white rounded-2xl p-6 shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-200/50 transition-all border border-purple-100 animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
              {/* Step number */}
              <div className={`absolute -top-4 left-6 w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-sm font-bold shadow-lg z-10`}>
                {i + 1}
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 mt-2 shadow-md`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-left text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 text-left leading-relaxed">{step.desc}</p>
              {/* Arrow connector for larger screens */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-purple-400 z-10">
                  <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-purple-50/50 via-white to-purple-50/50">
        <div className="container mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" /> Key Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Our platform is designed to make learning engaging, effective, and enjoyable.</p>
        </div>
        <div className="container mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="group bg-white rounded-2xl p-6 shadow-lg shadow-purple-100/30 hover:shadow-xl hover:shadow-purple-200/50 transition-all border border-purple-100 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="container mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-fuchsia-100 text-fuchsia-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-current" /> Beta Feedback
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Testing Phase <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Insights</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Feedback from our beta testers and early users about their Cloop experience.</p>
        </div>
        <div className="container mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className="bg-gradient-to-b from-purple-50 to-white rounded-2xl p-6 shadow-lg shadow-purple-100/30 border border-purple-100 animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.image}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Join Our Beta Program</h2>
              <p className="text-white/90 mb-4 max-w-2xl mx-auto text-lg">
                Be part of the testing phase and help shape the future of AI-powered education.
              </p>
              <p className="text-white/70 mb-8 max-w-lg mx-auto text-sm">
                Free access during testing. Your feedback will directly influence platform development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="gap-2 shadow-xl bg-white text-purple-600 hover:bg-purple-50">
                    Sign Up for Beta <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 py-12 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={favicon} alt="Cloop" width={32} height={32} />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Cloop</span>
              </div>
              <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                AI-powered educational platform for personalized learning. Currently in beta testing phase.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium border border-amber-200">
                <Sparkles className="w-3 h-3" /> Beta Version
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-purple-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-purple-600 transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-purple-600 transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-purple-600 transition-colors">About Us</a></li>
                <li><a href="/feedback" className="hover:text-purple-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 Cloop. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.527c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
