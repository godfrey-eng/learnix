

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
        <svg fill="none" height="25" viewBox="0 0 28 28" width="25" aria-hidden="true">
          <path
            d="M6 5v14.5c0 1.4 1.1 2.5 2.5 2.5H22"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3.2"
          />
          <path
            d="m12 15 3-3 3 3 5-6"
            stroke="#FBBF24"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.8"
          />
        </svg>
      </div>
      <div>
        <div className="text-[20px] font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white">
          Learnix
        </div>
        <div className="text-[10px] font-medium tracking-wide text-slate-400">
          Where learning is infinite.
        </div>
      </div>
    </div>
  );
}
