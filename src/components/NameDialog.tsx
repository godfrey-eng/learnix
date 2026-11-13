import { useState } from "react";
import { Button } from "@/components/Button";

export function NameDialog({ title, label, placeholder, onClose, onSubmit }: {
  title: string; label: string; placeholder?: string; onClose: () => void; onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!value.trim()) return setError(`${label} is required.`);
    onSubmit(value.trim());
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="section-title">{title}</h2>
        <label className="mt-5 block text-xs font-bold text-slate-500" htmlFor="name-dialog">{label}</label>
        <input id="name-dialog" autoFocus className="editor-field mt-2" placeholder={placeholder} value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Create</Button>
        </div>
      </div>
    </div>
  );
}
