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
    <footer className="w-full max-w-[1200px] px-5 py-20 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="flex flex-col gap-6">
          <div className="w-[180px] h-[60px] bg-[#e9a4fa] rounded-2xl flex items-center justify-center p-2">
            <img src="/figmaAssets/logo-1.png" alt="Logo" className="max-h-full" />
          </div>
          <p className="text-gray-600 text-lg leading-relaxed text-left">
            Transform your learning with AI-Powered personalized tutoring. Practice smarter and ace your exams with confidence.
          </p>
        </div>

        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-2xl font-bold text-gray-900">Quick Links</h2>
          <ul className="flex flex-col gap-4">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <button onClick={() => scrollTo(link.href)} className="text-gray-600 hover:text-[#8d33ff] transition-colors text-lg text-left">
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-2xl font-bold text-gray-900">Company</h2>
          <ul className="flex flex-col gap-4">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="text-gray-600 hover:text-[#8d33ff] transition-colors text-lg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-2xl font-bold text-gray-900">Connect</h2>
          <div className="flex flex-col gap-4">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} className="flex items-center gap-3 text-gray-600 hover:text-[#8d33ff] transition-colors text-lg">
                <img src={social.icon} alt={social.label} className="w-6 h-6" />
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <Separator className="mb-10" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <nav className="flex gap-8 text-gray-900 font-semibold">
          <Link href="/privacy" className="hover:text-[#8d33ff]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#8d33ff]">Terms & Conditions</Link>
          <Link href="/support" className="hover:text-[#8d33ff]">Support</Link>
        </nav>
        <p className="text-gray-600 text-lg">
          © Copyright 2026, All Rights Reserved
        </p>
      </div>
    </footer>
  );
};
