import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { useAppStore } from "@/store/useAppStore";
import { LIMITS } from "@/lib/plan";

const ROWS: [string, string, string][] = [
  ["Subject folders", "5", "Unlimited"],
  ["Flashcard decks", "10", "Unlimited"],
  ["File uploads", "20 files · PDF only", "10 GB · PDF, DOCX, PPTX"],
  ["Spaced repetition", "Standard scheduling", "Adaptive, weak topics first"],
  ["Daily card reviews", "Unlimited", "Unlimited"],
  ["Study timer", "Pomodoro", "Pomodoro + planned vs actual"],
  ["Study history", "7 days", "Unlimited"],
  ["Analytics", "Day and week", "Day, week, month, retention"],
  ["Insights", "Weakest topic", "Weak topics, best study time, session trends"],
  ["Export", "—", "CSV"],
];

export function Plans({ notify }: { notify: (m: string) => void }) {
  const { plan, setPlan, subjects, decks } = useAppStore();
  const [annual, setAnnual] = useState(false);
  const deckCount = decks.length;
  const price = annual ? "₱990" : "₱99";
  const meters: [string, number, number][] = [["Subject folders", subjects.length, LIMITS.free.subjects], ["Flashcard decks", deckCount, LIMITS.free.decks]];

  return (
    <main className="page-container">
      <section className="text-center">
        <p className="eyebrow">Plans</p>
        <h1 className="page-title mt-2">Study free. Upgrade for depth.</h1>
        <p className="page-subtitle mx-auto max-w-xl">Every basic study tool stays free. Plus adds capacity, adaptive scheduling and deeper analytics.</p>
        <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          {[false, true].map((a) => (
            <button key={String(a)} type="button" onClick={() => setAnnual(a)} className={`rounded-lg px-4 py-1.5 text-xs font-bold ${annual === a ? "bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-indigo-300" : "text-slate-500"}`}>
              {a ? "Annual · 2 months free" : "Monthly"}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
        {([["free", "Free", "₱0", "forever"], ["plus", "Plus", price, annual ? "/ year" : "/ month"]] as const).map(([id, name, p, per]) => (
          <div key={id} className={`card ${id === "plus" ? "ring-2 ring-indigo-500" : ""}`}>
            <div className="flex items-center justify-between"><h2 className="section-title">{name}</h2>{plan === id && <span className="status status-strong">Current plan</span>}</div>
            <div className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{p}<span className="ml-1 text-sm font-semibold text-slate-400">{per}</span></div>
            <ul className="mt-5 space-y-2.5 text-sm">
              {ROWS.map(([label, free, plus]) => (
                <li key={label} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span><span className="font-semibold">{label}:</span> {id === "free" ? free : plus}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {plan === id ? <Button variant="secondary" className="w-full">You’re on {name}</Button>
                : <Button className="w-full" onClick={() => { setPlan(id); notify(id === "plus" ? "Plus unlocked (test mode)" : "Switched to Free"); }}>{id === "plus" ? "Upgrade to Plus" : "Switch to Free"}</Button>}
            </div>
          </div>
        ))}
      </section>
      <p className="mx-auto mt-4 max-w-4xl text-center text-xs text-slate-400">Payments aren’t connected yet. Upgrading here switches the plan on this device for testing.</p>

      {plan === "free" && (
        <section className="card mx-auto mt-8 max-w-4xl">
          <span className="section-kicker">Your usage</span>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {meters.map(([label, used, max]) => (
              <div key={label}>
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200"><span>{label}</span><span>{used} of {max}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${used >= max ? "bg-red-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(100, (used / max) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
