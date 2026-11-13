import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

/** Blurs its children and shows an upgrade prompt when `locked` is true. */
export function Locked({ locked, label, onUpgrade, children }: { locked: boolean; label: string; onUpgrade: () => void; children: ReactNode }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div aria-hidden className="pointer-events-none select-none opacity-60 blur-[5px]">{children}</div>
      <div className="absolute inset-0 grid place-content-center gap-3 bg-white/55 p-4 text-center dark:bg-slate-950/55">
        <p className="text-sm font-extrabold text-slate-900 dark:text-white">{label}</p>
        <button className="button button-primary mx-auto" onClick={onUpgrade} type="button">
          <Icon name="trend" size={16} /> Unlock with Plus
        </button>
      </div>
    </div>
  );
}
