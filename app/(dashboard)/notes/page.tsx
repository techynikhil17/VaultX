"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, FileText, X, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { formatDate } from "@/lib/utils";

const supabase = createClient();

interface Note { id: string; title: string; content: string; updated_at: string; }

export default function NotesPage() {
  const { key, userId } = useVault();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!key || !userId) return;
    setLoading(true);
    const { data } = await supabase.from("vault_entries").select("id,site_name,notes_encrypted,iv,updated_at").eq("category", "Note").order("updated_at", { ascending: false });
    if (!data) { setLoading(false); return; }
    const list: Note[] = [];
    for (const r of data) {
      try {
        const ivBytes = Uint8Array.from(atob(r.iv), c => c.charCodeAt(0));
        const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, Uint8Array.from(atob(r.notes_encrypted), c => c.charCodeAt(0)));
        list.push({ id: r.id, title: r.site_name, content: new TextDecoder().decode(buf), updated_at: r.updated_at });
      } catch { /* skip */ }
    }
    setNotes(list);
    setLoading(false);
  }, [key, userId]);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing({ id: "", title: "", content: "", updated_at: "" }); setTitle(""); setContent(""); }
  function openEdit(n: Note) { setEditing(n); setTitle(n.title); setContent(n.content); }

  async function save() {
    if (!key || !userId || !title) return;
    setBusy(true);
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));
    let s = ""; for (let i = 0; i < ivBytes.length; i++) s += String.fromCharCode(ivBytes[i]);
    const ivB64 = btoa(s);
    const enc = async (txt: string) => {
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBytes }, key, new TextEncoder().encode(txt));
      const arr = new Uint8Array(ct); let out = "";
      for (let i = 0; i < arr.length; i++) out += String.fromCharCode(arr[i]);
      return btoa(out);
    };
    const contentEnc = await enc(content);
    const placeholder = await enc("");
    if (editing?.id) {
      await supabase.from("vault_entries").update({ site_name: title, notes_encrypted: contentEnc, iv: ivB64 }).eq("id", editing.id);
      toast.success("Note updated");
    } else {
      await supabase.from("vault_entries").insert({ user_id: userId, site_name: title, category: "Note", notes_encrypted: contentEnc, username_encrypted: placeholder, password_encrypted: placeholder, iv: ivB64 });
      toast.success("Note saved");
    }
    setBusy(false); setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await supabase.from("vault_entries").delete().eq("id", id);
    toast.success("Deleted"); load();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-1">Secure Notes</h1>
          <p className="text-sm text-muted">Encrypted notes — AES-256-GCM. Content never stored in plaintext.</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus size={14} /> New note</button>
      </div>

      {/* Editor */}
      {editing !== null && (
        <div className="glass-card p-6 mb-8 animate-slide-in" style={{ border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Lock size={13} className="text-accent" />
              {editing.id ? "Edit note" : "New encrypted note"}
            </h3>
            <button onClick={() => setEditing(null)} className="btn-ghost p-1.5 rounded-lg"><X size={14} /></button>
          </div>
          <input
            className="input mb-3 font-semibold text-base"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Note title…"
          />
          <textarea
            className="input min-h-[220px] resize-y font-mono text-sm leading-relaxed"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write anything here — it's fully encrypted before saving."
          />
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={busy || !title} className="btn-primary">
              <Check size={14} />{busy ? "Saving…" : "Save note"}
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="glass-card py-16 text-center text-muted">
          <FileText size={36} className="mx-auto mb-3 opacity-20" />
          <div className="font-semibold mb-1 text-fg">No notes yet</div>
          <div className="text-sm">Click New note to create your first encrypted note.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {notes.map(n => (
            <div
              key={n.id}
              className="glass-card p-5 group cursor-pointer transition-all duration-200 relative overflow-hidden"
              style={{ border: "1px solid rgba(139,92,246,0.15)" }}
              onClick={() => openEdit(n)}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(139,92,246,0.3)";
                el.style.background = "rgba(139,92,246,0.03)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(139,92,246,0.15)";
                el.style.background = "";
              }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
              />
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate flex items-center gap-1.5">
                  <FileText size={12} className="text-violet-400 shrink-0" />
                  {n.title}
                </h3>
                <div
                  className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={e => e.stopPropagation()}
                >
                  <button onClick={() => openEdit(n)} className="btn-ghost p-1.5"><Pencil size={12} /></button>
                  <button onClick={() => remove(n.id)} className="btn-ghost p-1.5 hover:text-danger"><Trash2 size={12} /></button>
                </div>
              </div>
              <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                {n.content || <span className="italic">Empty note</span>}
              </p>
              <div className="text-[10px] text-muted/50 mt-3">{formatDate(n.updated_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
