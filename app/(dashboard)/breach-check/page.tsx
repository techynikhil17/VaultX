"use client";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { checkPasswordPwned } from "@/lib/hibp";
import { logActivity } from "@/lib/activity";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { toast } from "sonner";

const supabase = createClient();

export default function BreachCheckPage() {
  const { userId } = useVault();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setBusy(true); setResult(null);
    try {
      const n = await checkPasswordPwned(pw);
      setResult(n);
      if (userId) await logActivity(supabase, userId, "breach_check", { found: n });
    } catch { toast.error("Could not reach HIBP — check your connection"); }
    setBusy(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black gradient-text mb-1">Breach Check</h1>
        <p className="text-sm text-muted">
          Uses HaveIBeenPwned k-Anonymity — only the first 5 chars of SHA-1 are sent. Your password never leaves this device.
        </p>
      </div>

      {/* Input card */}
      <div className="glass-card p-6 mb-6" style={{ border: "1px solid rgba(16,185,129,0.12)" }}>
        <form onSubmit={check}>
          <label className="label">Password to check</label>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                className="input pr-10 font-mono"
                type={show ? "text" : "password"}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Enter any password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button className="btn-primary shrink-0" disabled={busy || !pw}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
              {busy ? "Checking…" : "Check"}
            </button>
          </div>

          {/* Privacy note */}
          <div
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs text-muted"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Lock size={11} className="text-accent shrink-0 mt-0.5" />
            <span>We compute <span className="font-mono text-accent/80">SHA-1(password)</span>, send only the first 5 hex chars, and match locally. Your plaintext password never leaves this browser.</span>
          </div>
        </form>
      </div>

      {/* Result */}
      {result !== null && (
        <div className="animate-slide-in">
          {result === 0 ? (
            <div
              className="glass-card p-6 flex items-start gap-4"
              style={{ border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.04)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(34,197,94,0.12)", boxShadow: "0 0 20px rgba(34,197,94,0.15)" }}
              >
                <ShieldCheck size={22} className="text-success" />
              </div>
              <div>
                <h3 className="font-bold text-success mb-1.5">Not found in any known breach</h3>
                <p className="text-sm text-muted">This password doesn&apos;t appear in HIBP&apos;s database of {">"}800M compromised credentials. Good — but use it only in one place.</p>
              </div>
            </div>
          ) : (
            <div
              className="glass-card p-6"
              style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.03)" }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(239,68,68,0.12)", boxShadow: "0 0 20px rgba(239,68,68,0.15)" }}
                >
                  <ShieldAlert size={22} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-danger mb-1.5">Found in {result.toLocaleString()} data breaches</h3>
                  <p className="text-sm text-muted">This password is publicly known and used in credential stuffing attacks. Change it everywhere — now.</p>
                </div>
              </div>
              <div
                className="px-4 py-3 rounded-xl text-xs text-danger/80"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                Appeared <span className="font-bold">{result.toLocaleString()}</span> times across known breach databases. Attackers have this in their wordlists.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
