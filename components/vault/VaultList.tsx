"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, EyeOff, Pencil, Trash2, ExternalLink, Star, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { decryptString } from "@/lib/crypto";
import { VaultEntryDialog, type VaultDraft } from "./VaultEntryDialog";
import { CopyButton } from "@/components/CopyButton";
import { CATEGORIES } from "@/lib/schemas";
import { logActivity } from "@/lib/activity";
import { analyzePassword } from "@/lib/strength";
import { formatDate, cn } from "@/lib/utils";
import { MotionList, MotionItem } from "@/components/motion";

const supabase = createClient();

const CAT_STYLES: Record<string, string> = {
  Social: "cat-social", Work: "cat-work", Finance: "cat-finance", Email: "cat-email",
  Shopping: "cat-shopping", Entertainment: "cat-entertainment", Other: "cat-other",
};
const CAT_ACCENT: Record<string, string> = {
  Social: "#ec4899", Work: "#3b82f6", Finance: "#10b981", Email: "#f59e0b",
  Shopping: "#a855f7", Entertainment: "#f43f5e", Other: "#6b7280",
};

interface VaultRow {
  id: string; site_name: string; username_encrypted: string; password_encrypted: string;
  notes_encrypted: string | null; url: string | null; category: string; iv: string;
  created_at: string; updated_at: string; last_used_at: string | null; is_favorite?: boolean;
}
interface DecryptedEntry extends VaultRow { username: string; password: string; notes: string; is_favorite: boolean; }

function AgePill({ updatedAt }: { updatedAt: string }) {
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000);
  if (days < 90) return null;
  const label = days > 365 ? `${Math.floor(days / 365)}y+` : `${Math.floor(days / 30)}mo`;
  return (
    <span className={`badge ${days > 365 ? "badge-danger" : "badge-warn"} gap-1`}>
      <Clock size={9} />{label}
    </span>
  );
}

function StrengthPips({ score }: { score: number }) {
  const filled = score >= 85 ? 5 : score >= 65 ? 4 : score >= 45 ? 3 : score >= 25 ? 2 : 1;
  const color = score >= 65 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex gap-0.5 items-center">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i < filled ? color : "rgba(255,255,255,0.1)" }} />
      ))}
    </div>
  );
}

export function VaultList() {
  const { key, userId } = useVault();
  const router = useRouter();
  const [rows, setRows] = useState<DecryptedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VaultDraft | null>(null);

  const refresh = useCallback(async () => {
    if (!key || !userId) return;
    setLoading(true);
    const { data, error } = await supabase.from("vault_entries").select("*")
      .neq("category", "Note").neq("category", "TOTP")
      .order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const decrypted: DecryptedEntry[] = [];
    for (const r of data as VaultRow[]) {
      try {
        const ivBytes = Uint8Array.from(atob(r.iv), c => c.charCodeAt(0));
        const dec = async (ct: string) => {
          const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, Uint8Array.from(atob(ct), c => c.charCodeAt(0)));
          return new TextDecoder().decode(buf);
        };
        const username = await dec(r.username_encrypted);
        const password = await dec(r.password_encrypted);
        const notes = r.notes_encrypted ? await dec(r.notes_encrypted) : "";
        decrypted.push({ ...r, username, password, notes, is_favorite: r.is_favorite ?? false });
      } catch { /* skip wrong-key rows */ }
    }
    setRows(decrypted);
    setLoading(false);
  }, [key, userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => rows.filter(r => {
    if (cat !== "All" && r.category !== cat) return false;
    if (!q) return true;
    const n = q.toLowerCase();
    return r.site_name.toLowerCase().includes(n) || r.username.toLowerCase().includes(n) || (r.url || "").toLowerCase().includes(n);
  }), [rows, q, cat]);

  async function save(draft: VaultDraft) {
    if (!key || !userId) return;
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));
    let s = ""; for (let i = 0; i < ivBytes.length; i++) s += String.fromCharCode(ivBytes[i]);
    const ivB64 = btoa(s);
    const enc = async (txt: string) => {
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBytes }, key, new TextEncoder().encode(txt));
      const arr = new Uint8Array(ct); let out = "";
      for (let i = 0; i < arr.length; i++) out += String.fromCharCode(arr[i]);
      return btoa(out);
    };
    const payload = {
      site_name: draft.site_name, username_encrypted: await enc(draft.username),
      password_encrypted: await enc(draft.password), notes_encrypted: await enc(draft.notes || ""),
      iv: ivB64, url: draft.url || null, category: draft.category,
    };
    if (draft.id) {
      const { error } = await supabase.from("vault_entries").update(payload).eq("id", draft.id);
      if (error) { toast.error(error.message); return; }
      await logActivity(supabase, userId, "vault_update", { id: draft.id });
      toast.success("Entry updated");
    } else {
      const { error } = await supabase.from("vault_entries").insert({ ...payload, user_id: userId });
      if (error) { toast.error(error.message); return; }
      await logActivity(supabase, userId, "vault_create", { site: draft.site_name });
      toast.success("Entry saved");
    }
    refresh();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    setRows(prev => prev.filter(r => r.id !== id));
    const { error } = await supabase.from("vault_entries").delete().eq("id", id);
    if (error) { toast.error(error.message); refresh(); return; }
    if (userId) await logActivity(supabase, userId, "vault_delete", { id });
    toast.success("Deleted");
    router.refresh();
  }

  async function toggleFavorite(id: string, current: boolean) {
    await supabase.from("vault_entries").update({ is_favorite: !current }).eq("id", id);
    refresh();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9 text-sm" placeholder="Search vault… (⌘K)" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="input max-w-[160px] text-sm" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="btn-primary">
          <Plus size={14} /> New entry
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="divide-y divide-white/[0.04]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-4">
              <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-36 mb-2" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <div className="text-5xl mb-3">🔐</div>
          <div className="font-semibold mb-1 text-fg">No entries yet</div>
          <div className="text-sm">Click <span className="text-accent">New entry</span> to add your first password.</div>
        </div>
      ) : (
        <MotionList className="divide-y divide-white/[0.04]">
          {filtered.map(r => {
            const shown = !!reveal[r.id];
            const sc = analyzePassword(r.password).score;
            const accentColor = CAT_ACCENT[r.category] || "#6b7280";
            return (
              <MotionItem key={r.id}>
              <div
                className="flex items-start gap-3 py-4 -mx-3 px-3 rounded-lg hover:bg-white/[0.025] transition-all duration-150 group"
                style={{ borderLeft: `2px solid ${accentColor}40` }}
                onMouseEnter={e => (e.currentTarget.style.borderLeftColor = `${accentColor}90`)}
                onMouseLeave={e => (e.currentTarget.style.borderLeftColor = `${accentColor}40`)}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ background: `linear-gradient(135deg, ${accentColor}50, ${accentColor}20)`, border: `1px solid ${accentColor}30` }}
                >
                  {r.site_name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm">{r.site_name}</span>
                    <span className={`badge ${CAT_STYLES[r.category] || "cat-other"} border`}>{r.category}</span>
                    {r.is_favorite && <Star size={11} className="text-amber-400 fill-amber-400" />}
                    <AgePill updatedAt={r.updated_at} />
                    {sc < 45 && <span className="badge badge-warn gap-1"><ShieldAlert size={9} />Weak</span>}
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-muted hover:text-accent transition-colors"><ExternalLink size={12} /></a>}
                  </div>
                  <div className="text-xs text-muted truncate mb-2">{r.username || <em>No username</em>}</div>
                  <div className="flex items-center gap-2">
                    <StrengthPips score={sc} />
                    <span className="font-mono text-xs text-muted/60 truncate">
                      {shown ? r.password : "•".repeat(Math.min(r.password.length, 18))}
                    </span>
                    <button onClick={() => setReveal({ ...reveal, [r.id]: !shown })} className="text-muted hover:text-fg transition-colors">
                      {shown ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <CopyButton value={r.username} label="Username" />
                    <CopyButton value={r.password} label="Password" />
                  </div>
                  <div className="text-[10px] text-muted/50 mt-1.5">{formatDate(r.updated_at)} · last used {formatDate(r.last_used_at)}</div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button onClick={() => toggleFavorite(r.id, r.is_favorite)} className={cn("btn-ghost p-2", r.is_favorite && "text-amber-400")}>
                    <Star size={13} className={r.is_favorite ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={() => { setEditing({ id: r.id, site_name: r.site_name, username: r.username, password: r.password, url: r.url || "", notes: r.notes, category: r.category as any }); setDialogOpen(true); }}
                    className="btn-ghost p-2"
                  >
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(r.id, r.site_name)} className="btn-ghost p-2 hover:text-danger">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              </MotionItem>
            );
          })}
        </MotionList>
      )}

      <VaultEntryDialog open={dialogOpen} onClose={() => setDialogOpen(false)} initial={editing} onSave={save} />
    </div>
  );
}
