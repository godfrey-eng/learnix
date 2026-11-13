import { useEffect, useState } from "react";
import type { Screen } from "@/types";
import { navItems } from "@/data/mock";
import { Icon } from "@/components/Icon";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { Library } from "@/features/library/Library";
import { Flashcards } from "@/features/flashcards/Flashcards";
import { Quizzes } from "@/features/quizzes/Quizzes";
import { Timer } from "@/features/timer/Timer";
import { Analytics } from "@/features/analytics/Analytics";
import { Plans } from "@/features/billing/Plans";
import { useTimerStore } from "@/store/useTimerStore";

function ComingSoon({ title }: { title: string }) {
  return (
    <main className="page-container">
      <p className="eyebrow">Coming next</p>
      <h1 className="page-title mt-2">{title}</h1>
      <p className="page-subtitle">This screen is planned after the core study loop. Reminders will start as PWA push notifications.</p>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("Dashboard");
  const [dark, setDark] = useState(() => localStorage.getItem("learnix-theme") === "dark");
  const [toast, setToast] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const tick = useTimerStore((s) => s.tick);

  // One global ticker keeps the study timer counting while you move between screens.
  useEffect(() => {
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("learnix-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const navigate = (next: Screen) => {
    setScreen(next);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const upgrade = () => navigate("Plans");

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-700 transition-colors dark:bg-slate-950 dark:text-slate-200">
      <Sidebar active={screen} onNavigate={navigate} />
      <div className="lg:pl-[252px]">
        <Topbar dark={dark} onToggleDark={() => setDark((value) => !value)} onNavigate={navigate} />
        {screen === "Dashboard" && <Dashboard onNavigate={navigate} />}
        {screen === "Library" && <Library notify={setToast} onUpgrade={upgrade} />}
        {screen === "Flashcards" && <Flashcards notify={setToast} onUpgrade={upgrade} />}
        {screen === "Quizzes" && <Quizzes notify={setToast} />}
        {screen === "Timer" && <Timer notify={setToast} />}
        {screen === "Analytics" && <Analytics notify={setToast} onUpgrade={upgrade} />}
        {screen === "Plans" && <Plans notify={setToast} />}
        {(screen === "Reminders" || screen === "Settings") && <ComingSoon title={screen} />}
      </div>
      <MobileNav active={screen} onNavigate={navigate} onMore={() => setMoreOpen(true)} />

      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-3 pb-20 backdrop-blur-sm lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="w-full rounded-3xl bg-white p-4 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">More tools</span>
              <button className="icon-button" onClick={() => setMoreOpen(false)} aria-label="Close menu" type="button"><Icon name="close" size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...navItems.slice(4), { label: "Plans", icon: "trend" as const }].map((item) => (
                <button className="flex items-center gap-3 rounded-xl p-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" key={item.label} onClick={() => navigate(item.label as Screen)} type="button">
                  <Icon name={item.icon} size={19} className="text-indigo-500" /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl dark:bg-white dark:text-slate-900 lg:bottom-7">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white"><Icon name="check" size={13} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
