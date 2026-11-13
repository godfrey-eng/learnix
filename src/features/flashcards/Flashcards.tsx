import { useState } from "react";
import type { FlashcardDeck } from "@/types";
import { NameDialog } from "@/components/NameDialog";
import { useAppStore, selectDecks } from "@/store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { limitsFor } from "@/lib/plan";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { CardEditor } from "@/features/flashcards/CardEditor";
import { ReviewSession } from "@/features/flashcards/ReviewSession";

export function Flashcards({ notify, onUpgrade }: { notify: (message: string) => void; onUpgrade: () => void }) {
  const { decks: deckMeta, cards, reviews, plan, subjects, addCard, addDeck } = useAppStore(useShallow((s) => ({ decks: s.decks, cards: s.cards, reviews: s.reviews, plan: s.plan, subjects: s.subjects, addCard: s.addCard, addDeck: s.addDeck })));
  const flashcardDecks = selectDecks({ decks: deckMeta, cards, reviews });
  const [deckDialog, setDeckDialog] = useState(false);
  const newDeck = () => (flashcardDecks.length >= limitsFor(plan).decks ? onUpgrade() : setDeckDialog(true));
  const [reviewDeck, setReviewDeck] = useState<FlashcardDeck | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const totalDue = flashcardDecks.reduce((total, deck) => total + deck.due, 0);

  if (reviewDeck) return <ReviewSession deck={reviewDeck} onExit={() => setReviewDeck(null)} />;

  return (
    <main className="page-container">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Active recall</p>
          <h1 className="page-title mt-2">Flashcards</h1>
          <p className="page-subtitle">Strengthen what you know, one card at a time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="plus" onClick={newDeck}>New deck</Button>
          <Button icon="plus" onClick={() => setEditorOpen(true)} className={flashcardDecks.length ? "" : "pointer-events-none opacity-50"}>New flashcard</Button>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-[#6858e8] p-6 text-white shadow-xl shadow-indigo-600/15 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Daily review
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
            {totalDue} cards are ready
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100">
            A focused review now will help these accounting concepts stick for the board exam.
          </p>
        </div>
        <button
          className="flex min-w-40 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
          onClick={() => setReviewDeck(flashcardDecks.slice().sort((a, b) => b.due - a.due)[0])}
          disabled={totalDue === 0}
          type="button"
        >
          Review due cards <Icon name="arrow" size={17} />
        </button>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="section-kicker">Your collection</span>
            <h2 className="section-title mt-1">Study decks</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {flashcardDecks.length} decks
          </span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {flashcardDecks.map((deck) => (
            <article className="card group" key={deck.id}>
              <div className="flex items-start gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: deck.color, boxShadow: `0 8px 22px ${deck.color}30` }}
                >
                  <Icon name="cards" size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                        {deck.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {deck.subject} · {deck.cards} cards
                      </p>
                    </div>
                    {deck.due > 0 ? (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        {deck.due} due
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        All caught up
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Mastery progress</span>
                <span className="text-slate-700 dark:text-slate-200">{deck.mastered}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${deck.mastered}%`, backgroundColor: deck.color }}
                />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[10px] font-medium text-slate-400">
                  Studied {deck.lastStudied}
                </span>
                <button
                  className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                  onClick={() => setReviewDeck(deck)}
                  type="button"
                >
                  {deck.due > 0 ? "Review deck" : "Study again"} <Icon name="arrow" size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editorOpen && (
        <CardEditor
          decks={flashcardDecks}
          onClose={() => setEditorOpen(false)}
          onSave={(card, deckId) => {
            addCard(card, deckId);
            setEditorOpen(false);
            notify(`Card added to ${card.topic}`);
          }}
        />
      )}
      {deckDialog && (
        <NameDialog title="New deck" label="Deck name" placeholder="e.g. Partnership Accounting" onClose={() => setDeckDialog(false)}
          onSubmit={(name) => { addDeck(name, subjects[0]?.name ?? "General"); setDeckDialog(false); notify(`Deck “${name}” created`); }} />
      )}
    </main>
  );
}
