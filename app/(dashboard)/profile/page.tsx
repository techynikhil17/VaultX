"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { Lock, Mail, ShieldCheck, Download, KeyRound, Activity } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

export default function ProfilePage() {
  const { lock, unlocked, key } = useVault();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [count, setCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.auth.getUser(),
      supabase.from("vault_entries").select("*", { count: "exact", head: true }),
    ]).then(([{ data }, { count: c }]) => {
      if (data.user) { setEmail(data.user.email || ""); setCreatedAt(new Date(data.user.created_at).toLocaleDateString()); }
      setCount(c || 0);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exportVault() {
    if (!key) { toast.error("Vault must be unlocked to export"); return; }
    const exportPw = prompt("Set an export password (used to re-encrypt the backup):");
    if (!exportPw) return;
    setExporting(true);
    try {
      const { data } = await supabase.from("vault_entries").select("*");
      if (!data) throw new Error("No data");
      const decrypted = [];
      for (const r of data) {
        try {
          const ivBytes = Uint8Array.from(atob(r.iv), c => c.charCodeAt(0));
          const dec = async (ct: string) => { const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, Uint8Array.from(atob(ct), c => c.charCodeAt(0))); return new TextDecoder().decode(buf); };
          decrypted.push({ ...r, username_plain: await dec(r.username_encrypted), password_plain: await dec(r.password_encrypted), notes_plain: r.notes_encrypted ? await dec(r.notes_encrypted) : "" });
        } catch { /* skip */ }
      }
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(exportPw), "PBKDF2", false, ["deriveKey"]);
      const exportKey = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const plain = JSON.stringify({ version: 1, exported_at: new Date().toISOString(), entries: decrypted });
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, exportKey, new TextEncoder().encode(plain));
      const toB64 = (b: ArrayBuffer) => { let s = ""; new Uint8Array(b).forEach(x => s += String.fromCharCode(x)); return btoa(s); };
      const blob = new Blob([JSON.stringify({ salt: toB64(salt), iv: toB64(iv), ciphertext: toB64(ct) })], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `vaultx-backup-${new Date().toISOString().slice(0, 10)}.enc.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Vault exported — keep this file safe");
    } catch { toast.error("Export failed"); }
    setExporting(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black gradient-text mb-1">Profile</h1>
        <p className="text-sm text-muted">Account details and vault management.</p>
      </div>

      {/* Account info */}
      <div className="space-y-5 pb-10 border-b border-white/[0.05] mb-10">
        <Row icon={<Mail size={14} />} label="Email" value={email} />
        <Row icon={<KeyRound size={14} />} label="Vault entries" value={String(count)} />
        <Row icon={<Activity size={14} />} label="Account created" value={createdAt} />
        <Row icon={<ShieldCheck size={14} />} label="Vault state" value={unlocked ? "🔓 Unlocked" : "🔒 Locked"} />
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-5">Actions</h2>
        <div className="space-y-2.5">
          <button
            onClick={() => { lock(); toast.success("Vault locked — key cleared from memory"); }}
            className="btn-secondary w-full justify-center gap-2"
          >
            <Lock size={14} /> Lock vault
          </button>
          <button
            onClick={exportVault}
            disabled={exporting}
            className="btn-secondary w-full justify-center gap-2"
          >
            <Download size={14} /> {exporting ? "Exporting…" : "Export encrypted backup"}
          </button>
          <p className="text-xs text-muted pt-1">Export creates a re-encrypted backup using a separate password. The file cannot be read without it.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="text-muted w-5 shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] text-muted uppercase tracking-widest mb-0.5">{label}</div>
        <div className="font-medium text-sm">{value || "—"}</div>
      </div>
    </div>
  );
}
