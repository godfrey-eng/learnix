import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { useAppStore } from "@/store/useAppStore";
import { useTimerStore } from "@/store/useTimerStore";

const go = async (name: string) => userEvent.click(screen.getAllByRole("button", { name: new RegExp(`^${name}$`, "i") })[0]);

beforeEach(() => {
  useTimerStore.getState().end();
  useAppStore.setState({ plan: "free" });
});

describe("navigation", () => {
  it("renders every screen without crashing", async () => {
    render(<App />);
    for (const s of ["Library", "Flashcards", "Quizzes", "Timer", "Analytics", "Reminders", "Settings", "Dashboard"]) {
      await go(s);
      expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
    }
  });
});

describe("plan gating", () => {
  it("sends a free user to Plans when the subject limit (5) is reached, and lets Plus add more", async () => {
    render(<App />);
    await go("Library");
    for (const n of ["Statistics", "Economics"]) {
      await userEvent.click(screen.getByRole("button", { name: /new subject/i }));
      await userEvent.type(screen.getByLabelText(/subject name/i), n);
      await userEvent.click(screen.getByRole("button", { name: /^create$/i }));
    }
    expect(useAppStore.getState().subjects).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: /new subject/i }));
    expect(screen.getByText(/study free\. upgrade for depth/i)).toBeTruthy();
    expect(useAppStore.getState().subjects).toHaveLength(5);

    await userEvent.click(within(screen.getByRole("main")).getByRole("button", { name: /upgrade to plus/i }));
    expect(useAppStore.getState().plan).toBe("plus");
    await go("Library");
    await userEvent.click(screen.getByRole("button", { name: /new subject/i }));
    expect(screen.getByLabelText(/subject name/i)).toBeTruthy();
  });

  it("locks Month analytics and retention on Free and unlocks them on Plus", async () => {
    render(<App />);
    await go("Analytics");
    await userEvent.click(screen.getByRole("tab", { name: /month/i }));
    expect(screen.getAllByText(/monthly view is part of plus/i).length).toBe(1);
    expect(screen.getByText(/retention analytics are part of plus/i)).toBeTruthy();
    act(() => useAppStore.setState({ plan: "plus" }));
    expect(screen.queryByText(/monthly view is part of plus/i)).toBeNull();
    expect(screen.queryByText(/retention analytics are part of plus/i)).toBeNull();
  });
});

describe("timer to analytics flow", () => {
  it("saves a session and discards one under a minute", async () => {
    render(<App />);
    await go("Timer");
    await userEvent.click(screen.getByRole("button", { name: /start session/i }));
    expect(useTimerStore.getState().active).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: /end session/i }));
    expect(screen.getByText(/too short to count/i)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /done/i }));

    const before = useAppStore.getState().sessions.length;
    await userEvent.click(screen.getByRole("button", { name: /start session/i }));
    act(() => useTimerStore.setState({ focusMs: 15 * 60_000 }));
    await userEvent.click(screen.getByRole("button", { name: /end session/i }));
    expect(screen.getAllByText(/session saved/i).length).toBeGreaterThan(0);
    const s = useAppStore.getState().sessions;
    expect(s.length).toBe(before + 1);
    expect(s.at(-1)?.focusSeconds).toBe(900);
  });
});

describe("flashcard review", () => {
  it("shows FSRS intervals on the rating buttons and stores the review", async () => {
    render(<App />);
    await go("Flashcards");
    await userEvent.click(screen.getAllByRole("button", { name: /review deck|study again/i })[0]);
    await userEvent.keyboard(" ");
    const again = screen.getByRole("button", { name: /^again/i });
    expect(within(again).getByText(/\d+ (min|hr|day)/)).toBeTruthy();
    const n = useAppStore.getState().reviews.length;
    await userEvent.keyboard("3");
    expect(useAppStore.getState().reviews.length).toBe(n + 1);
    expect(useAppStore.getState().reviews.at(-1)?.rating).toBe("Good");
  });
});

describe("persistence", () => {
  it("writes created data to localStorage so it survives a reload", async () => {
    render(<App />);
    useAppStore.getState().addSubject("Persisted");
    const raw = JSON.parse(localStorage.getItem("learnix-store-v1")!);
    expect(raw.state.subjects.some((s: { name: string }) => s.name === "Persisted")).toBe(true);
  });
});
