import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { IconName, Screen } from "@/types";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { useAppStore, selectDecks } from "@/store/useAppStore";
import { useTimerStore } from "@/store/useTimerStore";
import { dayKey, formatDuration, minutesByDay, streak, topicAccuracy } from "@/lib/stats";

export function ProgressRing({ done, goal }: { done: number; goal: number }) {
  const progress = Math.min(1, done / goal);
  const circumference = 2 * Math.PI * 49;
  return (
    <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
      <svg className="-rotate-90" viewBox="0 0 120 120">
        <circle className="stroke-slate-100 dark:stroke-slate-800" cx="60" cy="60" fill="none" r="49" strokeWidth="9" />
        <circle cx="60" cy="60" fill="none" r="49" stroke="#4F46E5" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round" strokeWidth="9" />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{done}</span>
        <span className="text-[11px] font-medium text-slate-400">of {goal} min</span>
      </div>
    </div>
  );
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export function Dashboard({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { sessions, attempts, reviews, decks, cards, goal } = useAppStore(
    useShallow((s) => ({ sessions: s.sessions, attempts: s.attempts, reviews: s.reviews, decks: s.decks, cards: s.cards, goal: s.dailyGoalMinutes })),
  );
  const liveFocusMs = useTimerStore((s) => s.focusMs);

  const week = useMemo(() => minutesByDay(sessions, 14), [sessions]);
  const thisWeek = week.slice(7), lastWeek = week.slice(0, 7);
  const weekTotal = thisWeek.reduce((n, d) => n + d.minutes, 0);
  const lastTotal = lastWeek.reduce((n, d) => n + d.minutes, 0);
  const delta = lastTotal ? Math.round(((weekTotal - lastTotal) / lastTotal) * 100) : null;
  const todayMinutes = (thisWeek[6]?.minutes ?? 0) + Math.floor(liveFocusMs / 60000);
  const maxBar = Math.max(60, ...thisWeek.map((d) => d.minutes));
  const currentStreak = streak(sessions, goal);
  const best = useMemo(() => {
    let b = 0, run = 0;
    minutesByDay(sessions, 120).forEach((d) => { run = d.minutes >= goal ? run + 1 : 0; b = Math.max(b, run); });
    return b;
  }, [sessions, goal]);
  const topics = useMemo(() => topicAccuracy(attempts, reviews).slice(0, 3), [attempts, reviews]);
  const deckList = selectDecks({ decks, cards, reviews });
  const totalDue = deckList.reduce((n, d) => n + d.due, 0);
  const dueDecks = deckList.filter((d) => d.due > 0).map((d) => d.subject);
  const dueSubjects = [...new Set(dueDecks)].slice(0, 2).join(" & ");
  const remaining = Math.max(0, goal - todayMinutes);

  const actions: { label: string; icon: IconName; to: Screen; color: string }[] = [
    { label: "Focus timer", icon: "timer", to: "Timer", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300" },
    { label: "Flashcards", icon: "cards", to: "Flashcards", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300" },
    { label: "Quizzes", icon: "quiz", to: "Quizzes", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300" },
  ];

  return (
    <main className="page-container">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="page-title mt-2">{greeting()}, Miguel.</h1>
          <p className="page-subtitle">A little progress every day adds up. Let’s get started.</p>
        </div>
        <Button variant="secondary" icon="analytics" onClick={() => onNavigate("Analytics")}>View analytics</Button>
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="card flex flex-col justify-between gap-5 overflow-hidden sm:flex-row sm:items-center">
          <div className="max-w-sm">
            <span className="section-kicker">Today’s goal</span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{remaining === 0 ? "Goal reached. Nice work." : todayMinutes === 0 ? "Start your first session" : "Keep going"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {remaining === 0 ? "Anything more today is a bonus." : `${remaining} more focused minute${remaining === 1 ? "" : "s"} to hit your daily goal.`}
            </p>
            {delta !== null && (
              <div className={`mt-4 flex items-center gap-2 text-xs font-semibold ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600"}`}>
                <Icon name="trend" size={16} /> {Math.abs(delta)}% {delta >= 0 ? "ahead of" : "behind"} last week
              </div>
            )}
          </div>
          <ProgressRing done={todayMinutes} goal={goal} />
        </div>

        <div className="card relative overflow-hidden bg-gradient-to-br from-indigo-600 to-[#6d5dea] text-white">
          <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex h-full flex-col justify-between gap-7">
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15"><Icon name="cards" size={23} /></div>
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-950">Due today</span>
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight">{totalDue} card{totalDue === 1 ? "" : "s"}</div>
              <p className="mt-1 text-sm text-indigo-100">{totalDue ? dueSubjects : "You’re all caught up"}</p>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50" onClick={() => onNavigate("Flashcards")} type="button">
              {totalDue ? "Start review" : "Open flashcards"} <Icon name="arrow" size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between">
            <div><span className="section-kicker">Consistency</span><h2 className="section-title mt-1">{currentStreak} day study streak</h2></div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"><Icon name="trend" size={20} /></div>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {thisWeek.map((d, i) => {
              const hit = d.minutes >= goal, today = i === 6;
              return (
                <div className="text-center" key={d.key}>
                  <div className="mb-2 text-[10px] font-bold text-slate-400">{d.date.toLocaleDateString(undefined, { weekday: "narrow" })}</div>
                  <div className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-xs font-bold sm:h-10 sm:w-10 ${today ? "bg-amber-400 text-amber-950 ring-4 ring-amber-100 dark:ring-amber-950" : hit ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                    {today ? d.date.getDate() : hit ? <Icon name="check" size={15} /> : "·"}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-center text-xs text-slate-400">Best streak: <span className="font-bold text-slate-600 dark:text-slate-300">{best} days</span> · a day counts at {goal}+ minutes</p>
        </div>

        <div className="card">
          <span className="section-kicker">Quick start</span>
          <h2 className="section-title mt-1">What would you like to do?</h2>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {actions.map((a) => (
              <button className="quick-action" key={a.label} onClick={() => onNavigate(a.to)} type="button">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${a.color}`}><Icon name={a.icon} size={20} /></span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 pb-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="card">
          <div className="flex items-start justify-between">
            <div><span className="section-kicker">Performance</span><h2 className="section-title mt-1">Topics to revisit</h2></div>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400" onClick={() => onNavigate("Analytics")} type="button">See all</button>
          </div>
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {topics.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Answer a few quiz questions or review cards to see where you need work.</p>}
            {topics.map((t) => (
              <div className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0" key={t.topic}>
                <div className={`h-9 w-1 rounded-full ${t.status === "Strong" ? "bg-emerald-500" : t.status === "Weak" ? "bg-red-500" : "bg-orange-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{t.topic}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{t.accuracy}% accuracy · {t.attempts} answers</div>
                </div>
                <span className={`status status-${t.status.toLowerCase().replace(" ", "-")}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div><span className="section-kicker">Study time</span><h2 className="section-title mt-1">This week</h2></div>
            <div className="text-right">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatDuration(weekTotal * 60)}</div>
              {delta !== null && <div className={`text-[10px] font-bold ${delta >= 0 ? "text-emerald-600" : "text-orange-600"}`}>{delta >= 0 ? "+" : ""}{delta}% vs last week</div>}
            </div>
          </div>
          <div className="mt-7 flex h-32 items-end justify-between gap-2">
            {thisWeek.map((bar) => (
              <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={bar.key}>
                <div className="group relative flex h-full w-full items-end justify-center">
                  <div className={`w-full max-w-7 rounded-t-lg transition-all hover:opacity-80 ${bar.key === dayKey(new Date()) ? "bg-amber-400" : "bg-indigo-500/85"}`} style={{ height: `${(bar.minutes / maxBar) * 100}%`, minHeight: bar.minutes ? 3 : 0 }}>
                    <span className="pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[9px] font-bold text-slate-500 group-hover:block">{bar.minutes}m</span>
                  </div>
                </div>
                <span className="text-[9px] font-semibold text-slate-400">{bar.date.toLocaleDateString(undefined, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
