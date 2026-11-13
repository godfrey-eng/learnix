# Learnix

React 19 + TypeScript + Vite + Tailwind v4. Started in Figma Make, now structured as a normal app.

```
pnpm install
pnpm dev        # run
pnpm test       # 20 tests (logic + UI flows)
pnpm typecheck
```

## Structure
- `src/types.ts` domain types (Subject, Card, CardReview, QuizAttempt, StudySession...)
- `src/store/` Zustand stores, persisted to localStorage (`useAppStore`, `useTimerStore`, demo `seed.ts`)
- `src/lib/` `fsrs.ts` (ts-fsrs wrapper), `stats.ts` (analytics queries), `plan.ts` (Free/Plus limits)
- `src/features/` dashboard, library, flashcards, quizzes, timer, analytics, billing
- `src/components/` shared UI and layout

## Behaviour worth knowing
- Study time = focus seconds from the timer. Breaks and paused time are excluded; a gap over 70 s between ticks (closed tab, sleep) counts as idle; sessions under 1 minute are discarded.
- Flashcard/quiz sessions log their own study time only when the timer is not already running.
- Topic status needs at least 3 answers: Strong 80%+, Needs review 60-79%, Weak below 60%.
- Sample data (flagged `demo: true`) is seeded on first run; Analytics has a "Clear sample data" button.
- Plan switching is local and for testing. Payments are not connected.

## Next
Supabase (auth, Postgres, storage) replacing the persisted stores, then TanStack Query on top. Reminders and Settings are placeholders. Quiz questions are still the static sample set.
