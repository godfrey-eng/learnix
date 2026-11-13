import { describe, it, expect, beforeEach, vi } from "vitest";
import { previewIntervals, reviewCard, isDue } from "@/lib/fsrs";
import { minutesByDay, streak, topicAccuracy, retentionRate, statusFor } from "@/lib/stats";
import { limitsFor } from "@/lib/plan";
import { useTimerStore } from "@/store/useTimerStore";
import { useAppStore, selectDecks } from "@/store/useAppStore";
import type { CardReview, StudySession } from "@/types";

const session = (daysBack: number, mins: number): StudySession => {
  const d = new Date(); d.setDate(d.getDate() - daysBack); d.setHours(12, 0, 0, 0);
  return { id: `${daysBack}-${mins}`, subject: "X", activity: "reading", startedAt: d.toISOString(), endedAt: d.toISOString(), focusSeconds: mins * 60 };
};

describe("FSRS scheduling", () => {
  it("gives increasing intervals Again < Hard < Good < Easy for a new card", () => {
    const now = new Date();
    const p = previewIntervals(undefined, now);
    expect(Object.keys(p)).toEqual(["Again", "Hard", "Good", "Easy"]);
    const next = (r: "Again" | "Hard" | "Good" | "Easy") => new Date(reviewCard(undefined, r, now).due).getTime();
    expect(next("Again")).toBeLessThanOrEqual(next("Good"));
    expect(next("Good")).toBeLessThan(next("Easy"));
  });
  it("spaces a card further out after repeated Good ratings", () => {
    let s = reviewCard(undefined, "Good", new Date("2026-01-01T00:00:00Z"));
    const first = s.scheduled_days;
    s = reviewCard(s, "Good", new Date(s.due));
    s = reviewCard(s, "Good", new Date(s.due));
    expect(s.scheduled_days).toBeGreaterThan(first);
    expect(s.reps).toBe(3);
  });
  it("treats unreviewed and past-due cards as due", () => {
    expect(isDue(undefined)).toBe(true);
    const s = reviewCard(undefined, "Easy", new Date());
    expect(isDue(s, new Date())).toBe(false);
    expect(isDue(s, new Date(Date.now() + 40 * 86400000))).toBe(true);
  });
});

describe("analytics helpers", () => {
  it("sums minutes per day and counts a streak ending yesterday when today is below goal", () => {
    const s = [session(0, 20), session(1, 70), session(2, 65), session(3, 60), session(5, 90)];
    expect(minutesByDay(s, 7).at(-1)?.minutes).toBe(20);
    expect(streak(s, 60)).toBe(3);
    expect(streak([session(0, 60), ...s.slice(1)], 60)).toBe(4);
  });
  it("requires a minimum number of answers before giving a topic a status", () => {
    const att = [1, 2].map((i) => ({ id: `${i}`, questionId: i, topic: "T", correct: true, answeredAt: "" }));
    expect(topicAccuracy(att, [])).toHaveLength(0);
    expect(topicAccuracy([...att, { ...att[0], id: "3" }], [])[0]).toMatchObject({ accuracy: 100, status: "Strong" });
  });
  it("uses 80 / 60 thresholds for status", () => {
    expect([statusFor(80), statusFor(79), statusFor(60), statusFor(59)]).toEqual(["Strong", "Needs review", "Needs review", "Weak"]);
  });
  it("computes retention only from repeat reviews", () => {
    const r = (id: number, rating: CardReview["rating"], t: string): CardReview => ({ id: `${id}${t}`, cardId: id, topic: "T", rating, reviewedAt: t, nextDueAt: t });
    expect(retentionRate([r(1, "Good", "2026-01-01")])).toBeNull();
    expect(retentionRate([r(1, "Again", "2026-01-01"), r(1, "Good", "2026-01-03"), r(1, "Hard", "2026-01-09")])).toBe(50);
  });
});

describe("plan limits", () => {
  it("matches the blueprint", () => {
    expect(limitsFor("free")).toMatchObject({ subjects: 5, decks: 10, historyDays: 7, monthView: false, retention: false });
    expect(limitsFor("plus").subjects).toBe(Infinity);
  });
});

describe("timer", () => {
  beforeEach(() => { vi.useFakeTimers(); useTimerStore.getState().end(); });
  it("counts focus time only while running and caps long gaps as idle", () => {
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const t = () => useTimerStore.getState();
    t().start();
    vi.setSystemTime(new Date("2026-01-01T10:00:30Z")); t().tick();
    expect(t().focusMs).toBe(30_000);
    t().pause();
    vi.setSystemTime(new Date("2026-01-01T10:10:00Z")); t().tick();
    expect(t().focusMs).toBe(30_000);
    t().resume();
    vi.setSystemTime(new Date("2026-01-01T13:00:00Z")); t().tick(); // 3h gap = tab closed / asleep
    expect(t().focusMs).toBe(30_000 + 70_000);
  });
  it("switches to break after the focus target and discards sessions under a minute", () => {
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const t = () => useTimerStore.getState();
    t().configure({ focusMinutes: 1, breakMinutes: 1 });
    t().start();
    vi.setSystemTime(new Date("2026-01-01T10:01:00Z")); t().tick();
    expect(t().phase).toBe("break");
    expect(t().cycles).toBe(1);
    t().start(); // restart then end immediately
    expect(t().end()).toBeNull();
    t().configure({ focusMinutes: 25, breakMinutes: 5 });
  });
  it("returns a summary for a real session", () => {
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const t = () => useTimerStore.getState();
    t().start();
    for (let i = 1; i <= 3; i++) { vi.setSystemTime(Date.now() + 30_000); t().tick(); }
    const s = t().end();
    expect(s?.focusSeconds).toBe(90);
    expect(t().active).toBe(false);
  });
});

describe("app store", () => {
  beforeEach(() => vi.useRealTimers());
  it("rating a card schedules it with FSRS and logs a review", () => {
    const { cards, rateCard } = useAppStore.getState();
    const id = cards[0].id; const before = useAppStore.getState().reviews.length;
    rateCard(id, "Good");
    const s = useAppStore.getState();
    expect(s.cards.find((c) => c.id === id)?.fsrs?.reps).toBe(1);
    expect(s.reviews.length).toBe(before + 1);
    expect(selectDecks(s).find((d) => d.id === 1)!.due).toBeLessThan(cardsInDeck(1));
  });
  it("does not double-count when the timer is already running", () => {
    useTimerStore.getState().start();
    const n = useAppStore.getState().sessions.length;
    useAppStore.getState().logActivitySession("X", "quiz", 120);
    expect(useAppStore.getState().sessions.length).toBe(n);
    useTimerStore.getState().end();
    useAppStore.getState().logActivitySession("X", "quiz", 120);
    expect(useAppStore.getState().sessions.length).toBe(n + 1);
  });
  it("clears demo data without touching real data", () => {
    useAppStore.getState().logSession({ subject: "Real", activity: "reading", startedAt: new Date().toISOString(), focusSeconds: 600 });
    useAppStore.getState().clearDemoData();
    const s = useAppStore.getState();
    expect(s.sessions.some((x) => x.demo)).toBe(false);
    expect(s.sessions.some((x) => x.subject === "Real")).toBe(true);
  });
});
function cardsInDeck(id: number) { return useAppStore.getState().cards.filter((c) => c.deckId === id).length; }
