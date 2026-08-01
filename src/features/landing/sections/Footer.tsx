import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export const Footer = (): JSX.Element => {
  return (
    <footer className="w-full max-w-[1200px] px-4 md:px-5 py-10 md:py-20 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-10 md:mb-20">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <div className="w-[140px] md:w-[180px] h-[48px] md:h-[60px] bg-black rounded-xl md:rounded-2xl flex items-center justify-center p-2 shadow-md">
              <img src="/figmaAssets/logo-1.png" alt="Logo" className="max-h-full brightness-0 invert" />
            </div>
            <p className="text-black text-xs md:text-sm font-bold tracking-wide text-left">
              Building India’s Concept Mastery Infrastructure
            </p>
          </div>
          <p className="text-gray-600 text-sm md:text-lg leading-relaxed text-left">
            Predicting exam scores based on concept mastery, not memory. Making NCF’s vision for India’s education work on the ground.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:gap-6 text-left md:pl-20">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">Company</h2>
          <ul className="flex flex-col gap-2 md:gap-4">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="text-gray-600 hover:text-black transition-colors text-sm md:text-lg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="mb-6 md:mb-10" />

      <div className="flex justify-center items-center">
        <p className="text-gray-600 text-sm md:text-lg">
          © Copyright 2026, All Rights Reserved
        </p>
      </div>
    </footer>
  );
};
