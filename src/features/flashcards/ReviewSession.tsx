import { useEffect, useRef, useState } from "react";
import type { FlashcardDeck, Rating } from "@/types";
import { useAppStore, type StoredCard } from "@/store/useAppStore";
import { isDue, previewIntervals } from "@/lib/fsrs";
import { useStudyClock } from "@/lib/useStudyClock";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

export function ReviewSession({ deck, onExit }: { deck: FlashcardDeck; onExit: () => void }) {
  const { cards, rateCard, logActivitySession } = useAppStore();
  const dueNow = () => cards.filter((c) => c.deckId === deck.id && isDue(c.fsrs));
  const [queue, setQueue] = useState<StoredCard[]>(dueNow);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [finished, setFinished] = useState(false);
  const takeSeconds = useStudyClock();
  const subjectRef = useRef(deck.subject);
  const finishedRef = useRef(false);
  const [timeSpent, setTimeSpent] = useState("0m 00s");

  const rate = (rating: Rating) => {
    if (!flipped || finished || !queue[index]) return;
    rateCard(queue[index].id, rating);
    const nextRatings = [...ratings, rating];
    setRatings(nextRatings);
    if (index === queue.length - 1) {
      const seconds = takeSeconds();
      logActivitySession(deck.subject, "flashcards", seconds);
      setTimeSpent(`${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`);
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setFlipped(false);
  };

  finishedRef.current = finished;
  // Leaving mid-deck still logs the active time spent so far.
  useEffect(() => () => { if (!finishedRef.current) useAppStore.getState().logActivitySession(subjectRef.current, "flashcards", takeSeconds()); }, [takeSeconds]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (finished) return;
      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
      const shortcuts: Record<string, Rating> = {
        "1": "Again",
        "2": "Hard",
        "3": "Good",
        "4": "Easy",
      };
      if (shortcuts[event.key]) rate(shortcuts[event.key]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!finished && queue.length === 0) {
    const all = cards.filter((c) => c.deckId === deck.id);
    return (
      <main className="page-container grid min-h-[calc(100vh-72px)] place-items-center">
        <section className="card w-full max-w-lg text-center">
          <p className="eyebrow">{all.length ? "All caught up" : "Empty deck"}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{all.length ? "No cards are due in this deck" : "This deck has no cards yet"}</h1>
          <p className="mt-2 text-sm text-slate-500">{all.length ? "Come back when cards are due, or study ahead now." : "Add a card from the Flashcards page to start."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={onExit}>Back to decks</Button>
            {all.length > 0 && <Button onClick={() => { setQueue(all); }}>Study ahead ({all.length})</Button>}
          </div>
        </section>
      </main>
    );
  }

  if (finished) {
    const confident = ratings.filter((rating) => rating === "Good" || rating === "Easy").length;
    const accuracy = Math.round((confident / ratings.length) * 100);
    return (
      <main className="page-container grid min-h-[calc(100vh-72px)] place-items-center">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Icon name="check" size={31} />
          </div>
          <p className="eyebrow mt-6">Session complete</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Nice work, Miguel!
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You cleared today’s review for {deck.title}.
          </p>
          <div className="mt-8 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-5 dark:divide-slate-800 dark:bg-slate-950">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {ratings.length}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Reviewed
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Accuracy
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {timeSpent}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Time spent
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="secondary" onClick={onExit}>
              Back to decks
            </Button>
            <Button
              icon="cards"
              onClick={() => {
                setQueue(dueNow());
                setIndex(0);
                setRatings([]);
                setFlipped(false);
                setFinished(false);
              }}
            >
              Review again
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const card = queue[index];
  const remaining = queue.length - index;
  const intervals = previewIntervals(card.fsrs);
  const ratingOptions: { label: Rating; interval: string; style: string }[] = [
    {
      label: "Again",
      interval: intervals.Again,
      style:
        "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40",
    },
    {
      label: "Hard",
      interval: intervals.Hard,
      style:
        "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-950/40",
    },
    {
      label: "Good",
      interval: intervals.Good,
      style:
        "border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/40",
    },
    {
      label: "Easy",
      interval: intervals.Easy,
      style:
        "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
    },
  ];

  return (
    <main className="page-container max-w-5xl">
      <section className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400"
          onClick={onExit}
          type="button"
        >
          <Icon name="close" size={18} /> End session
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{deck.title}</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {remaining} cards remaining
          </p>
        </div>
        <span className="hidden text-xs font-semibold text-slate-400 sm:block">
          Press space to flip
        </span>
        <span className="w-8 sm:hidden" />
      </section>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${((index + 1) / queue.length) * 100}%` }}
        />
      </div>

      <section className="mx-auto mt-10 max-w-3xl">
        <button
          className={`flashcard-scene w-full ${flipped ? "is-flipped" : ""}`}
          onClick={() => setFlipped((value) => !value)}
          aria-label={flipped ? "Show question" : "Show answer"}
          type="button"
        >
          <span className="flashcard-inner">
            <span className="flashcard-face">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                {card.topic}
              </span>
              <span className="mt-8 block max-w-xl text-xl font-extrabold leading-relaxed tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {card.front}
              </span>
              <span className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Icon name="cards" size={15} /> Click or press space to reveal
              </span>
            </span>
            <span className="flashcard-face flashcard-back">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                Answer
              </span>
              <span className="mt-8 block max-w-xl text-lg font-bold leading-relaxed text-slate-800 dark:text-slate-100 sm:text-xl">
                {card.back}
              </span>
              <span className="mt-8 text-xs font-semibold text-slate-400">
                How well did you know this?
              </span>
            </span>
          </span>
        </button>

        <div
          className={`mt-6 grid grid-cols-2 gap-3 transition sm:grid-cols-4 ${flipped ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
        >
          {ratingOptions.map((option, optionIndex) => (
            <button
              className={`rounded-2xl border bg-white p-3 text-center transition active:scale-[0.98] dark:bg-slate-900 ${option.style}`}
              key={option.label}
              onClick={() => rate(option.label)}
              type="button"
            >
              <span className="block text-sm font-extrabold">{option.label}</span>
              <span className="mt-1 block text-[10px] font-semibold opacity-70">
                {option.interval}
              </span>
              <span className="mt-2 hidden text-[9px] font-bold opacity-40 sm:block">
                Press {optionIndex + 1}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
