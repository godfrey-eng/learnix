import { useState } from "react";
import type { Flashcard } from "@/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

export function CardEditor({
  onClose,
  onSave,
  decks,
}: {
  onClose: () => void;
  onSave: (card: Omit<Flashcard, "id">, deckId: number) => void;
  decks: { id: number; title: string }[];
}) {
  const [deckId, setDeckId] = useState(decks[0]?.id ?? 0);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  const save = () => {
    if (!front.trim() || !back.trim()) {
      setError("Add both the front and back of the card.");
      return;
    }
    if (!topic.trim()) {
      setError("A topic tag is required.");
      return;
    }
    onSave({ front: front.trim(), back: back.trim(), topic: topic.trim() }, deckId);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-editor-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Card editor</p>
            <h2
              className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
              id="card-editor-title"
            >
              Create a flashcard
            </h2>
            <p className="mt-1 text-xs text-slate-400">Keep each card focused on one clear idea.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close editor" type="button">
            <Icon name="close" size={19} />
          </button>
        </div>

        <label
          className="mt-6 block text-xs font-bold text-slate-600 dark:text-slate-300"
          htmlFor="card-front"
        >
          Front
        </label>
        <textarea
          className="editor-field mt-2 min-h-28"
          id="card-front"
          onChange={(event) => setFront(event.target.value)}
          placeholder="Enter a question or key term"
          value={front}
          autoFocus
        />

        <label
          className="mt-5 block text-xs font-bold text-slate-600 dark:text-slate-300"
          htmlFor="card-back"
        >
          Back
        </label>
        <textarea
          className="editor-field mt-2 min-h-32"
          id="card-back"
          onChange={(event) => setBack(event.target.value)}
          placeholder="Enter the answer or explanation"
          value={back}
        />

        <label className="mt-5 block text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="card-deck">Deck</label>
        <select className="editor-field mt-2" id="card-deck" value={deckId} onChange={(event) => setDeckId(Number(event.target.value))}>
          {decks.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>

        <label
          className="mt-5 flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          htmlFor="card-topic"
        >
          Topic tag <span className="text-red-500">*</span>
        </label>
        <input
          className="search-input mt-2 pl-4"
          id="card-topic"
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Audit Evidence"
          value={topic}
          required
        />
        {error && (
          <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="plus" onClick={save}>
            Create card
          </Button>
        </div>
      </div>
    </div>
  );
}
