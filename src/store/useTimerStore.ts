import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Activity } from "@/types";

type Phase = "focus" | "break";
const MAX_TICK_MS = 70_000; // a gap longer than this (closed tab / sleeping laptop) is idle time, not study time

export interface TimerSummary { subject: string; activity: Activity; startedAt: string; focusSeconds: number; breakSeconds: number; cycles: number }

interface TimerState {
  active: boolean;
  running: boolean;
  phase: Phase;
  subject: string;
  activity: Activity;
  startedAt: string | null;
  focusMs: number;
  breakMs: number;
  phaseMs: number;
  cycles: number;
  lastTickAt: number;
  focusMinutes: number;
  breakMinutes: number;
  configure: (c: Partial<Pick<TimerState, "subject" | "activity" | "focusMinutes" | "breakMinutes">>) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skipPhase: () => void;
  tick: () => void;
  /** Ends the session and returns what to log (null when it was too short to count). */
  end: () => TimerSummary | null;
}

const MIN_COUNTED_SECONDS = 60;

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      active: false, running: false, phase: "focus", subject: "Auditing Theory", activity: "reading",
      startedAt: null, focusMs: 0, breakMs: 0, phaseMs: 0, cycles: 0, lastTickAt: 0, focusMinutes: 25, breakMinutes: 5,
      configure: (c) => set(c),
      start: () => set({ active: true, running: true, phase: "focus", startedAt: new Date().toISOString(), focusMs: 0, breakMs: 0, phaseMs: 0, cycles: 0, lastTickAt: Date.now() }),
      pause: () => set({ running: false }),
      resume: () => set({ running: true, lastTickAt: Date.now() }),
      skipPhase: () => set((s) => ({ phase: s.phase === "focus" ? "break" : "focus", phaseMs: 0, cycles: s.phase === "focus" ? s.cycles + 1 : s.cycles })),
      tick: () => {
        const s = get();
        if (!s.active || !s.running) return;
        const now = Date.now();
        const delta = Math.min(now - s.lastTickAt, MAX_TICK_MS);
        const phaseMs = s.phaseMs + delta;
        const target = (s.phase === "focus" ? s.focusMinutes : s.breakMinutes) * 60_000;
        const patch = s.phase === "focus" ? { focusMs: s.focusMs + delta } : { breakMs: s.breakMs + delta };
        if (phaseMs >= target) set({ ...patch, lastTickAt: now, phase: s.phase === "focus" ? "break" : "focus", phaseMs: 0, cycles: s.phase === "focus" ? s.cycles + 1 : s.cycles });
        else set({ ...patch, lastTickAt: now, phaseMs });
      },
      end: () => {
        const s = get();
        const summary: TimerSummary | null = s.active && s.startedAt && s.focusMs >= MIN_COUNTED_SECONDS * 1000
          ? { subject: s.subject, activity: s.activity, startedAt: s.startedAt, focusSeconds: Math.round(s.focusMs / 1000), breakSeconds: Math.round(s.breakMs / 1000), cycles: s.cycles }
          : null;
        set({ active: false, running: false, phase: "focus", startedAt: null, focusMs: 0, breakMs: 0, phaseMs: 0, cycles: 0 });
        return summary;
      },
    }),
    {
      name: "learnix-timer-v1",
      // A session that was running when the page closed resumes paused, so closed-tab time is never counted.
      onRehydrateStorage: () => (state) => { if (state?.running) state.pause(); },
    },
  ),
);
