import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { quizRunStats } from "@/lib/stats";
import type { QuizSet } from "@/types";
import { quizSets } from "@/data/mock";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { QuizEditor } from "@/features/quizzes/QuizEditor";
import { QuizSession } from "@/features/quizzes/QuizSession";

export function Quizzes({ notify }: { notify: (message: string) => void }) {
  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [timed, setTimed] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const liveAttempts = useAppStore((s) => s.attempts);

  if (activeQuiz) {
    return <QuizSession quiz={activeQuiz} timed={timed} onExit={() => setActiveQuiz(null)} />;
  }

  return (
    <main className="page-container">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Test your knowledge</p>
          <h1 className="page-title mt-2">Quizzes</h1>
          <p className="page-subtitle">Practice under pressure and learn from every answer.</p>
        </div>
        <Button icon="plus" onClick={() => setEditorOpen(true)}>
          Create quiz
        </Button>
      </section>

      <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Icon name="timer" size={21} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Timed quiz mode</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Simulate board-exam pressure with a countdown.
            </p>
          </div>
        </div>
        <button
          className={`relative h-7 w-12 rounded-full transition ${timed ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
          onClick={() => setTimed((value) => !value)}
          role="switch"
          aria-checked={timed}
          type="button"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${timed ? "left-6" : "left-1"}`}
          />
        </button>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="section-kicker">Quiz library</span>
            <h2 className="section-title mt-1">Practice sets</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">{quizSets.length} quizzes</span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {quizSets.map((quiz) => (
            <article className="card" key={quiz.id}>
              <div className="flex items-start gap-4">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: quiz.color }}
                >
                  <Icon name="quiz" size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{quiz.subject}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  Best {Math.max(quiz.bestScore, quizRunStats(liveAttempts, quiz.id).best)}%
                </span>
              </div>
              <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3 text-center dark:divide-slate-800 dark:bg-slate-950">
                <div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {quiz.questions}
                  </div>
                  <div className="text-[9px] font-bold uppercase text-slate-400">Questions</div>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {quiz.duration}m
                  </div>
                  <div className="text-[9px] font-bold uppercase text-slate-400">Time</div>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {quiz.attempts + quizRunStats(liveAttempts, quiz.id).attempts}
                  </div>
                  <div className="text-[9px] font-bold uppercase text-slate-400">Attempts</div>
                </div>
              </div>
              <button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 py-3 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950"
                onClick={() => setActiveQuiz(quiz)}
                type="button"
              >
                Start {timed ? "timed" : "practice"} quiz <Icon name="arrow" size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {editorOpen && (
        <QuizEditor
          onClose={() => setEditorOpen(false)}
          onSave={(type) => {
            setEditorOpen(false);
            notify(`${type} question added to your new quiz`);
          }}
        />
      )}
    </main>
  );
}
