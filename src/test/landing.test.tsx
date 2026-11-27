import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "@/features/landing/Index";

describe("Cloop redesigned landing page", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  const renderLanding = () =>
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Index />
      </MemoryRouter>
    );

  it("renders the editorial headline, CTAs, and all audience sections", () => {
    renderLanding();

    expect(
      screen.getByRole("heading", {
        name: /The AI tutor that helps your child think for themselves/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", { name: /Try Cloop free for 7 days/i }).length
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("button", { name: /See a lesson/i }).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/See what you could score and what to revise next/i)).toBeInTheDocument();
    expect(screen.getByText(/See what your child can solve on their own/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Spot where your class is stuck before the next test/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Try Cloop with a chapter you’re studying today/i)).toBeInTheDocument();
  });

  it("includes required Designer pairings and interactive concept map sync", () => {
    renderLanding();

    // Parent captions: With a hint / On my own
    expect(screen.getByText("With a hint")).toBeInTheDocument();
    expect(screen.getByText("On my own")).toBeInTheDocument();

    // Score Predictor score + revise concept
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText(/Nature of Roots \(Discriminant\)/i)).toBeInTheDocument();

    // Teacher anonymised class report + misconception quote
    expect(screen.getByText(/Anonymised Class Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Anonymised Student Response/i)).toBeInTheDocument();

    // Interactive concept map keeps topic name visible in both panels
    const turningEffectTab = screen.getByRole("tab", {
      name: /Turning Effect of a Force/i,
    });
    fireEvent.click(turningEffectTab);
    expect(screen.getAllByText("Turning Effect of a Force").length).toBeGreaterThanOrEqual(3);
  });

  it("opens the Sign In modal with Guest ID input", () => {
    renderLanding();

    const signInBtn = screen.getAllByRole("button", { name: /^Sign in$/i })[0];
    fireEvent.click(signInBtn);

    expect(
      screen.getByPlaceholderText(/Enter Guest ID, email, or phone number/i)
    ).toBeInTheDocument();
  });
});
