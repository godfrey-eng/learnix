import type { CardReview, QuizAttempt, Status, StudySession } from "@/types";

export const dayKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysAgo = (n: number) => { const d = startOfDay(); d.setDate(d.getDate() - n); return d; };
export const minutes = (secs: number) => Math.round(secs / 60);

export function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function minutesByDay(sessions: StudySession[], days: number) {
  const map = new Map<string, number>();
  for (const s of sessions) map.set(dayKey(s.startedAt), (map.get(dayKey(s.startedAt)) ?? 0) + s.focusSeconds);
  return Array.from({ length: days }, (_, i) => {
    const d = daysAgo(days - 1 - i);
    return { date: d, key: dayKey(d), minutes: minutes(map.get(dayKey(d)) ?? 0) };
  });
}

export function minutesBySubject(sessions: StudySession[]) {
  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.subject, (map.get(s.subject) ?? 0) + s.focusSeconds);
  return [...map.entries()].map(([subject, secs]) => ({ subject, minutes: minutes(secs) })).sort((a, b) => b.minutes - a.minutes);
}

export const statusFor = (accuracy: number): Status => (accuracy >= 80 ? "Strong" : accuracy >= 60 ? "Needs review" : "Weak");

/** Accuracy by topic from quiz attempts and card ratings (Good/Easy = correct). Needs MIN attempts to show a status. */
export function topicAccuracy(attempts: QuizAttempt[], reviews: CardReview[], min = 3) {
  const map = new Map<string, { right: number; total: number }>();
  const add = (topic: string, ok: boolean) => {
    const e = map.get(topic) ?? { right: 0, total: 0 };
    e.total += 1; if (ok) e.right += 1; map.set(topic, e);
  };
  attempts.forEach((a) => add(a.topic, a.correct));
  reviews.forEach((r) => add(r.topic, r.rating === "Good" || r.rating === "Easy"));
  return [...map.entries()]
    .filter(([, v]) => v.total >= min)
    .map(([topic, v]) => { const accuracy = Math.round((v.right / v.total) * 100); return { topic, accuracy, attempts: v.total, status: statusFor(accuracy) }; })
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Retention: share of 2nd-or-later reviews rated Good or Easy. */
export function retentionRate(reviews: CardReview[]) {
  const seen = new Set<number>(); let total = 0, kept = 0;
  for (const r of [...reviews].sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt))) {
    if (seen.has(r.cardId)) { total += 1; if (r.rating === "Good" || r.rating === "Easy") kept += 1; }
    seen.add(r.cardId);
  }
  return total === 0 ? null : Math.round((kept / total) * 100);
}

/** Streak: consecutive days (ending today or yesterday) with at least goalMinutes of focus. */
export function streak(sessions: StudySession[], goalMinutes: number) {
  const byDay = new Map(minutesByDay(sessions, 120).map((d) => [d.key, d.minutes]));
  let n = 0; let i = byDay.get(dayKey(daysAgo(0)))! >= goalMinutes ? 0 : 1;
  for (; i < 120; i++) { if ((byDay.get(dayKey(daysAgo(i))) ?? 0) >= goalMinutes) n++; else break; }
  return n;
}

/** Live attempts and best score for one quiz, built from recorded answers grouped by run. */
export function quizRunStats(attempts: QuizAttempt[], quizId: number) {
  const runs = new Map<string, { right: number; total: number }>();
  for (const a of attempts) {
    if (a.quizId !== quizId || !a.runId) continue;
    const r = runs.get(a.runId) ?? { right: 0, total: 0 };
    r.total += 1; if (a.correct) r.right += 1; runs.set(a.runId, r);
  }
  const scores = [...runs.values()].map((r) => Math.round((r.right / r.total) * 100));
  return { attempts: runs.size, best: scores.length ? Math.max(...scores) : 0 };
}
