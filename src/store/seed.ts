import type { CardReview, QuizAttempt, Rating, StudySession } from "@/types";
import { daysAgo } from "@/lib/stats";

// Deterministic pseudo-random so the demo data looks the same on every fresh install.
let s = 42;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const at = (day: number, hour: number) => { const d = daysAgo(day); d.setHours(hour, Math.floor(rnd() * 50)); return d.toISOString(); };

const SUBJECTS = ["Auditing Theory", "Financial Accounting", "Taxation", "Statistics"];
// minutes studied per day, index 0 = today. Today is below goal so the streak (7) counts through yesterday.
const DAY_MINUTES = [48, 85, 62, 96, 70, 64, 90, 75, 30, 66, 0, 72, 40, 80];

export function demoSessions(): StudySession[] {
  const out: StudySession[] = [];
  DAY_MINUTES.forEach((mins, day) => {
    if (!mins) return;
    const first = Math.round(mins * 0.6), second = mins - first;
    [[first, 9], [second, 19]].forEach(([m, hour], i) => {
      if (m < 1) return;
      const startedAt = at(day, hour);
      const end = new Date(new Date(startedAt).getTime() + m * 60000).toISOString();
      out.push({
        id: `demo-s-${day}-${i}`, subject: SUBJECTS[(day + i) % SUBJECTS.length],
        activity: (["flashcards", "quiz", "reading"] as const)[(day + i) % 3],
        startedAt, endedAt: end, focusSeconds: m * 60, demo: true,
      });
    });
  });
  return out;
}

const TOPIC_ACCURACY: [string, number][] = [
  ["Audit sampling", 0.42], ["Deferred tax assets", 0.61], ["Bank reconciliation", 0.86],
  ["Audit Assertions", 0.78], ["Audit Risk", 0.55], ["Audit Evidence", 0.9],
];

export function demoAttempts(): QuizAttempt[] {
  const out: QuizAttempt[] = [];
  TOPIC_ACCURACY.forEach(([topic, acc], t) => {
    for (let i = 0; i < 10; i++)
      out.push({ id: `demo-a-${t}-${i}`, questionId: 1000 + t * 10 + i, topic, correct: rnd() < acc, answeredAt: at(i % 14, 10 + (i % 8)), demo: true });
  });
  return out;
}

export function demoReviews(): CardReview[] {
  const out: CardReview[] = [];
  const topics = ["Audit Assertions", "Audit Objectives", "Audit Evidence", "Audit Risk", "Professional Ethics"];
  for (let c = 0; c < 5; c++)
    for (let i = 0; i < 6; i++) {
      const r = rnd();
      const rating: Rating = r < 0.15 ? "Again" : r < 0.3 ? "Hard" : r < 0.8 ? "Good" : "Easy";
      out.push({ id: `demo-r-${c}-${i}`, cardId: 9000 + c, topic: topics[c], subject: "Auditing Theory", rating, reviewedAt: at(13 - i * 2, 20), nextDueAt: at(12 - i * 2, 20), demo: true });
    }
  return out;
}
