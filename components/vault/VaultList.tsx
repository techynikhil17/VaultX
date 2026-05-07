"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, Eye, EyeOff, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { decryptString } from "@/lib/crypto";
import { VaultEntryDialog, type VaultDraft } from "./VaultEntryDialog";
import { CopyButton } from "@/components/CopyButton";
import { CATEGORIES } from "@/lib/schemas";
import { logActivity } from "@/lib/activity";
import { formatDate, cn } from "@/lib/utils";

interface VaultRow {
  id: string;
  site_name: string;
  username_encrypted: string;
  password_encrypted: string;
  notes_encrypted: string | null;
  url: string | null;
  category: string;
  iv: string;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

interface DecryptedEntry extends VaultRow {
  username: string;
  password: string;
  notes: string;
}

export function VaultList() {
  const supabase = createClient();
  const { key, userId } = useVault();
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
    const { data, error } = await supabase
      .from("vault_entries")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const decrypted: DecryptedEntry[] = [];
    for (const r of data as VaultRow[]) {
      try {
        const username = await decryptString(key, r.username_encrypted, r.iv);
        const password = await decryptString(key, r.password_encrypted, r.iv);
        const notes = r.notes_encrypted ? await decryptString(key, r.notes_encrypted, r.iv) : "";
        decrypted.push({ ...r, username, password, notes });
      } catch {
        // Likely wrong key — skip silently.
      }
    }
    setRows(decrypted);
    setLoading(false);
  }, [supabase, key, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Ctrl+K focuses search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("vault-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (cat !== "All" && r.category !== cat) return false;
      if (q) {
        const needle = q.toLowerCase();
        return (
          r.site_name.toLowerCase().includes(needle) ||
          r.username.toLowerCase().includes(needle) ||
          (r.url || "").toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [rows, q, cat]);

  async function save(draft: VaultDraft) {
    if (!key || !userId) return;
    // Single IV per row, reused across the row's three encrypted fields.
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));
    let s = "";
    for (let i = 0; i < ivBytes.length; i++) s += String.fromCharCode(ivBytes[i]);
    const ivB64 = btoa(s);
    const enc = async (txt: string) => {
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBytes }, key, new TextEncoder().encode(txt));
      const arr = new Uint8Array(ct);
      let out = "";
      for (let i = 0; i < arr.length; i++) out += String.fromCharCode(arr[i]);
      return btoa(out);
    };
    const payload = {
      site_name: draft.site_name,
      username_encrypted: await enc(draft.username),
      password_encrypted: await enc(draft.password),
      notes_encrypted: await enc(draft.notes || ""),
      iv: ivB64,
      url: draft.url || null,
      category: draft.category,
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
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("vault_entries").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (userId) await logActivity(supabase, userId, "vault_delete", { id });
    toast.success("Deleted");
    refresh();
  }

  async function markUsed(id: string) {
    await supabase.from("vault_entries").update({ last_used_at: new Date().toISOString() }).eq("id", id);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="vault-search"
            className="input pl-9"
            placeholder="Search vault... (Ctrl+K)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input max-w-[180px]" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="btn-primary">
          <Plus size={16} /> New entry
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No entries yet. Click <span className="text-accent">New entry</span> to create your first one.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const shown = !!reveal[r.id];
            return (
              <div key={r.id} className="card p-4 hover:border-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0",
                    "bg-accent/10 text-accent")}>
                    {r.site_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{r.site_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-panel border border-border text-muted">{r.category}</span>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-muted mt-1 truncate">{r.username || <span className="italic">(no username)</span>}</div>
                    <div className="flex items-center gap-2 mt-2 font-mono text-sm">
                      <span className="truncate">{shown ? r.password : "•".repeat(Math.min(r.password.length, 16))}</span>
                      <button onClick={() => setReveal({ ...reveal, [r.id]: !shown })} className="btn-ghost p-1.5">
                        {shown ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <CopyButton value={r.username} label="Username" />
                      <CopyButton value={r.password} label="Password" />
                    </div>
                    <div className="text-xs text-muted mt-2">
                      Created {formatDate(r.created_at)} · Last used {formatDate(r.last_used_at)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        markUsed(r.id);
                        setEditing({
                          id: r.id, site_name: r.site_name, username: r.username, password: r.password,
                          url: r.url || "", notes: r.notes, category: r.category as any,
                        });
                        setDialogOpen(true);
                      }}
                      className="btn-ghost p-2"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(r.id, r.site_name)} className="btn-ghost p-2 hover:text-danger" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <VaultEntryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editing}
        onSave={save}
      />
    </div>
  );
}
