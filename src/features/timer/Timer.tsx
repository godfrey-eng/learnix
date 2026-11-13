import { useState } from "react";
import type { Activity } from "@/types";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useAppStore } from "@/store/useAppStore";
import { useTimerStore, type TimerSummary } from "@/store/useTimerStore";
import { dayKey, formatDuration } from "@/lib/stats";

const PRESETS = [{ label: "25 / 5", focus: 25, rest: 5 }, { label: "50 / 10", focus: 50, rest: 10 }, { label: "15 / 3", focus: 15, rest: 3 }];
const ACTIVITIES: { value: Activity; label: string }[] = [{ value: "reading", label: "Reading" }, { value: "flashcards", label: "Flashcards" }, { value: "quiz", label: "Quiz practice" }];
const clock = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

export function Timer({ notify }: { notify: (m: string) => void }) {
  const t = useTimerStore();
  const { subjects, sessions, dailyGoalMinutes, logSession } = useAppStore();
  const [summary, setSummary] = useState<TimerSummary | "short" | null>(null);

  const target = (t.phase === "focus" ? t.focusMinutes : t.breakMinutes) * 60_000;
  const remaining = target - t.phaseMs;
  const progress = t.active ? Math.min(1, t.phaseMs / target) : 0;
  const c = 2 * Math.PI * 110;

  const today = sessions.filter((s) => dayKey(s.startedAt) === dayKey(new Date()));
  const todaySecs = today.reduce((n, s) => n + s.focusSeconds, 0) + Math.round(t.focusMs / 1000);

  const finish = () => {
    const result = t.end();
    if (!result) return setSummary("short");
    logSession(result);
    setSummary(result);
    notify("Session saved");
  };

  return (
    <main className="page-container">
      <section>
        <p className="eyebrow">Focus</p>
        <h1 className="page-title mt-2">Study timer</h1>
        <p className="page-subtitle">Only active focus time is counted. Breaks and idle time are not.</p>
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="card flex flex-col items-center gap-6 py-8">
          <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${t.phase === "focus" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"}`}>
            {t.active ? (t.phase === "focus" ? "Focus" : "Break") : "Ready"}
          </span>
          <div className="relative h-64 w-64 sm:h-72 sm:w-72">
            <svg className="-rotate-90" viewBox="0 0 240 240">
              <circle className="stroke-slate-100 dark:stroke-slate-800" cx="120" cy="120" r="110" fill="none" strokeWidth="10" />
              <circle cx="120" cy="120" r="110" fill="none" strokeWidth="10" strokeLinecap="round"
                stroke={t.phase === "focus" ? "#4F46E5" : "#10B981"} strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <span className="text-5xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white" aria-live="off">
                {clock(t.active ? remaining : t.focusMinutes * 60_000)}
              </span>
              <span className="mt-1 text-xs font-semibold text-slate-400">{t.active ? `${t.subject} · cycle ${t.cycles + 1}` : "Choose a subject to begin"}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {!t.active && <Button icon="timer" onClick={t.start}>Start session</Button>}
            {t.active && t.running && <Button variant="secondary" onClick={t.pause}>Pause</Button>}
            {t.active && !t.running && <Button onClick={t.resume}>Resume</Button>}
            {t.active && <Button variant="secondary" onClick={t.skipPhase}>Skip {t.phase === "focus" ? "to break" : "break"}</Button>}
            {t.active && <Button variant="ghost" onClick={finish}>End session</Button>}
          </div>
          {t.active && !t.running && <p className="text-xs font-semibold text-amber-600">Paused. This time is not being counted.</p>}
        </div>

        <div className="flex flex-col gap-5">
          <div className="card">
            <span className="section-kicker">Session setup</span>
            <label className="mt-4 block text-xs font-bold text-slate-500" htmlFor="t-subject">Subject</label>
            <select id="t-subject" className="editor-field mt-2" disabled={t.active} value={t.subject} onChange={(e) => t.configure({ subject: e.target.value })}>
              {subjects.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
            <label className="mt-4 block text-xs font-bold text-slate-500" htmlFor="t-activity">Activity</label>
            <select id="t-activity" className="editor-field mt-2" disabled={t.active} value={t.activity} onChange={(e) => t.configure({ activity: e.target.value as Activity })}>
              {ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <p className="mt-4 text-xs font-bold text-slate-500">Focus / break (minutes)</p>
            <div className="mt-2 flex gap-2">
              {PRESETS.map((p) => {
                const on = t.focusMinutes === p.focus && t.breakMinutes === p.rest;
                return (
                  <button key={p.label} disabled={t.active} type="button" onClick={() => t.configure({ focusMinutes: p.focus, breakMinutes: p.rest })}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${on ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "border-slate-200 text-slate-500 dark:border-slate-700"}`}>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="card">
            <span className="section-kicker">Today</span>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatDuration(todaySecs)}</div>
            <p className="mt-1 text-xs text-slate-400">of {dailyGoalMinutes} min goal · {today.length} saved session{today.length === 1 ? "" : "s"}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (todaySecs / 60 / dailyGoalMinutes) * 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {summary && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={() => setSummary(null)}>
          <div className="card w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50"><Icon name="check" size={22} /></div>
            {summary === "short" ? (
              <>
                <h2 className="section-title mt-4">Session too short to count</h2>
                <p className="mt-2 text-sm text-slate-500">Sessions under 1 minute of focus are discarded so your statistics stay honest.</p>
              </>
            ) : (
              <>
                <h2 className="section-title mt-4">Session saved</h2>
                <p className="mt-1 text-sm text-slate-500">{summary.subject}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div><div className="text-lg font-extrabold text-slate-900 dark:text-white">{formatDuration(summary.focusSeconds)}</div><div className="text-[10px] font-semibold text-slate-400">Focus</div></div>
                  <div><div className="text-lg font-extrabold text-slate-900 dark:text-white">{formatDuration(summary.breakSeconds)}</div><div className="text-[10px] font-semibold text-slate-400">Break</div></div>
                  <div><div className="text-lg font-extrabold text-slate-900 dark:text-white">{summary.cycles}</div><div className="text-[10px] font-semibold text-slate-400">Cycles</div></div>
                </div>
              </>
            )}
            <div className="mt-6"><Button onClick={() => setSummary(null)}>Done</Button></div>
          </div>
        </div>
      )}
    </main>
  );
}
