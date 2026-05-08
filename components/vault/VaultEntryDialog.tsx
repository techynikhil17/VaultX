"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Eye, EyeOff, Wand2, AlertCircle } from "lucide-react";
import { vaultEntrySchema, CATEGORIES, type VaultEntryInput } from "@/lib/schemas";
import { StrengthMeter } from "@/components/strength/StrengthMeter";
import { generatePassword } from "@/lib/generator";

export interface VaultDraft {
  id?: string; site_name: string; username: string; password: string;
  url?: string; notes?: string; category: VaultEntryInput["category"];
}

interface Props { open: boolean; onClose: () => void; initial?: VaultDraft | null; onSave: (d: VaultDraft) => Promise<void>; }

const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function emailError(val: string): string | null {
  if (!val || !val.includes("@")) return null;
  if (VALID_EMAIL_RE.test(val)) return null;
  // Give a more specific hint
  const [local, domain] = val.split("@");
  if (!local) return "Missing the part before @";
  if (!domain) return "Missing domain after @";
  if (!domain.includes(".")) return `"${domain}" has no TLD — try ${domain}.com`;
  if (domain.split(".").pop()!.length < 2) return "TLD too short — should be .com, .org, .io…";
  return "Not a valid email address";
}

export function VaultEntryDialog({ open, onClose, initial, onSave }: Props) {
  const [d, setD] = useState<VaultDraft>(blank());
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showStrength, setShowStrength] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) { setD(initial ?? blank()); setTouched({}); setShow(false); setShowStrength(false); }
  }, [open, initial]);

  if (!open) return null;

  function blank(): VaultDraft { return { site_name: "", username: "", password: "", url: "", notes: "", category: "Other" }; }

  function quickGen() {
    const pw = generatePassword({ length: 24, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: true });
    setD({ ...d, password: pw }); setShow(true); setShowStrength(true);
  }

  const usernameErr = touched.username ? emailError(d.username) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(t => ({ ...t, username: true }));
    const err = emailError(d.username);
    if (err) { toast.error(err); return; }
    const parsed = vaultEntrySchema.safeParse(d);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setBusy(true);
    try { await onSave(d); onClose(); } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-[#07071a]/80 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backdropFilter: "blur(12px)" }}>
      <form onSubmit={submit} className="card w-full max-w-2xl my-8 animate-slide-in border-white/10 bg-[#0b0b20]">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="font-bold text-base">{d.id ? "Edit entry" : "New vault entry"}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={16} /></button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Site name</label>
            <input
              className="input"
              value={d.site_name}
              onChange={e => setD({ ...d, site_name: e.target.value })}
              placeholder="GitHub, Netflix, Chase…"
              required
            />
          </div>

          <div>
            <label className="label">Username / Email</label>
            <input
              className={`input ${usernameErr ? "border-danger/60 focus:ring-danger/30 focus:border-danger/60" : ""}`}
              value={d.username}
              onChange={e => setD({ ...d, username: e.target.value })}
              onBlur={() => setTouched(t => ({ ...t, username: true }))}
              placeholder="you@gmail.com or username"
            />
            {usernameErr && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-danger">
                <AlertCircle size={11} className="shrink-0" />
                {usernameErr}
              </div>
            )}
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={d.category} onChange={e => setD({ ...d, category: e.target.value as any })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  onChange={e => { setD({ ...d, password: e.target.value }); setShowStrength(true); }}
                  placeholder="••••••••••••••••"
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button type="button" onClick={quickGen} className="btn-secondary shrink-0"><Wand2 size={14} /> Generate</button>
            </div>
            {showStrength && d.password && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <StrengthMeter password={d.password} />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">URL</label>
            <input className="input" value={d.url || ""} onChange={e => setD({ ...d, url: e.target.value })} placeholder="https://example.com" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Notes (encrypted)</label>
            <textarea className="input min-h-[80px] resize-none" value={d.notes || ""} onChange={e => setD({ ...d, notes: e.target.value })} placeholder="Any additional notes…" />
          </div>
        </div>

        <div className="p-5 border-t border-white/[0.06] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button className="btn-primary" disabled={busy || !!usernameErr}>
            {busy ? "Saving…" : d.id ? "Update entry" : "Save entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
