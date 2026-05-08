"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Copy, Check, Trash2, RefreshCw, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { generateTOTP, totpSecondsRemaining } from "@/lib/totp";
import { logActivity } from "@/lib/activity";

const supabase = createClient();
const PERIOD = 30;
const RING_R = 22, RING_CIRC = 2 * Math.PI * RING_R;

function TOTPRing({ secs }: { secs: number }) {
  const progress = secs / PERIOD;
  const offset = RING_CIRC * (1 - progress);
  const color = secs <= 7 ? "#ef4444" : secs <= 15 ? "#f59e0b" : "#10b981";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx={28} cy={28} r={RING_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle cx={28} cy={28} r={RING_R} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={RING_CIRC} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill={color} fontSize="11" fontWeight="bold" fontFamily="monospace">{secs}</text>
    </svg>
  );
}

interface TOTPEntry { id: string; site: string; account: string; seed: string; }

export default function TOTPPage() {
  const { key, userId } = useVault();
  const [entries, setEntries] = useState<TOTPEntry[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [secs, setSecs] = useState(totpSecondsRemaining());
  const [adding, setAdding] = useState(false);
  const [site, setSite] = useState(""); const [account, setAccount] = useState(""); const [seed, setSeed] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setSecs(totpSecondsRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadEntries = useCallback(async () => {
    if (!key || !userId) return;
    setLoading(true);
    const { data } = await supabase.from("vault_entries").select("id,site_name,username_encrypted,password_encrypted,iv").eq("category", "TOTP");
    if (!data) { setLoading(false); return; }
    const list: TOTPEntry[] = [];
    for (const r of data) {
      try {
        const ivBytes = Uint8Array.from(atob(r.iv), c => c.charCodeAt(0));
        const dec = async (ct: string) => {
          const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, Uint8Array.from(atob(ct), c => c.charCodeAt(0)));
          return new TextDecoder().decode(buf);
        };
        list.push({ id: r.id, site: r.site_name, account: await dec(r.username_encrypted), seed: await dec(r.password_encrypted) });
      } catch { /* skip */ }
    }
    setEntries(list);
    setLoading(false);
  }, [key, userId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // Regenerate codes every second
  useEffect(() => {
    const gen = async () => {
      const fresh: Record<string, string> = {};
      for (const e of entries) {
        try { fresh[e.id] = await generateTOTP(e.seed); } catch { fresh[e.id] = "------"; }
      }
      setCodes(fresh);
    };
    gen();
    const id = setInterval(gen, 1000);
    return () => clearInterval(id);
  }, [entries]);

  async function copyCode(id: string, code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success("Code copied — valid for " + secs + "s");
    setTimeout(() => setCopied(null), 2000);
  }

  async function addEntry() {
    if (!key || !userId || !site || !seed) return;
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));
    let s = ""; for (let i = 0; i < ivBytes.length; i++) s += String.fromCharCode(ivBytes[i]);
    const ivB64 = btoa(s);
    const enc = async (txt: string) => {
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBytes }, key, new TextEncoder().encode(txt));
      const arr = new Uint8Array(ct); let out = "";
      for (let i = 0; i < arr.length; i++) out += String.fromCharCode(arr[i]);
      return btoa(out);
    };
    // Validate seed first
    try { await generateTOTP(seed); } catch { toast.error("Invalid base32 seed"); return; }
    const { error } = await supabase.from("vault_entries").insert({
      user_id: userId, site_name: site, category: "TOTP",
      username_encrypted: await enc(account), password_encrypted: await enc(seed.toUpperCase().replace(/\s/g, "")),
      notes_encrypted: await enc(""), iv: ivB64,
    });
    if (error) { toast.error(error.message); return; }
    await logActivity(supabase, userId, "vault_create", { site, type: "TOTP" });
    toast.success("Authenticator added");
    setSite(""); setAccount(""); setSeed(""); setAdding(false);
    loadEntries();
  }

  async function remove(id: string) {
    await supabase.from("vault_entries").delete().eq("id", id);
    if (userId) await logActivity(supabase, userId, "vault_delete", { id });
    toast.success("Removed");
    loadEntries();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-1">Authenticator</h1>
          <p className="text-sm text-muted">TOTP codes — RFC 6238 via Web Crypto. Seeds encrypted with AES-256-GCM.</p>
        </div>
        <button onClick={() => setAdding(a => !a)} className="btn-primary"><Plus size={14} /> Add account</button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card-hover p-6 mb-5 border-accent/20 animate-slide-in">
          <h3 className="font-bold mb-4 text-sm">Add authenticator account</h3>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div><label className="label">Service name</label><input className="input" value={site} onChange={e => setSite(e.target.value)} placeholder="GitHub, Google…" /></div>
            <div><label className="label">Account / Email</label><input className="input" value={account} onChange={e => setAccount(e.target.value)} placeholder="you@example.com" /></div>
          </div>
          <div className="mb-4">
            <label className="label">Base32 secret seed</label>
            <input className="input font-mono" value={seed} onChange={e => setSeed(e.target.value)} placeholder="JBSWY3DPEHPK3PXP (from QR code setup)" />
            <p className="text-[10px] text-muted mt-1">Find this in the "Can't scan QR code?" link on any 2FA setup page.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addEntry} className="btn-primary" disabled={!site || !seed}>Add account</button>
            <button onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse opacity-40" />)}</div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <ScanLine size={40} className="mx-auto mb-3 opacity-30" />
          <div className="font-semibold mb-1">No authenticator accounts</div>
          <div className="text-sm">Add a TOTP seed to start generating codes.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => {
            const code = codes[e.id] || "------";
            const formatted = code.slice(0, 3) + " " + code.slice(3);
            return (
              <div key={e.id} className="card-hover p-5 flex items-center gap-5">
                <TOTPRing secs={secs} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{e.site}</div>
                  <div className="text-xs text-muted">{e.account}</div>
                  <div className="font-mono text-2xl font-black tracking-[0.2em] mt-1 text-fg">{formatted}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyCode(e.id, code)} className="btn-secondary gap-2 text-sm">
                    {copied === e.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    {copied === e.id ? "Copied" : "Copy"}
                  </button>
                  <button onClick={() => remove(e.id)} className="btn-ghost p-2 hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
