"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, KeyRound, LayoutDashboard, Wand2, ShieldAlert, ScrollText, User, ScanLine, FileText, Lock, Heart, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { decryptString } from "@/lib/crypto";
import { cn } from "@/lib/utils";

const supabase = createClient();

const PAGES = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Pages" },
  { label: "Vault", href: "/vault", icon: KeyRound, group: "Pages" },
  { label: "Generator", href: "/generator", icon: Wand2, group: "Pages" },
  { label: "Authenticator (TOTP)", href: "/totp", icon: ScanLine, group: "Pages" },
  { label: "Secure Notes", href: "/notes", icon: FileText, group: "Pages" },
  { label: "Breach Check", href: "/breach-check", icon: ShieldAlert, group: "Pages" },
  { label: "Activity Log", href: "/activity", icon: ScrollText, group: "Pages" },
  { label: "Profile", href: "/profile", icon: User, group: "Pages" },
];

interface VaultItem { id: string; site: string; username: string; category: string; }
interface Result { label: string; sub?: string; icon: React.ReactNode; action: () => void; group: string; }

export function CommandPalette() {
  const router = useRouter();
  const { key, lock } = useVault();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reload vault index every time the palette opens so search is always fresh
  useEffect(() => {
    if (!key || !open) return;
    (async () => {
      const { data } = await supabase.from("vault_entries")
        .select("id,site_name,username_encrypted,iv,category")
        .neq("category", "Note").neq("category", "TOTP");
      if (!data) return;
      const items: VaultItem[] = [];
      for (const r of data) {
        try {
          const username = await decryptString(key, r.username_encrypted, r.iv);
          items.push({ id: r.id, site: r.site_name, username, category: r.category });
        } catch { /* skip */ }
      }
      setVault(items);
    })();
  }, [key, open]);

  const navigate = useCallback((href: string) => { router.push(href); setOpen(false); setQ(""); }, [router]);

  const buildResults = useCallback((): Result[] => {
    const ql = q.toLowerCase();
    const results: Result[] = [];

    // Pages
    PAGES.filter(p => !ql || p.label.toLowerCase().includes(ql)).forEach(p =>
      results.push({ label: p.label, icon: <p.icon size={14} />, action: () => navigate(p.href), group: "Pages" })
    );

    // Vault entries
    if (key) vault.filter(v => !ql || v.site.toLowerCase().includes(ql) || v.username.toLowerCase().includes(ql)).slice(0, 6).forEach(v =>
      results.push({ label: v.site, sub: v.username, icon: <KeyRound size={14} />, action: () => navigate("/vault"), group: "Vault" })
    );

    // Quick actions
    const actions: Result[] = [
      { label: "New vault entry", icon: <Plus size={14} />, action: () => navigate("/vault"), group: "Actions" },
      { label: "Generate password", icon: <Wand2 size={14} />, action: () => navigate("/generator"), group: "Actions" },
      { label: "Run health scan", icon: <Heart size={14} />, action: () => navigate("/dashboard"), group: "Actions" },
      { label: "Lock vault", icon: <Lock size={14} />, action: () => { lock(); setOpen(false); }, group: "Actions" },
    ];
    actions.filter(a => !ql || a.label.toLowerCase().includes(ql)).forEach(a => results.push(a));

    return results;
  }, [q, vault, key, navigate, lock]);

  const results = buildResults();

  useEffect(() => { setIdx(0); }, [q]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQ("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[idx]) { results[idx].action(); }
  }

  if (!open) return null;

  const groups = [...new Set(results.map(r => r.group))];

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl mx-4 animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="card overflow-hidden border-accent/30 shadow-glow">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <Search size={16} className="text-muted shrink-0" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-fg placeholder:text-muted outline-none text-sm"
              placeholder="Search vault, pages, actions..."
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={handleKey}
            />
            <kbd className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">No results for "{q}"</div>
            ) : (
              groups.map(group => {
                const items = results.filter(r => r.group === group);
                let globalI = results.findIndex(r => r === items[0]);
                return (
                  <div key={group} className="mb-2">
                    <div className="text-[10px] uppercase tracking-widest text-muted px-3 py-1">{group}</div>
                    {items.map((r, i) => {
                      const absIdx = globalI + i;
                      return (
                        <button
                          key={i}
                          onClick={r.action}
                          onMouseEnter={() => setIdx(absIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                            absIdx === idx ? "bg-accent/15 text-fg" : "text-fg/70 hover:bg-white/5"
                          )}
                        >
                          <span className={cn("shrink-0", absIdx === idx ? "text-accent" : "text-muted")}>{r.icon}</span>
                          <span className="flex-1 truncate">{r.label}</span>
                          {r.sub && <span className="text-xs text-muted truncate max-w-[140px]">{r.sub}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 py-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-muted">
            <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
