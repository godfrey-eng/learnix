import { useAppStore } from "@/store/useAppStore";
import { streak } from "@/lib/stats";
import type { Screen } from "@/types";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

export function Topbar({ dark, onToggleDark, onNavigate }: { dark: boolean; onToggleDark: () => void; onNavigate: (screen: Screen) => void }) {
  const plan = useAppStore((s) => s.plan);
  const goal = useAppStore((s) => s.dailyGoalMinutes);
  const sessions = useAppStore((s) => s.sessions);
  const days = streak(sessions, goal);
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-[#f7f8fc]/90 px-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-8 lg:px-10">
      <div className="lg:hidden">
        <Logo />
      </div>
      <div className="hidden items-center gap-2 text-sm text-slate-500 dark:text-slate-400 lg:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Ready for a focused session
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button onClick={() => onNavigate("Plans")} type="button" className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 sm:block">
          {plan === "plus" ? "Plus plan" : "Free plan"}
        </button>
        <div className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 sm:flex">
          <span className="text-base">♢</span> {days} day streak
        </div>
        <button
          className="icon-button"
          onClick={onToggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          type="button"
        >
          <Icon name={dark ? "sun" : "moon"} size={19} />
        </button>
        <button
          className="icon-button relative hidden sm:grid"
          aria-label="Notifications"
          type="button"
        >
          <Icon name="bell" size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-amber-500 dark:border-slate-900" />
        </button>
        <button
          className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          type="button"
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            MA
          </div>
          <Icon name="chevron" size={14} className="hidden rotate-90 text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}
