import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignInModal } from "./SignInModal";

const navItems = [
  { label: "How it works", hash: "how-it-works" },
  { label: "For students", hash: "for-students" },
  { label: "For parents", hash: "for-parents" },
  { label: "For teachers", hash: "for-teachers" },
  { label: "Get the app", hash: "get-the-app" },
];

interface LandingNavbarProps {
  onOpenSignIn?: () => void;
}

export const LandingNavbar = ({ onOpenSignIn }: LandingNavbarProps): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalSignInOpen, setInternalSignInOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openSignIn = () => {
    if (onOpenSignIn) {
      onOpenSignIn();
    } else {
      setInternalSignInOpen(true);
    }
  };

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `/#${hash}`);
        return;
      }
    }
    navigate(`/#${hash}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <img
              src="/favicon.ico"
              alt="Cloop logo"
              className="w-8 h-8 rounded-lg object-cover border border-zinc-200"
            />
            <span className="text-zinc-950 font-bold text-lg tracking-tight">Cloop</span>
          </button>

          {/* Desktop Section Navigation */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item.hash}
                type="button"
                onClick={() => handleNavClick(item.hash)}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions + Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSignIn}
              className="hidden sm:inline-flex text-sm font-medium text-zinc-700 hover:text-zinc-950 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors whitespace-nowrap"
            >
              Sign in
            </button>

            <Button
              type="button"
              onClick={() => navigate("/signup")}
              className="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm whitespace-nowrap"
            >
              Try Cloop free
            </Button>

            {/* Mobile Nav Drawer */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <SheetHeader className="text-left border-b border-zinc-100 pb-4">
                  <SheetTitle className="flex items-center gap-2 text-base font-bold text-zinc-950">
                    <img
                      src="/favicon.ico"
                      alt="Cloop logo"
                      className="w-6 h-6 rounded-md object-cover border border-zinc-200"
                    />
                    Cloop
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.hash}
                      type="button"
                      onClick={() => handleNavClick(item.hash)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="my-3 h-px bg-zinc-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openSignIn();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
                  >
                    Sign in
                  </button>
                  <Button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/signup");
                    }}
                    className="mt-2 w-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg"
                  >
                    Try Cloop free for 7 days
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {!onOpenSignIn && (
        <SignInModal open={internalSignInOpen} onOpenChange={setInternalSignInOpen} />
      )}
    </>
  );
};

// Re-export under existing component name so /about, /contact, /privacy, /support, /terms stay consistent
export const DownloadAppSection = LandingNavbar;
