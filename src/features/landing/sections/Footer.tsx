import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "AI Tutor", href: "#ai-tutor" },
  { label: "Pricing", href: "#pricing" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact", href: "/feedback" },
];

const socialLinks = [
  { icon: "/figmaAssets/logos-facebook.svg", label: "Facebook", href: "#" },
  { icon: "/figmaAssets/group.png", label: "Instagram", href: "#" },
  { icon: "/figmaAssets/skill-icons-twitter.svg", label: "Twitter", href: "#" },
];

export const Footer = (): JSX.Element => {
  const scrollTo = (id: string) => {
    if (id.startsWith('#')) {
      const element = document.getElementById(id.replace('#', ''));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full max-w-[1200px] px-4 md:px-5 py-10 md:py-20 mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mb-10 md:mb-20">
        <div className="col-span-2 md:col-span-2 lg:col-span-1 flex flex-col gap-4 md:gap-6">
          <div className="w-[140px] md:w-[180px] h-[48px] md:h-[60px] bg-[#e9a4fa] rounded-xl md:rounded-2xl flex items-center justify-center p-2">
            <img src="/figmaAssets/logo-1.png" alt="Logo" className="max-h-full" />
          </div>
          <p className="text-gray-600 text-sm md:text-lg leading-relaxed text-left">
            Transform your learning with AI-Powered personalized tutoring. Practice smarter and ace your exams with confidence.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:gap-6 text-left">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">Quick Links</h2>
          <ul className="flex flex-col gap-2 md:gap-4">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <button onClick={() => scrollTo(link.href)} className="text-gray-600 hover:text-[#8d33ff] transition-colors text-sm md:text-lg text-left">
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 md:gap-6 text-left">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">Company</h2>
          <ul className="flex flex-col gap-2 md:gap-4">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="text-gray-600 hover:text-[#8d33ff] transition-colors text-sm md:text-lg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 md:gap-6 text-left">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">Connect</h2>
          <div className="flex flex-col gap-2 md:gap-4">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} className="flex items-center gap-2 md:gap-3 text-gray-600 hover:text-[#8d33ff] transition-colors text-sm md:text-lg">
                <img src={social.icon} alt={social.label} className="w-5 h-5 md:w-6 md:h-6" />
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <Separator className="mb-6 md:mb-10" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <nav className="flex flex-wrap justify-center gap-4 md:gap-8 text-gray-900 font-semibold text-sm md:text-base">
          <Link to="/privacy" className="hover:text-[#8d33ff]">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#8d33ff]">Terms</Link>
          <Link to="/support" className="hover:text-[#8d33ff]">Support</Link>
        </nav>
        <p className="text-gray-600 text-sm md:text-lg">
          © Copyright 2026, All Rights Reserved
        </p>
      </div>
    </footer>
  );
};
