"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Eye, EyeOff, Wand2 } from "lucide-react";
import { vaultEntrySchema, CATEGORIES, type VaultEntryInput } from "@/lib/schemas";
import { StrengthMeter } from "@/components/strength/StrengthMeter";
import { generatePassword } from "@/lib/generator";

export interface VaultDraft {
  id?: string;
  site_name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: VaultEntryInput["category"];
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: VaultDraft | null;
  onSave: (draft: VaultDraft) => Promise<void>;
}

export function VaultEntryDialog({ open, onClose, initial, onSave }: Props) {
  const [d, setD] = useState<VaultDraft>(blank());
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setD(initial ?? blank());
  }, [open, initial]);

  if (!open) return null;

  function blank(): VaultDraft {
    return { site_name: "", username: "", password: "", url: "", notes: "", category: "Other" };
  }

  function quickGen() {
    const pw = generatePassword({
      length: 20, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: true,
    });
    setD({ ...d, password: pw });
    setShow(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = vaultEntrySchema.safeParse(d);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      await onSave(d);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="card w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold">{initial?.id ? "Edit entry" : "New entry"}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Site name</label>
            <input className="input" value={d.site_name} onChange={(e) => setD({ ...d, site_name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Username / Email</label>
            <input className="input" value={d.username} onChange={(e) => setD({ ...d, username: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as any })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  className="input pr-10 font-mono"
                  type={show ? "text" : "password"}
                  value={d.password}
                  onChange={(e) => setD({ ...d, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-fg">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button type="button" onClick={quickGen} className="btn-secondary" title="Generate strong password">
                <Wand2 size={14} /> Generate
              </button>
            </div>
            {d.password && <div className="mt-3"><StrengthMeter password={d.password} /></div>}
          </div>
          <div className="md:col-span-2">
            <label className="label">URL</label>
            <input className="input" value={d.url || ""} onChange={(e) => setD({ ...d, url: e.target.value })} placeholder="https://example.com" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input min-h-[80px]" value={d.notes || ""} onChange={(e) => setD({ ...d, notes: e.target.value })} />
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
