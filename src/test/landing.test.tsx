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

  it("renders hero headline, three questions, CTAs, and boards caption", () => {
    renderLanding();

    expect(
      screen.getByRole("heading", {
        name: /The AI tutor that helps your child question an answer/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/Mapped to CBSE, ICSE, IB and IGCSE chapters, Classes 5–10/i).length
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getAllByRole("button", { name: /Try Cloop free for 7 days/i }).length
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("button", { name: /See a lesson/i }).length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("renders concept mastery, research benchmarks, comparison, dashboards, heatmap, and sources", () => {
    renderLanding();

    expect(
      screen.getByText(
        /How Cloop achieves concept mastery without compromising on academic performance/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText("+127%")).toBeInTheDocument();
    expect(screen.getByText("−17%")).toBeInTheDocument();
    expect(
      screen.getByText(/Cloop is not ChatGPT\. Cloop is customised for academic learning\./i)
    ).toBeInTheDocument();

    // Student & parent dashboard metrics
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText(/Mastery Dashboard/i)).toBeInTheDocument();

    // Teacher heatmap & cohort mistake callout
    expect(screen.getByText(/Class heatmap/i)).toBeInTheDocument();
    expect(screen.getByText("Aarav")).toBeInTheDocument();
    expect(screen.getByText(/“Air only pushes down\.”/i)).toBeInTheDocument();

    // Citations 1..7
    expect(screen.getByText(/Bastani, H\. et al\. \(2025\)/i)).toBeInTheDocument();
    expect(screen.getByText(/National Education Policy 2020/i)).toBeInTheDocument();
  });

  it("opens the Sign In modal with Guest ID input and does not show prototype designer toggles", () => {
    renderLanding();

    expect(screen.queryByText(/Hide designer notes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Designer note/i)).not.toBeInTheDocument();

    const signInBtn = screen.getAllByRole("button", { name: /^Sign in$/i })[0];
    fireEvent.click(signInBtn);

    expect(
      screen.getByPlaceholderText(/Enter Guest ID, email, or phone number/i)
    ).toBeInTheDocument();
  });
});
