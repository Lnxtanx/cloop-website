import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import favicon from "/favicon.ico";

const Login = () => {
  const [guestId, setGuestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const value = guestId.trim();
    if (!value) {
      setError("Please enter your User ID.");
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
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-primary-foreground/80 text-lg">Continue your learning journey where you left off.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src={favicon} alt="Cloop" width={36} height={36} />
            <span className="text-xl font-bold">Cloop</span>
          </Link>

          <h2 className="text-2xl font-bold mb-2">Enter your User ID</h2>
          <p className="text-muted-foreground mb-8">Type your User ID to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestId">User ID</Label>
              <Input
                id="guestId"
                type="text"
                placeholder="GUEST-12345"
                value={guestId}
                onChange={(e) => setGuestId(e.target.value.toUpperCase())}
                className="mt-1.5"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full hero-gradient border-0" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
