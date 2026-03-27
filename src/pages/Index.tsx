import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, BarChart3, MessageCircle, CheckCircle, ArrowRight, Star, Play } from "lucide-react";
import cloopLogo from "@/assets/cloop-logo.png";
import heroImg from "@/assets/hero-illustration.jpg";

const features = [
  { icon: BookOpen, title: "Interactive Chapters", desc: "Learn at your own pace with structured, engaging content organized into bite-sized chapters." },
  { icon: Users, title: "Live Sessions", desc: "Join live classes with expert instructors and interact with fellow learners in real-time." },
  { icon: BarChart3, title: "Track Progress", desc: "Visualize your learning journey with detailed statistics and performance insights." },
  { icon: MessageCircle, title: "AI Chat Support", desc: "Get instant help from our AI tutor whenever you're stuck on a concept." },
];

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "200+", label: "Courses" },
  { value: "95%", label: "Completion Rate" },
  { value: "4.9", label: "Average Rating" },
];

const testimonials = [
  { name: "Sarah Johnson", role: "Computer Science Student", text: "Cloop transformed how I study. The interactive chapters and AI tutor are game-changers!", rating: 5 },
  { name: "Michael Chen", role: "Data Science Professional", text: "The statistics dashboard keeps me motivated. I can see my progress every day.", rating: 5 },
  { name: "Emily Davis", role: "High School Teacher", text: "I recommend Cloop to all my students. The live sessions are incredibly engaging.", rating: 5 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={cloopLogo} alt="Cloop" width={36} height={36} />
            <span className="text-xl font-bold text-foreground">Cloop</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
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
              <Star className="w-4 h-4" /> #1 Learning Platform for 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Learn Smarter,{" "}
              <span className="text-gradient">Grow Faster</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Master any subject with interactive courses, live sessions, and AI-powered tutoring — all in one beautiful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="hero-gradient border-0 gap-2">
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="w-4 h-4" /> Watch Demo
              </Button>
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

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/50 px-6">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to <span className="text-gradient">Succeed</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our platform is designed to make learning engaging, effective, and enjoyable.</p>
        </div>
        <div className="container mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by <span className="text-gradient">Learners</span></h2>
        </div>
        <div className="container mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="hero-gradient rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">Join thousands of learners and unlock your potential with Cloop today.</p>
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
            <img src={cloopLogo} alt="Cloop" width={28} height={28} />
            <span className="font-semibold">Cloop</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Cloop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
