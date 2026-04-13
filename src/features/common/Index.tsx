import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Brain, TrendingUp, ArrowRight, Star } from "lucide-react";
import favicon from "/favicon.ico";
import heroImg from "@/assets/hero-illustration.jpg";

const steps = [
  { icon: BookOpen, title: "Select a Learning Topic", desc: "Choose from a wide range of subjects tailored to your curriculum and learning goals." },
  { icon: MessageCircle, title: "Chat with Personal AI Tutor", desc: "Get instant, personalized guidance through interactive AI-powered conversations." },
  { icon: Brain, title: "Understand Common Errors", desc: "Learn from your mistakes with detailed feedback on where you went wrong and how to improve." },
  { icon: TrendingUp, title: "Get Predicted Score", desc: "Track your progress and see predicted scores to stay motivated and focused." },
];

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "200+", label: "Courses" },
  { value: "95%", label: "Completion Rate" },
  { value: "4.9", label: "Average Rating" },
];

const Index = () => {
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={favicon} alt="Cloop" width={36} height={36} />
            <span className="text-xl font-bold text-foreground">Cloop</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="hero-gradient border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="w-4 h-4" /> #1 AI-Powered Learning Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Learn Smarter,{" "}
              <span className="text-gradient">Grow Faster</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Master any subject with interactive courses, AI-powered tutoring, and personalized score predictions — all in one beautiful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="hero-gradient border-0 gap-2">
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-float hidden lg:block">
            <img src={heroImg} alt="Learn with Cloop" className="rounded-2xl shadow-2xl w-full" width={1280} height={720} />
          </div>
        </div>
      </section>

      {/* How Cloop Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How <span className="text-gradient">Cloop Works?</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A simple, effective way to master any subject with AI-powered guidance.</p>
        </div>
        <div className="container mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border" style={{ animationDelay: `${i * 0.15}s` }}>
              {/* Step number */}
              <div className="absolute -top-4 left-6 w-8 h-8 rounded-full hero-gradient flex items-center justify-center text-white text-sm font-bold shadow-md">
                {i + 1}
              </div>
              <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-4 mt-2">
                <step.icon className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-left">{step.title}</h3>
              <p className="text-sm text-muted-foreground text-left">{step.desc}</p>
              {/* Arrow connector for larger screens */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-purple-300">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/50 px-6">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to <span className="text-gradient">Succeed</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our platform is designed to make learning engaging, effective, and enjoyable.</p>
        </div>
        <div className="container mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, title: "Interactive Chapters", desc: "Learn at your own pace with structured, engaging content organized into bite-sized chapters." },
            { icon: MessageCircle, title: "AI Chat Support", desc: "Get instant help from our AI tutor whenever you're stuck on a concept." },
            { icon: TrendingUp, title: "Track Progress", desc: "Visualize your learning journey with detailed statistics and performance insights." },
            { icon: Brain, title: "Score Prediction", desc: "Know where you stand with AI-powered predicted scores based on your performance." },
          ].map((f, i) => (
            <div key={f.title} className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-lg hero-gradient flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="hero-gradient rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-primary-foreground/80 mb-4 max-w-2xl mx-auto">
              Join 10,000+ students who are improving their grades with Cloop's Score Predictor.
            </p>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto text-sm">
              Start learning smarter today and see exactly where you stand.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={favicon} alt="Cloop" width={28} height={28} />
            <span className="font-semibold">Cloop</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Cloop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
