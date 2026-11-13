import { FSRS, Rating as FsrsRating, createEmptyCard, type Card as FsrsCard, type Grade } from "ts-fsrs";
import type { FsrsCardState, Rating } from "@/types";

const scheduler = new FSRS({ enable_fuzz: false });

const gradeOf: Record<Rating, Grade> = {
  Again: FsrsRating.Again,
  Hard: FsrsRating.Hard,
  Good: FsrsRating.Good,
  Easy: FsrsRating.Easy,
};
const ratings: Rating[] = ["Again", "Hard", "Good", "Easy"];

const toState = (c: FsrsCard): FsrsCardState => ({
  due: c.due.toISOString(),
  stability: c.stability,
  difficulty: c.difficulty,
  scheduled_days: c.scheduled_days,
  reps: c.reps,
  lapses: c.lapses,
  learning_steps: c.learning_steps,
  state: c.state,
  last_review: c.last_review?.toISOString(),
});

const fromState = (s: FsrsCardState | undefined, now: Date): FsrsCard => {
  if (!s) return createEmptyCard(now);
  return {
    ...createEmptyCard(now),
    ...s,
    due: new Date(s.due),
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  } as FsrsCard;
};

export function formatInterval(from: Date, to: Date): string {
  const mins = Math.max(1, Math.round((to.getTime() - from.getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30);
  return `${months} mo`;
}

/** Interval labels for the four rating buttons, e.g. { Again: "1 min", ... } */
export function previewIntervals(state: FsrsCardState | undefined, now = new Date()): Record<Rating, string> {
  const preview = scheduler.repeat(fromState(state, now), now);
  const out = {} as Record<Rating, string>;
  for (const r of ratings) out[r] = formatInterval(now, preview[gradeOf[r]].card.due);
  return out;
}

export function reviewCard(state: FsrsCardState | undefined, rating: Rating, now = new Date()) {
  const next = scheduler.next(fromState(state, now), now, gradeOf[rating]).card;
  return toState(next);
}

export const isDue = (state: FsrsCardState | undefined, now = new Date()) =>
  !state || new Date(state.due).getTime() <= now.getTime();
