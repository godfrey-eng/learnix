import { useState } from "react";
import type { QuizQuestionType } from "@/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

export function QuizEditor({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (type: QuizQuestionType) => void;
}) {
  const [type, setType] = useState<QuizQuestionType>("Multiple choice");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const types: QuizQuestionType[] = [
    "Multiple choice",
    "True or false",
    "Identification",
    "Matching",
  ];

  const save = () => {
    if (!prompt.trim() || !topic.trim()) {
      setError("Add a question and topic before saving.");
      return;
    }
    if (type !== "Matching" && !answer.trim()) {
      setError("Add the correct answer before saving.");
      return;
    }
    onSave(type);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-editor-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Quiz editor</p>
            <h2
              className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
              id="quiz-editor-title"
            >
              Add a question
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close editor" type="button">
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {types.map((item) => (
            <button
              className={`rounded-xl border px-3 py-3 text-[11px] font-bold transition ${
                type === item
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "border-slate-200 text-slate-500 hover:border-indigo-200 dark:border-slate-700 dark:text-slate-400"
              }`}
              key={item}
              onClick={() => {
                setType(item);
                setAnswer(item === "True or false" ? "True" : "");
                setError("");
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <label
          className="mt-6 block text-xs font-bold text-slate-600 dark:text-slate-300"
          htmlFor="quiz-prompt"
        >
          Question
        </label>
        <textarea
          className="editor-field mt-2 min-h-24"
          id="quiz-prompt"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Write a clear question"
          value={prompt}
          autoFocus
        />

        {type === "Multiple choice" && (
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Answer choices</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {["A", "B", "C", "D"].map((letter, index) => (
                <div className="relative" key={letter}>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                    {letter}
                  </span>
                  <input
                    className="search-input pl-10"
                    onChange={(event) => index === 0 && setAnswer(event.target.value)}
                    placeholder={index === 0 ? "Correct answer" : `Choice ${letter}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "True or false" && (
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Correct answer</p>
            <div className="mt-2 flex gap-2">
              {["True", "False"].map((value) => (
                <button
                  className={`flex-1 rounded-xl border p-3 text-sm font-bold ${
                    answer === value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "border-slate-200 text-slate-500 dark:border-slate-700"
                  }`}
                  key={value}
                  onClick={() => setAnswer(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === "Identification" && (
          <div className="mt-5">
            <label
              className="block text-xs font-bold text-slate-600 dark:text-slate-300"
              htmlFor="identification-answer"
            >
              Accepted answer
            </label>
            <input
              className="search-input mt-2 pl-4"
              id="identification-answer"
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Enter the exact answer"
              value={answer}
            />
          </div>
        )}

        {type === "Matching" && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Matching pairs</p>
              <span className="text-[10px] text-slate-400">Term → Match</span>
            </div>
            <div className="mt-2 space-y-2">
              {[1, 2, 3].map((row) => (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2" key={row}>
                  <input className="search-input pl-4" placeholder={`Term ${row}`} />
                  <Icon name="arrow" size={15} className="text-slate-300" />
                  <input className="search-input pl-4" placeholder={`Match ${row}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <label
          className="mt-5 block text-xs font-bold text-slate-600 dark:text-slate-300"
          htmlFor="quiz-topic"
        >
          Topic
        </label>
        <input
          className="search-input mt-2 pl-4"
          id="quiz-topic"
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Audit Evidence"
          value={topic}
        />

        <label
          className="mt-5 block text-xs font-bold text-slate-600 dark:text-slate-300"
          htmlFor="quiz-explanation"
        >
          Answer explanation
        </label>
        <textarea
          className="editor-field mt-2 min-h-20"
          id="quiz-explanation"
          placeholder="Explain why this answer is correct"
        />
        {error && (
          <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="plus" onClick={save}>
            Add question
          </Button>
        </div>
      </div>
    </div>
  );
}
