import { useEffect, useRef, useState } from "react";
import type { QuizSet, QuizQuestion, QuizAnswerResult } from "@/types";
import { quizQuestions } from "@/data/mock";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { useAppStore } from "@/store/useAppStore";
import { useStudyClock } from "@/lib/useStudyClock";

export function QuizSession({
  quiz,
  timed,
  onExit,
}: {
  quiz: QuizSet;
  timed: boolean;
  onExit: () => void;
}) {
  const [questions, setQuestions] = useState(quizQuestions);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<QuizAnswerResult[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; selected: string } | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(quiz.duration * 60);
  const addAttempts = useAppStore((s) => s.addAttempts);
  const logActivitySession = useAppStore((s) => s.logActivitySession);
  const takeSeconds = useStudyClock();
  const recordedCount = useRef(0);
  const runId = useRef(Math.random().toString(36).slice(2, 10));
  const subjectRef = useRef(quiz.subject);
  const finishedRef = useRef(false);
  finishedRef.current = finished;

  // Save every answer the moment it is given, so quitting midway still counts.
  useEffect(() => {
    if (results.length <= recordedCount.current) return;
    addAttempts(
      results.slice(recordedCount.current).map((r) => ({ questionId: r.questionId, topic: r.topic, correct: r.correct, quizId: quiz.id, runId: runId.current })),
    );
    recordedCount.current = results.length;
  }, [results, addAttempts, quiz.id]);

  // Log active study time when the quiz ends, or when the student leaves early.
  useEffect(() => {
    if (finished) logActivitySession(quiz.subject, "quiz", takeSeconds());
  }, [finished, logActivitySession, quiz.subject, takeSeconds]);
  useEffect(() => () => { if (!finishedRef.current) useAppStore.getState().logActivitySession(subjectRef.current, "quiz", takeSeconds()); }, [takeSeconds]);

  useEffect(() => {
    if (!timed || finished) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          setResults((current) => {
            const answeredIds = new Set(current.map((result) => result.questionId));
            const unanswered = questions
              .filter((item) => !answeredIds.has(item.id))
              .map((item) => ({
                questionId: item.id,
                topic: item.topic,
                correct: false,
              }));
            return [...current, ...unanswered];
          });
          setFinished(true);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finished, timed]);

  const question = questions[index];
  const submit = (selected: string) => {
    if (feedback) return;
    let correct = selected.trim().toLowerCase() === question.answer.toLowerCase();
    if (question.type === "Matching") {
      correct = (question.pairs || []).every((pair) => matches[pair.left] === pair.right);
    }
    setFeedback({ correct, selected });
    setResults((current) => [
      ...current,
      { questionId: question.id, topic: question.topic, correct },
    ]);
  };

  const next = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setFeedback(null);
    setTextAnswer("");
    setMatches({});
  };

  const resetWith = (nextQuestions: QuizQuestion[]) => {
    setQuestions(nextQuestions);
    setIndex(0);
    setResults([]);
    setFeedback(null);
    setTextAnswer("");
    setMatches({});
    setFinished(false);
    setSecondsLeft(quiz.duration * 60);
    recordedCount.current = 0;
    runId.current = Math.random().toString(36).slice(2, 10);
  };

  if (finished) {
    const score = results.filter((result) => result.correct).length;
    const percent = results.length ? Math.round((score / results.length) * 100) : 0;
    const topics = Array.from(new Set(results.map((result) => result.topic))).map((topic) => {
      const topicResults = results.filter((result) => result.topic === topic);
      return {
        topic,
        accuracy: Math.round(
          (topicResults.filter((result) => result.correct).length / topicResults.length) * 100,
        ),
      };
    });
    const missed = quizQuestions.filter((item) =>
      results.some((result) => result.questionId === item.id && !result.correct),
    );

    return (
      <main className="page-container">
        <section className="mx-auto max-w-3xl">
          <div className="card text-center sm:p-9">
            <div className="relative mx-auto h-36 w-36">
              <svg className="-rotate-90" viewBox="0 0 120 120">
                <circle
                  className="stroke-slate-100 dark:stroke-slate-800"
                  cx="60"
                  cy="60"
                  fill="none"
                  r="50"
                  strokeWidth="9"
                />
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="50"
                  stroke={percent >= 75 ? "#10B981" : "#F59E0B"}
                  strokeDasharray={314}
                  strokeDashoffset={314 * (1 - percent / 100)}
                  strokeLinecap="round"
                  strokeWidth="9"
                />
              </svg>
              <div className="absolute inset-0 grid place-content-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {percent}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Score
                </span>
              </div>
            </div>
            <p className="eyebrow mt-5">Quiz complete</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {score} of {results.length} correct
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {percent >= 75
                ? "Great work. Your review is paying off."
                : "Keep going. Review the weak topics and try again."}
            </p>
          </div>

          <div className="card mt-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="section-kicker">Performance</span>
                <h2 className="section-title mt-1">Accuracy by topic</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">{topics.length} topics</span>
            </div>
            <div className="mt-6 space-y-5">
              {topics.map((topic) => (
                <div key={topic.topic}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-200">{topic.topic}</span>
                    <span className={topic.accuracy >= 75 ? "text-emerald-600" : "text-orange-600"}>
                      {topic.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${topic.accuracy >= 75 ? "bg-emerald-500" : "bg-orange-500"}`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row">
              <Button variant="secondary" onClick={onExit}>
                Back to quizzes
              </Button>
              <Button
                icon="quiz"
                onClick={() => missed.length && resetWith(missed)}
                className={!missed.length ? "cursor-not-allowed opacity-50" : ""}
              >
                {missed.length
                  ? `Retake missed questions (${missed.length})`
                  : "No missed questions"}
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const matchOptions = question.pairs?.map((pair) => pair.right) || [];
  return (
    <main className="page-container max-w-5xl">
      <section className="flex items-center justify-between gap-4">
        <button
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400"
          onClick={onExit}
          type="button"
        >
          <Icon name="close" size={18} /> Exit quiz
        </button>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Question {index + 1} of {questions.length}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{quiz.title}</p>
        </div>
      </section>
      <div className="mt-5 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div
          className={`flex min-w-24 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${timed && secondsLeft < 300 ? "bg-red-50 text-red-600 dark:bg-red-950/50" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}
        >
          <Icon name="clock" size={15} />
          {timed
            ? `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`
            : "No timer"}
        </div>
      </div>

      <section className="card mx-auto mt-8 max-w-3xl sm:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            {question.topic}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {question.type}
          </span>
        </div>
        <h1 className="mt-6 text-xl font-extrabold leading-relaxed tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {question.prompt}
        </h1>

        {(question.type === "Multiple choice" || question.type === "True or false") && (
          <div
            className={`mt-7 grid gap-3 ${question.type === "True or false" ? "sm:grid-cols-2" : ""}`}
          >
            {question.choices?.map((choice, choiceIndex) => {
              const isCorrect = feedback && choice === question.answer;
              const isWrong = feedback && feedback.selected === choice && !feedback.correct;
              return (
                <button
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : isWrong
                        ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                  }`}
                  disabled={Boolean(feedback)}
                  key={choice}
                  onClick={() => submit(choice)}
                  type="button"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500 dark:bg-slate-800">
                    {String.fromCharCode(65 + choiceIndex)}
                  </span>
                  {choice}
                  {isCorrect && <Icon name="check" size={18} className="ml-auto" />}
                  {isWrong && <Icon name="close" size={18} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "Identification" && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              className="search-input pl-4"
              disabled={Boolean(feedback)}
              onChange={(event) => setTextAnswer(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" && textAnswer.trim() && submit(textAnswer)
              }
              placeholder="Type your answer"
              value={textAnswer}
            />
            <Button onClick={() => textAnswer.trim() && submit(textAnswer)}>Submit answer</Button>
          </div>
        )}

        {question.type === "Matching" && (
          <div className="mt-7 space-y-3">
            {question.pairs?.map((pair) => (
              <div
                className="grid gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950 sm:grid-cols-2 sm:items-center"
                key={pair.left}
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {pair.left}
                </span>
                <select
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900"
                  disabled={Boolean(feedback)}
                  onChange={(event) =>
                    setMatches((current) => ({ ...current, [pair.left]: event.target.value }))
                  }
                  value={matches[pair.left] || ""}
                >
                  <option value="">Choose a match</option>
                  {matchOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
            <Button
              className="mt-2 w-full"
              onClick={() =>
                Object.keys(matches).length === question.pairs?.length && submit("matched")
              }
            >
              Check matches
            </Button>
          </div>
        )}

        {feedback && (
          <div
            className={`mt-7 rounded-2xl border p-5 ${feedback.correct ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"}`}
          >
            <div
              className={`flex items-center gap-2 text-sm font-extrabold ${feedback.correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${feedback.correct ? "bg-emerald-500" : "bg-red-500"} text-white`}
              >
                <Icon name={feedback.correct ? "check" : "close"} size={15} />
              </span>
              {feedback.correct ? "Correct!" : "Not quite"}
            </div>
            {!feedback.correct && question.type !== "Matching" && (
              <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                Correct answer: {question.answer}
              </p>
            )}
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {question.explanation}
            </p>
            <div className="mt-4 flex justify-end">
              <Button icon="arrow" onClick={next}>
                {index === questions.length - 1 ? "See results" : "Next question"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
