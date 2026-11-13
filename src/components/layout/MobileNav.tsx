import type { Screen, NavItem } from "@/types";
import { Icon } from "@/components/Icon";

export function MobileNav({
  active,
  onNavigate,
  onMore,
}: {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  onMore: () => void;
}) {
  const items: NavItem[] = [
    { label: "Dashboard", icon: "dashboard" },
    { label: "Library", icon: "book" },
    { label: "Flashcards", icon: "cards" },
    { label: "Quizzes", icon: "quiz" },
    { label: "More", icon: "more" },
  ];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const selected = item.label === active;
        return (
          <button
            className={`mobile-nav-item ${selected ? "text-indigo-600 dark:text-indigo-400" : ""}`}
            key={item.label}
            onClick={() =>
              item.label === "More"
                ? onMore()
                : (item.label === "Dashboard" ||
                    item.label === "Library" ||
                    item.label === "Flashcards" ||
                    item.label === "Quizzes") &&
                  onNavigate(item.label as Screen)
            }
            type="button"
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
            {selected && <span className="absolute top-0 h-0.5 w-7 rounded-full bg-indigo-600" />}
          </button>
        );
      })}
    </nav>
  );
}
