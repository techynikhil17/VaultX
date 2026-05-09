"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Repeat, Heart, KeyRound, Clock, Zap, ArrowUpRight } from "lucide-react";
import { MotionList, MotionItem } from "@/components/motion";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { decryptString } from "@/lib/crypto";
import { analyzePassword } from "@/lib/strength";
import { checkPasswordPwned } from "@/lib/hibp";
import { logActivity } from "@/lib/activity";
import { toast } from "sonner";

const supabase = createClient();

interface Stats {
  total: number; weak: number; reused: number; breached: number; stale: number;
  health: number;
  flagged: { id: string; site: string; reason: string; severity: "danger" | "warn" }[];
}

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

function HealthGauge({ score }: { score: number }) {
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const displayed = useCountUp(score);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1), stroke 0.5s", filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black" style={{ color }}>{displayed}</div>
          <div className="text-[9px] text-muted uppercase tracking-widest">Health</div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="font-bold text-sm">{score >= 80 ? "Excellent" : score >= 60 ? "Needs work" : "At risk"}</div>
        <div className="text-xs text-muted">Vault security score</div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  glowColor?: string;
  desc?: string;
}

function StatCard({ icon, label, value, color, glowColor, desc }: StatCardProps) {
  const displayed = useCountUp(value);
  return (
    <div
      className="glass-card p-5 relative overflow-hidden transition-all duration-200"
      style={{ border: `1px solid ${glowColor ? glowColor + "25" : "rgba(255,255,255,0.07)"}` }}
    >
      {glowColor && (
        <div
          className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
          style={{ background: `radial-gradient(circle at 80% 20%, ${glowColor}15 0%, transparent 70%)` }}
        />
      )}
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{label}</span>
      </div>
      <div className={`text-4xl font-black tabular-nums ${color}`}>{displayed}</div>
      {desc && <div className="text-xs text-muted mt-1.5">{desc}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { key, userId } = useVault();
  const [stats, setStats] = useState<Stats | null>(null);
  const [scanning, setScanning] = useState(false);

  const compute = useCallback(async (withBreach: boolean) => {
    if (!key || !userId) return;
    const { data, error } = await supabase.from("vault_entries").select("*").neq("category", "Note");
    if (error) { toast.error(error.message); return; }
    const decoded: { id: string; site: string; password: string; updatedAt: string }[] = [];
    for (const r of data) {
      try {
        const password = await decryptString(key, r.password_encrypted, r.iv);
        if (r.category !== "TOTP") decoded.push({ id: r.id, site: r.site_name, password, updatedAt: r.updated_at });
      } catch { /* skip */ }
    }
    const counts = new Map<string, number>();
    decoded.forEach(d => counts.set(d.password, (counts.get(d.password) || 0) + 1));
    const ninetyDaysAgo = Date.now() - 90 * 24 * 3600 * 1000;
    let weak = 0, reused = 0, breached = 0, stale = 0;
    const flagged: Stats["flagged"] = [];
    const breachCache = new Map<string, number>();
    for (const d of decoded) {
      const sc = analyzePassword(d.password).score;
      if (sc < 45) { weak++; flagged.push({ id: d.id, site: d.site, reason: "Weak password", severity: "warn" }); }
      if ((counts.get(d.password) || 0) > 1) { reused++; flagged.push({ id: d.id, site: d.site, reason: "Reused password", severity: "warn" }); }
      if (new Date(d.updatedAt).getTime() < ninetyDaysAgo) { stale++; flagged.push({ id: d.id, site: d.site, reason: "Not rotated in 90+ days", severity: "warn" }); }
      if (withBreach) {
        let n = breachCache.get(d.password);
        if (n === undefined) { try { n = await checkPasswordPwned(d.password); } catch { n = 0; } breachCache.set(d.password, n); }
        if ((n || 0) > 0) { breached++; flagged.push({ id: d.id, site: d.site, reason: `Breached ${(n || 0).toLocaleString()}×`, severity: "danger" }); }
      }
    }
    const total = decoded.length;
    const issues = weak + reused + breached + stale;
    const health = total === 0 ? 100 : Math.max(0, Math.round(100 - (issues / (total * 4)) * 100));
    setStats({ total, weak, reused, breached, stale, health, flagged });
  }, [key, userId]);

  useEffect(() => { compute(false); }, [compute]);

  async function runHealthScan() {
    setScanning(true);
    toast.info("Scanning vault against HIBP…");
    await compute(true);
    setScanning(false);
    if (userId) await logActivity(supabase, userId, "health_scan");
    toast.success("Health scan complete");
  }

  if (!stats) return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="skeleton h-9 w-48 mb-2" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="skeleton h-3 w-16 mb-4" />
            <div className="skeleton h-10 w-20" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-1">Dashboard</h1>
          <p className="text-sm text-muted">Your vault security at a glance.</p>
        </div>
        <button onClick={runHealthScan} disabled={scanning} className="btn-primary gap-2">
          <Zap size={15} className={scanning ? "animate-pulse" : ""} />
          {scanning ? "Scanning…" : "Health scan"}
        </button>
      </div>

      {/* Stat cards */}
      <MotionList className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MotionItem>
          <StatCard icon={<KeyRound size={14} />} label="Total" value={stats.total} color="text-fg" desc="Vault entries" />
        </MotionItem>
        <MotionItem>
          <StatCard icon={<AlertTriangle size={14} />} label="Weak" value={stats.weak} color="text-warn" glowColor="#f59e0b" desc="Below score 45" />
        </MotionItem>
        <MotionItem>
          <StatCard icon={<Repeat size={14} />} label="Reused" value={stats.reused} color="text-warn" glowColor="#f59e0b" desc="Duplicate passwords" />
        </MotionItem>
        <MotionItem>
          <StatCard icon={<Shield size={14} />} label="Breached" value={stats.breached} color="text-danger" glowColor="#ef4444" desc="Found in HIBP" />
        </MotionItem>
      </MotionList>

      {/* Health row */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Health gauge card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center" style={{ border: "1px solid rgba(16,185,129,0.15)" }}>
          <HealthGauge score={stats.health} />
        </div>

        {/* Password age card */}
        <div className="glass-card p-6 relative overflow-hidden" style={{ border: "1px solid rgba(245,158,11,0.15)" }}>
          <div
            className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            style={{ background: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.08) 0%, transparent 70%)" }}
          />
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-warn" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-warn opacity-80">Password age</span>
          </div>
          <div className="text-4xl font-black text-warn mb-1.5">{stats.stale}</div>
          <p className="text-xs text-muted mb-4">Not rotated in 90+ days</p>
          <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-warn rounded-full transition-all duration-1000" style={{ width: `${stats.total ? (stats.stale / stats.total) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Security tips card */}
        <div className="glass-card p-6 relative overflow-hidden" style={{ border: "1px solid rgba(16,185,129,0.1)" }}>
          <div
            className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            style={{ background: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
          />
          <div className="flex items-center gap-2 mb-4">
            <Heart size={14} className="text-accent" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent opacity-80">Security tips</span>
          </div>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2.5"><span className="text-accent mt-0.5 shrink-0 font-bold">→</span>Enable 2FA and store TOTP seeds in Authenticator.</li>
            <li className="flex items-start gap-2.5"><span className="text-accent mt-0.5 shrink-0 font-bold">→</span>Run a health scan monthly to catch newly breached passwords.</li>
            <li className="flex items-start gap-2.5"><span className="text-accent mt-0.5 shrink-0 font-bold">→</span>Use the Generator — 20+ chars minimum.</li>
          </ul>
        </div>
      </div>

      {/* Flagged passwords */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <AlertTriangle size={14} className="text-warn" />
          <h2 className="font-bold text-sm">Flagged passwords</h2>
          {stats.flagged.length > 0 && <span className="badge badge-warn">{stats.flagged.length}</span>}
        </div>

        {stats.flagged.length === 0 ? (
          <div className="glass-card py-14 text-center text-muted">
            <div className="text-4xl mb-3">🎉</div>
            <div className="font-semibold text-fg mb-1">Nothing flagged</div>
            <div className="text-sm">Your vault is clean.</div>
          </div>
        ) : (
          <MotionList className="space-y-2">
            {stats.flagged.slice(0, 12).map((f, i) => (
              <MotionItem key={i}>
                <div
                  className="glass-card-sm px-4 py-3.5 flex items-center justify-between gap-4 group transition-all duration-150"
                  style={{ border: `1px solid ${f.severity === "danger" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-5 rounded-full shrink-0 ${f.severity === "danger" ? "bg-danger" : "bg-warn"}`}
                      style={{ boxShadow: f.severity === "danger" ? "0 0 8px rgba(239,68,68,0.4)" : "0 0 8px rgba(245,158,11,0.4)" }}
                    />
                    <div>
                      <div className="font-medium text-sm">{f.site}</div>
                      <div className="text-xs text-muted">{f.reason}</div>
                    </div>
                  </div>
                  <Link href="/vault" className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Fix <ArrowUpRight size={11} />
                  </Link>
                </div>
              </MotionItem>
            ))}
          </MotionList>
        )}
      </div>
    </div>
  );
}
