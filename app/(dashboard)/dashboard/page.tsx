"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Repeat, Heart, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { decryptString } from "@/lib/crypto";
import { analyzePassword } from "@/lib/strength";
import { checkPasswordPwned } from "@/lib/hibp";
import { logActivity } from "@/lib/activity";
import { toast } from "sonner";

interface Stats {
  total: number;
  weak: number;
  reused: number;
  breached: number;
  health: number;
  flagged: { id: string; site: string; reason: string }[];
}

export default function DashboardPage() {
  const supabase = createClient();
  const { key, userId } = useVault();
  const [stats, setStats] = useState<Stats | null>(null);
  const [scanning, setScanning] = useState(false);

  const compute = useCallback(
    async (withBreach: boolean) => {
      if (!key || !userId) return;
      const { data, error } = await supabase.from("vault_entries").select("*");
      if (error) { toast.error(error.message); return; }
      const decoded: { id: string; site: string; password: string }[] = [];
      for (const r of data) {
        try {
          const password = await decryptString(key, r.password_encrypted, r.iv);
          decoded.push({ id: r.id, site: r.site_name, password });
        } catch { /* skip */ }
      }
      const counts = new Map<string, number>();
      decoded.forEach((d) => counts.set(d.password, (counts.get(d.password) || 0) + 1));
      let weak = 0, reused = 0, breached = 0;
      const flagged: Stats["flagged"] = [];
      const breachCache = new Map<string, number>();
      for (const d of decoded) {
        const sc = analyzePassword(d.password).score;
        if (sc < 45) { weak++; flagged.push({ id: d.id, site: d.site, reason: "Weak password" }); }
        if ((counts.get(d.password) || 0) > 1) { reused++; flagged.push({ id: d.id, site: d.site, reason: "Reused password" }); }
        if (withBreach) {
          let n = breachCache.get(d.password);
          if (n === undefined) {
            try { n = await checkPasswordPwned(d.password); } catch { n = 0; }
            breachCache.set(d.password, n);
          }
          if (n > 0) { breached++; flagged.push({ id: d.id, site: d.site, reason: `Breached (${n.toLocaleString()} times)` }); }
        }
      }
      const total = decoded.length;
      const issues = weak + reused + breached;
      const health = total === 0 ? 100 : Math.max(0, Math.round(100 - (issues / (total * 3)) * 100));
      setStats({ total, weak, reused, breached, health, flagged });
    },
    [key, userId, supabase]
  );

  useEffect(() => { compute(false); }, [compute]);

  async function runHealthScan() {
    setScanning(true);
    await compute(true);
    setScanning(false);
    if (userId) await logActivity(supabase, userId, "health_scan");
    toast.success("Health scan complete");
  }

  if (!stats) {
    return <div className="p-8"><div className="card p-10 animate-pulse h-40" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted">Your vault at a glance.</p>
        </div>
        <button onClick={runHealthScan} disabled={scanning} className="btn-primary">
          {scanning ? "Scanning..." : "Run health scan"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={<KeyRound size={18} />} label="Total" value={stats.total} color="text-fg" />
        <Stat icon={<AlertTriangle size={18} />} label="Weak" value={stats.weak} color="text-warn" />
        <Stat icon={<Repeat size={18} />} label="Reused" value={stats.reused} color="text-warn" />
        <Stat icon={<Shield size={18} />} label="Breached" value={stats.breached} color="text-danger" />
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Heart size={18} className="text-accent" />
          <h2 className="font-semibold">Vault health</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{stats.health}</div>
          <div className="flex-1">
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={
                  stats.health >= 80 ? "h-full bg-success" :
                  stats.health >= 60 ? "h-full bg-warn" : "h-full bg-danger"
                }
                style={{ width: `${stats.health}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-2">
              Run a full health scan to include breach data from HaveIBeenPwned.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Flagged passwords</h2>
        {stats.flagged.length === 0 ? (
          <p className="text-sm text-muted">Nothing flagged. Nice work.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.flagged.map((f, i) => (
              <li key={`${f.id}-${i}`} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.site}</div>
                  <div className="text-xs text-muted">{f.reason}</div>
                </div>
                <Link href="/vault" className="text-sm text-accent hover:underline">Edit →</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="card p-4">
      <div className={`flex items-center gap-2 ${color} mb-2`}>{icon}<span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className={`text-3xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
