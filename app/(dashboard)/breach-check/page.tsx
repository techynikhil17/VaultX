"use client";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
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

      <form onSubmit={check} className="pb-10 border-b border-white/[0.05] mb-8">
        <label className="label">Password to check</label>
        <div className="flex gap-2">
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
        <p className="text-[10px] text-muted mt-3">
          We compute SHA-1(password), send only the first 5 hex chars, and match locally.
        </p>
      </form>

      {result !== null && (
        <div className="animate-slide-in">
          {result === 0 ? (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={20} className="text-success" />
              </div>
              <div>
                <h3 className="font-bold text-success mb-1">Not found in any known breach</h3>
                <p className="text-sm text-muted">This password doesn't appear in HIBP's database of {">"}800M compromised credentials. Good — but use it only in one place.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert size={20} className="text-danger" />
              </div>
              <div>
                <h3 className="font-bold text-danger mb-1">Found in {result.toLocaleString()} data breaches</h3>
                <p className="text-sm text-muted mb-3">This password is publicly known and used in credential stuffing attacks. Change it everywhere — now.</p>
                <div className="px-4 py-3 rounded-xl border border-danger/20 bg-danger/5 text-xs text-danger/80">
                  Appeared {result.toLocaleString()} times across known breach databases. Attackers have this in their wordlists.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
