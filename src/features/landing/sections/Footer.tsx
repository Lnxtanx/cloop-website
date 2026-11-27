import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For students", href: "/#for-students" },
  { label: "For parents", href: "/#for-parents" },
  { label: "For teachers", href: "/#for-teachers" },
  { label: "See a lesson", href: "/demo" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export const Footer = (): JSX.Element => {
  return (
    <footer className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mx-auto text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
        <div className="md:col-span-6 flex flex-col gap-4 max-w-md">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.ico"
              alt="Cloop logo"
              className="w-9 h-9 rounded-lg object-cover border border-zinc-200"
            />
            <span className="text-zinc-950 font-bold text-xl tracking-tight">Cloop</span>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">
            The AI tutor that turns each chapter into a Socratic conversation — helping students
            question answers, explain why an idea works, and apply it independently.
          </p>
        </div>

        <div className="md:col-span-3 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Product</h2>
          <ul className="flex flex-col gap-2.5">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Company</h2>
          <ul className="flex flex-col gap-2.5">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="mb-6 bg-zinc-200/80" />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500">
        <p>© 2026 Cloop. All rights reserved.</p>
        <p>Privacy by design · Anonymised learning insights</p>
      </div>
    </footer>
  );
};
