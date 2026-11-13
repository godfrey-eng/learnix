import type { Screen } from "@/types";
import { navItems } from "@/data/mock";
import { Icon } from "@/components/Icon";
import { useAppStore } from "@/store/useAppStore";
import { Logo } from "@/components/Logo";

export function Sidebar({ active, onNavigate }: { active: Screen; onNavigate: (screen: Screen) => void }) {
  const plan = useAppStore((s) => s.plan);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-slate-200/80 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-9 flex flex-1 flex-col gap-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const selected = item.label === active;
          return (
            <button
              className={`nav-item ${selected ? "nav-item-active" : ""}`}
              key={item.label}
              onClick={() => onNavigate(item.label as Screen)}
              type="button"
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Reminders" && (
                <span className="ml-auto h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </nav>
      {plan === "free" && <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white shadow-lg shadow-indigo-700/15">
        <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-white/15">
          <Icon name="trend" size={17} />
        </div>
        <p className="text-sm font-bold">Unlock your full potential</p>
        <p className="mt-1 text-[11px] leading-relaxed text-indigo-100">
          Unlimited folders, quizzes, and smarter insights.
        </p>
        <button
          onClick={() => onNavigate("Plans")}
          className="mt-3 w-full rounded-xl bg-white py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"
          type="button"
        >
          Upgrade to Plus
        </button>
      </div>}
    </aside>
  );
}
