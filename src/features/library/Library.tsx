import { useMemo, useState } from "react";
import type { LibraryTab, Subject } from "@/types";
import { resources } from "@/data/mock";
import { NameDialog } from "@/components/NameDialog";
import { useAppStore } from "@/store/useAppStore";
import { limitsFor } from "@/lib/plan";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

export function SubjectCard({ subject, onOpen }: { subject: Subject; onOpen: () => void }) {
  return (
    <button
      className="card group text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none"
      onClick={onOpen}
      type="button"
    >
      <div className="flex items-start justify-between">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-extrabold text-white shadow-lg"
          style={{ backgroundColor: subject.color, boxShadow: `0 8px 22px ${subject.color}30` }}
        >
          {subject.code}
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition group-hover:bg-slate-100 group-hover:text-slate-700 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-200">
          <Icon name="chevron" size={17} />
        </div>
      </div>
      <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{subject.name}</h3>
      <p className="mt-1 min-h-9 text-xs leading-relaxed text-slate-400">{subject.description}</p>
      <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Icon name="document" size={14} /> {subject.documents} docs
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="cards" size={14} /> {subject.decks} decks
        </span>
        <span className="ml-auto">{subject.topics} topics</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
        />
      </div>
    </button>
  );
}

export function SubjectDetail({
  subject,
  onBack,
  notify,
}: {
  subject: Subject;
  onBack: () => void;
  notify: (message: string) => void;
}) {
  const [tab, setTab] = useState<LibraryTab>("Notes");
  const list = (resources[subject.id] || []).filter((resource) => resource.type === tab);

  return (
    <main className="page-container">
      <button
        className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
        onClick={onBack}
        type="button"
      >
        <Icon name="arrow" size={17} className="rotate-180" /> Back to library
      </button>
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-lg font-extrabold text-white shadow-lg"
            style={{ backgroundColor: subject.color }}
          >
            {subject.code}
          </div>
          <div>
            <p className="eyebrow">Subject folder</p>
            <h1 className="page-title mt-1">{subject.name}</h1>
            <p className="mt-1 text-sm text-slate-400">{subject.description}</p>
          </div>
        </div>
        <Button icon="plus" onClick={() => notify(`Add ${tab.slice(0, -1).toLowerCase()} opened`)}>
          Add {tab.slice(0, -1)}
        </Button>
      </section>

      <section className="card mt-8 p-0">
        <div className="flex overflow-x-auto border-b border-slate-100 px-3 dark:border-slate-800 sm:px-6">
          {(["Notes", "Files", "Decks", "Quizzes"] as LibraryTab[]).map((item) => (
            <button
              className={`tab-button ${tab === item ? "tab-button-active" : ""}`}
              onClick={() => setTab(item)}
              key={item}
              type="button"
            >
              {item}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {(resources[subject.id] || []).filter((resource) => resource.type === item).length}
              </span>
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6">
          {list.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {list.map((resource) => (
                <button
                  className="group flex w-full items-center gap-4 py-4 text-left first:pt-0 last:pb-0"
                  onClick={() => notify(`${resource.title} opened`)}
                  key={resource.title}
                  type="button"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <Icon
                      name={
                        resource.type === "Decks"
                          ? "cards"
                          : resource.type === "Quizzes"
                            ? "quiz"
                            : resource.type === "Files"
                              ? "file"
                              : "document"
                      }
                      size={20}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-800 transition group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                      {resource.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {resource.meta} · Updated {resource.updated}
                    </span>
                  </span>
                  <Icon name="chevron" size={17} className="text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid min-h-52 place-content-center text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Icon
                  name={tab === "Decks" ? "cards" : tab === "Quizzes" ? "quiz" : "file"}
                  size={23}
                />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                No {tab.toLowerCase()} yet
              </h3>
              <p className="mt-1 text-xs text-slate-400">Add your first one to this subject.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function Library({ notify, onUpgrade }: { notify: (message: string) => void; onUpgrade: () => void }) {
  const subjects = useAppStore((s) => s.subjects);
  const addSubject = useAppStore((s) => s.addSubject);
  const plan = useAppStore((s) => s.plan);
  const limit = limitsFor(plan).subjects;
  const newSubject = () => (subjects.length >= limit ? onUpgrade() : setShowNewSubject(true));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Subject | null>(null);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const filtered = useMemo(
    () =>
      subjects.filter((subject) =>
        `${subject.name} ${subject.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, subjects],
  );

  if (selected)
    return <SubjectDetail subject={selected} onBack={() => setSelected(null)} notify={notify} />;

  return (
    <main className="page-container">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your knowledge hub</p>
          <h1 className="page-title mt-2">Study Library</h1>
          <p className="page-subtitle">Keep every note, deck, and review material organized.</p>
        </div>
        <Button icon="plus" onClick={newSubject}>
          New subject
        </Button>
      </section>

      <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/70 dark:bg-indigo-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
            <Icon name="folder" size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {plan === "free" ? `${subjects.length} of ${limit} folders used` : `${subjects.length} folders · unlimited on Plus`}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Free plan includes up to five subject folders.
            </div>
          </div>
        </div>
        <button
          className="text-left text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          onClick={onUpgrade}
          type="button"
        >
          Get unlimited with Plus →
        </button>
      </section>

      <section className="mt-7">
        <div className="relative max-w-md">
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subjects, notes, or decks..."
            type="search"
            value={query}
          />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onOpen={() => setSelected(subject)} />
          ))}
          {!filtered.length && (
            <div className="card col-span-full grid min-h-52 place-content-center text-center">
              <Icon name="search" size={28} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                No subjects found
              </h3>
              <p className="mt-1 text-xs text-slate-400">Try another search term.</p>
            </div>
          )}
        </div>
      </section>

      {showNewSubject && (
        <NameDialog title="New subject" label="Subject name" placeholder="e.g. Statistics" onClose={() => setShowNewSubject(false)}
          onSubmit={(name) => { addSubject(name); setShowNewSubject(false); notify(`${name} created`); }} />
      )}
    </main>
  );
}
