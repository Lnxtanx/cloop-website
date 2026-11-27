import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInModal = ({ open, onOpenChange }: SignInModalProps): JSX.Element => {
  const navigate = useNavigate();
  const [guestId, setGuestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [spaceNotice, setSpaceNotice] = useState("");

  const cleanLoginInput = (raw: string) => {
    return raw
      .trim()
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
      .replace(/\s+/g, " ");
  };

  const handleInputChange = (val: string) => {
    const hasInvisibleOrExtraSpaces = /^\s|\s$|[\u200B-\u200D\uFEFF\u00A0]|\s{2,}/.test(val);
    const cleaned = cleanLoginInput(val);

    if (hasInvisibleOrExtraSpaces && val.length > 0) {
      setSpaceNotice("Spaces & hidden characters auto-cleaned");
    } else {
      setSpaceNotice("");
    }

    setGuestId(cleaned);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const value = cleanLoginInput(guestId);
    if (!value) {
      setError("Please enter your Guest ID, registered email, or phone number.");
      return;
    }

    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrPhone: value }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.error || `Login failed (${response.status})`;
        setError(message);
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      localStorage.setItem("cloop_token", result.token);
      localStorage.setItem("cloop_user", JSON.stringify(result.user));
      onOpenChange(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 sm:p-8 border-zinc-200 bg-white">
        <DialogHeader className="text-left space-y-1.5">
          <DialogTitle className="text-xl font-bold text-zinc-950">
            Sign in to Cloop
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            Enter your Guest ID, registered email, or phone number to continue learning.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="guest-id" className="text-xs font-medium text-zinc-700">
              Guest ID / Registered Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="guest-id"
                type="text"
                autoFocus
                value={guestId}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter Guest ID, email, or phone number"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-900 transition"
              />
            </div>
            {spaceNotice && (
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                {spaceNotice}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-70"
          >
            {isLoading ? "Signing in…" : "Continue Learning"}
          </button>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>New to Cloop?</span>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                navigate("/signup");
              }}
              className="font-semibold text-zinc-950 hover:underline"
            >
              Try Cloop free for 7 days →
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
