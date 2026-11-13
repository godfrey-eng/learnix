import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Activity, CardReview, Flashcard, FlashcardDeck, FsrsCardState, Plan, QuizAttempt, Rating, StudySession, Subject } from "@/types";
import { flashcardDecks, reviewCards, subjects as seedSubjects } from "@/data/mock";
import { reviewCard } from "@/lib/fsrs";
import { demoAttempts, demoReviews, demoSessions } from "./seed";
import { useTimerStore } from "./useTimerStore";

export type DeckMeta = Pick<FlashcardDeck, "id" | "title" | "subject" | "color">;
export interface StoredCard extends Flashcard { deckId: number; fsrs?: FsrsCardState }

const extra: Record<number, [string, string, string][]> = {
  2: [
    ["What is the effect of a bank reconciliation's outstanding checks on the book balance?", "None. Outstanding checks adjust the bank balance, not the book balance.", "Bank reconciliation"],
    ["How is an allowance for doubtful accounts reported?", "As a contra-asset that reduces accounts receivable to net realizable value.", "Receivables"],
    ["What items make up cash and cash equivalents?", "Currency, demand deposits, and short-term highly liquid investments of three months or less.", "Cash"],
  ],
  3: [
    ["What is the corporate income tax rate for domestic corporations in the Philippines under the CREATE law?", "25% generally, 20% for qualifying small corporations.", "Income tax rates"],
    ["What is the VAT rate in the Philippines?", "12% on the sale of goods, properties, and services.", "Business tax"],
    ["What is a deferred tax asset?", "Future tax savings from deductible temporary differences and carryforwards.", "Deferred tax assets"],
  ],
  4: [
    ["What is the median?", "The middle value of an ordered data set.", "Central tendency"],
    ["What does standard deviation measure?", "The typical spread of values around the mean.", "Dispersion"],
    ["When is the median preferred over the mean?", "When the data is skewed or has outliers.", "Central tendency"],
  ],
};

const seedCards = (): StoredCard[] => {
  let id = 100;
  const own = reviewCards.map((c) => ({ ...c, deckId: 1 }));
  const rest = Object.entries(extra).flatMap(([deckId, list]) => list.map(([front, back, topic]) => ({ id: id++, front, back, topic, deckId: Number(deckId) })));
  return [...own, ...rest];
};

interface AppState {
  plan: Plan;
  dailyGoalMinutes: number;
  subjects: Subject[];
  decks: DeckMeta[];
  cards: StoredCard[];
  sessions: StudySession[];
  reviews: CardReview[];
  attempts: QuizAttempt[];
  setPlan: (plan: Plan) => void;
  setGoal: (minutes: number) => void;
  addSubject: (name: string) => void;
  addDeck: (title: string, subject: string) => void;
  addCard: (card: Omit<Flashcard, "id">, deckId: number) => void;
  rateCard: (cardId: number, rating: Rating) => void;
  addAttempts: (attempts: Omit<QuizAttempt, "id" | "answeredAt">[]) => void;
  logSession: (s: { subject: string; activity: Activity; startedAt: string; focusSeconds: number }) => void;
  /** Logs a session from flashcards/quiz unless the focus timer is already counting the time. */
  logActivitySession: (subject: string, activity: Activity, seconds: number) => void;
  clearDemoData: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const COLORS = ["#4F46E5", "#0D9488", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9"];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plan: "free",
      dailyGoalMinutes: 60,
      subjects: seedSubjects,
      decks: flashcardDecks.map(({ id, title, subject, color }) => ({ id, title, subject, color })),
      cards: seedCards(),
      sessions: demoSessions(),
      reviews: demoReviews(),
      attempts: demoAttempts(),
      setPlan: (plan) => set({ plan }),
      setGoal: (dailyGoalMinutes) => set({ dailyGoalMinutes }),
      addSubject: (name) =>
        set((s) => ({
          subjects: [...s.subjects, {
            id: Date.now(), name, code: name.slice(0, 3).toUpperCase(), description: "No materials yet",
            documents: 0, decks: 0, topics: 0, color: COLORS[s.subjects.length % COLORS.length], progress: 0,
          }],
        })),
      addDeck: (title, subject) =>
        set((s) => ({ decks: [...s.decks, { id: Date.now(), title, subject, color: COLORS[s.decks.length % COLORS.length] }] })),
      addCard: (card, deckId) => set((s) => ({ cards: [...s.cards, { ...card, id: Date.now(), deckId }] })),
      rateCard: (cardId, rating) => {
        const now = new Date();
        const card = get().cards.find((c) => c.id === cardId);
        if (!card) return;
        const fsrs = reviewCard(card.fsrs, rating, now);
        const deck = get().decks.find((d) => d.id === card.deckId);
        set((s) => ({
          cards: s.cards.map((c) => (c.id === cardId ? { ...c, fsrs } : c)),
          reviews: [...s.reviews, { id: uid(), cardId, topic: card.topic, subject: deck?.subject, rating, reviewedAt: now.toISOString(), nextDueAt: fsrs.due }],
        }));
      },
      addAttempts: (attempts) =>
        set((s) => ({ attempts: [...s.attempts, ...attempts.map((a) => ({ ...a, id: uid(), answeredAt: new Date().toISOString() }))] })),
      logSession: ({ subject, activity, startedAt, focusSeconds }) =>
        set((s) => ({ sessions: [...s.sessions, { id: uid(), subject, activity, startedAt, endedAt: new Date().toISOString(), focusSeconds }] })),
      logActivitySession: (subject, activity, seconds) => {
        if (useTimerStore.getState().active || seconds < 30) return;
        get().logSession({ subject, activity, startedAt: new Date(Date.now() - seconds * 1000).toISOString(), focusSeconds: seconds });
      },
      clearDemoData: () =>
        set((s) => ({ sessions: s.sessions.filter((x) => !x.demo), reviews: s.reviews.filter((x) => !x.demo), attempts: s.attempts.filter((x) => !x.demo) })),
    }),
    { name: "learnix-store-v1" },
  ),
);

/** Decks with card count, due count and mastery derived from real card state. */
export function selectDecks(state: Pick<AppState, "decks" | "cards" | "reviews">): FlashcardDeck[] {
  const now = Date.now();
  return state.decks.map((d) => {
    const cards = state.cards.filter((c) => c.deckId === d.id);
    const due = cards.filter((c) => !c.fsrs || new Date(c.fsrs.due).getTime() <= now).length;
    const mastered = cards.length ? Math.round((cards.filter((c) => c.fsrs && c.fsrs.stability >= 21).length / cards.length) * 100) : 0;
    const last = state.reviews.filter((r) => cards.some((c) => c.id === r.cardId)).map((r) => r.reviewedAt).sort().pop();
    const lastStudied = last ? new Date(last).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Not yet";
    return { ...d, cards: cards.length, due, mastered, lastStudied };
  });
}
