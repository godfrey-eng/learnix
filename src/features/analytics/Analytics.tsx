import { useMemo, useState } from "react";
import type { Period } from "@/types";
import { Button } from "@/components/Button";
import { Locked } from "@/components/Locked";
import { useAppStore } from "@/store/useAppStore";
import { limitsFor } from "@/lib/plan";
import { daysAgo, formatDuration, minutesByDay, minutesBySubject, retentionRate, streak, topicAccuracy, dayKey } from "@/lib/stats";

const PALETTE = ["#4F46E5", "#0D9488", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9"];
const PERIODS: Period[] = ["Day", "Week", "Month"];

function Donut({ data }: { data: { subject: string; minutes: number }[] }) {
  const total = data.reduce((n, d) => n + d.minutes, 0) || 1;
  const r = 52, c = 2 * Math.PI * r; let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90" role="img" aria-label="Time per subject">
        <circle cx="70" cy="70" r={r} fill="none" strokeWidth="16" className="stroke-slate-100 dark:stroke-slate-800" />
        {data.map((d, i) => {
          const len = (d.minutes / total) * c; const el = (
            <circle key={d.subject} cx="70" cy="70" r={r} fill="none" strokeWidth="16" stroke={PALETTE[i % PALETTE.length]} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
          ); offset += len; return el;
        })}
      </svg>
      <ul className="w-full space-y-2 text-xs">
        {data.map((d, i) => (
          <li key={d.subject} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1 truncate font-semibold text-slate-700 dark:text-slate-200">{d.subject}</span>
            <span className="text-slate-400">{formatDuration(d.minutes * 60)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Analytics({ onUpgrade, notify }: { onUpgrade: () => void; notify: (m: string) => void }) {
  const { plan, sessions, attempts, reviews, dailyGoalMinutes, clearDemoData } = useAppStore();
  const lim = limitsFor(plan);
  const [period, setPeriod] = useState<Period>("Week");
  const monthLocked = period === "Month" && !lim.monthView;

  const v = useMemo(() => {
    const cutoff = lim.historyDays === Infinity ? new Date(0) : daysAgo(lim.historyDays - 1);
    const days = period === "Day" ? 1 : period === "Week" ? 7 : 30;
    const from = monthLocked ? daysAgo(29) : new Date(Math.max(daysAgo(days - 1).getTime(), monthLocked ? 0 : cutoff.getTime()));
    const base = monthLocked ? sessions : sessions.filter((s) => new Date(s.startedAt) >= cutoff);
    const inP = base.filter((s) => new Date(s.startedAt) >= from);
    const att = (monthLocked ? attempts : attempts.filter((a) => new Date(a.answeredAt) >= cutoff)).filter((a) => new Date(a.answeredAt) >= from);
    const rev = (monthLocked ? reviews : reviews.filter((r) => new Date(r.reviewedAt) >= cutoff)).filter((r) => new Date(r.reviewedAt) >= from);
    const total = inP.reduce((n, s) => n + s.focusSeconds, 0);
    const answered = att.length + rev.length;
    const right = att.filter((a) => a.correct).length + rev.filter((r) => r.rating === "Good" || r.rating === "Easy").length;
    return { days, inP, att, rev, total, accuracy: answered ? Math.round((right / answered) * 100) : null, bars: minutesByDay(base, days), subjects: minutesBySubject(inP), topics: topicAccuracy(att, rev).slice(0, 6) };
  }, [period, sessions, attempts, reviews, lim.historyDays, monthLocked]);

  const cutoff = lim.historyDays === Infinity ? null : daysAgo(lim.historyDays - 1);
  const heat = useMemo(() => minutesByDay(sessions, 84), [sessions]);
  const maxBar = Math.max(1, ...v.bars.map((b) => b.minutes));
  const hasDemo = sessions.some((s) => s.demo) || attempts.some((a) => a.demo) || reviews.some((r) => r.demo);

  const weak = v.topics.find((t) => t.status === "Weak") ?? v.topics[0];
  const slots = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  v.inP.forEach((s) => { const h = new Date(s.startedAt).getHours(); slots[h >= 5 && h < 12 ? "Morning" : h < 17 && h >= 12 ? "Afternoon" : h >= 17 && h < 22 ? "Evening" : "Night"] += s.focusSeconds; });
  const best = Object.entries(slots).sort((a, b) => b[1] - a[1])[0];
  const avgSession = v.inP.length ? Math.round(v.total / v.inP.length) : 0;

  const exportCsv = () => {
    if (!lim.export) return onUpgrade();
    const rows = ["date,subject,activity,focus_minutes", ...sessions.map((s) => `${dayKey(s.startedAt)},${s.subject},${s.activity},${(s.focusSeconds / 60).toFixed(1)}`)];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    a.download = "learnix-study-sessions.csv"; a.click(); notify("CSV downloaded");
  };

  const retention = retentionRate(reviews);
  const dist = (["Again", "Hard", "Good", "Easy"] as const).map((r) => ({ r, n: reviews.filter((x) => x.rating === r).length }));
  const distMax = Math.max(1, ...dist.map((d) => d.n));

  const body = (
    <>
      <section className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ["Study time", formatDuration(v.total)],
          ["Sessions", String(v.inP.length)],
          ["Accuracy", v.accuracy === null ? "—" : `${v.accuracy}%`],
          ["Streak", `${streak(sessions, dailyGoalMinutes)} days`],
        ].map(([k, val]) => (
          <div className="card" key={k}><span className="section-kicker">{k}</span><div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{val}</div></div>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <span className="section-kicker">Study time</span>
          <h2 className="section-title mt-1">{period === "Day" ? "Today’s sessions" : `Minutes per day · last ${v.days} days`}</h2>
          {period === "Day" ? (
            <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {v.inP.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No sessions yet today. Start the timer to log one.</li>}
              {v.inP.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{s.subject}<span className="ml-2 text-xs font-medium capitalize text-slate-400">{s.activity}</span></span>
                  <span className="text-slate-500">{formatDuration(s.focusSeconds)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex h-44 items-end gap-1">
              {v.bars.map((b) => (
                <div key={b.key} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${b.date.toLocaleDateString()}: ${b.minutes} min`}>
                  <div className="w-full max-w-7 rounded-t-md bg-indigo-500/85 transition group-hover:opacity-80" style={{ height: `${(b.minutes / maxBar) * 100}%`, minHeight: b.minutes ? 3 : 0 }} />
                  {v.days <= 7 && <span className="text-[9px] font-semibold text-slate-400">{b.date.toLocaleDateString(undefined, { weekday: "short" })}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card"><span className="section-kicker">By subject</span><h2 className="section-title mb-5 mt-1">Where your time goes</h2>
          {v.subjects.length ? <Donut data={v.subjects} /> : <p className="py-6 text-center text-sm text-slate-400">No data for this period.</p>}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <span className="section-kicker">Mastery</span><h2 className="section-title mt-1">Accuracy by topic</h2>
          <div className="mt-5 space-y-4">
            {v.topics.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Answer at least 3 questions or cards in a topic to see its status.</p>}
            {v.topics.map((t) => (
              <div key={t.topic}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{t.topic}</span>
                  <span className="flex items-center gap-2"><span className="text-xs text-slate-400">{t.accuracy}% · {t.attempts} answers</span><span className={`status status-${t.status.toLowerCase().replace(" ", "-")}`}>{t.status}</span></span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full ${t.status === "Strong" ? "bg-emerald-500" : t.status === "Weak" ? "bg-red-500" : "bg-orange-500"}`} style={{ width: `${t.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <span className="section-kicker">Insights</span><h2 className="section-title mt-1">What the numbers say</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <li>{weak ? `${weak.topic} is your ${weak.status === "Strong" ? "lowest" : weak.status.toLowerCase()} topic at ${weak.accuracy}%. Give it 30 minutes this week.` : "Not enough answers yet to find weak topics."}</li>
            {lim.retention ? (
              <>
                <li>{best && best[1] > 0 ? `You study most in the ${best[0].toLowerCase()} (${formatDuration(best[1])}).` : "No study pattern yet."}</li>
                <li>Average session: {formatDuration(avgSession)}. Daily goal: {dailyGoalMinutes} min.</li>
              </>
            ) : (
              <li className="text-slate-400">Study-time patterns and session averages are part of Plus.</li>
            )}
          </ul>
        </div>
      </section>
    </>
  );

  return (
    <main className="page-container">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Progress</p><h1 className="page-title mt-2">Analytics</h1><p className="page-subtitle">Study time and learning performance, measured from your real sessions.</p></div>

      </section>

      <div className="mt-6 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900" role="tablist">
        {PERIODS.map((p) => (
          <button key={p} role="tab" aria-selected={period === p} onClick={() => setPeriod(p)} type="button"
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${period === p ? "bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-indigo-300" : "text-slate-500"}`}>
            {p}{p === "Month" && !lim.monthView ? " 🔒" : ""}
          </button>
        ))}
      </div>

      <Locked locked={monthLocked} label="Monthly view is part of Plus" onUpgrade={onUpgrade}>{body}</Locked>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <span className="section-kicker">Consistency</span><h2 className="section-title mt-1">Last 12 weeks</h2>
          <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
            {heat.map((d) => {
              const locked = cutoff && d.date < cutoff;
              const ratio = d.minutes / dailyGoalMinutes;
              const tone = ratio === 0 ? "bg-slate-100 dark:bg-slate-800" : ratio < 0.5 ? "bg-indigo-200" : ratio < 1 ? "bg-indigo-400" : "bg-indigo-600";
              return <div key={d.key} title={locked ? "Plus unlocks full history" : `${d.date.toLocaleDateString()}: ${d.minutes} min`} className={`h-4 w-4 rounded-[4px] ${locked ? "bg-slate-100 opacity-40 dark:bg-slate-800" : tone}`} />;
            })}
          </div>
          {cutoff && <p className="mt-3 text-[11px] text-slate-400">Free keeps {lim.historyDays} days of history. <button className="font-bold text-indigo-600" onClick={onUpgrade} type="button">See Plus</button></p>}
        </div>
        <div className="card">
          <span className="section-kicker">Retention</span><h2 className="section-title mt-1">Flashcard memory</h2>
          <div className="mt-4">
            <Locked locked={!lim.retention} label="Retention analytics are part of Plus" onUpgrade={onUpgrade}>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{retention === null ? "—" : `${retention}%`}</div>
              <p className="mt-1 text-xs text-slate-400">of repeat reviews rated Good or Easy</p>
              <div className="mt-4 space-y-2">
                {dist.map((d) => (
                  <div key={d.r} className="flex items-center gap-3 text-xs"><span className="w-10 font-semibold text-slate-500">{d.r}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${(d.n / distMax) * 100}%` }} /></div>
                    <span className="w-6 text-right text-slate-400">{d.n}</span></div>
                ))}
              </div>
            </Locked>
          </div>
        </div>
      </section>
    </main>
  );
}
