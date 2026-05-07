"use client";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { checkPasswordPwned } from "@/lib/hibp";
import { logActivity } from "@/lib/activity";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { toast } from "sonner";

export default function BreachCheckPage() {
  const supabase = createClient();
  const { userId } = useVault();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setBusy(true);
    setResult(null);
    try {
      const n = await checkPasswordPwned(pw);
      setResult(n);
      if (userId) await logActivity(supabase, userId, "breach_check", { found: n });
    } catch (err) {
      toast.error("Could not reach HIBP — try again");
    }
    setBusy(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Breach check</h1>
        <p className="text-sm text-muted">
          Uses HaveIBeenPwned's k-Anonymity API. Only the first 5 characters of the SHA-1 hash are sent
          — the password itself never leaves your device.
        </p>
      </div>

      <form onSubmit={check} className="card p-6">
        <label className="label">Password to check</label>
        <div className="relative">
          <input
            className="input pr-10 font-mono"
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter any password"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-fg">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button className="btn-primary mt-4" disabled={busy || !pw}>
          {busy ? "Checking..." : "Check breaches"}
        </button>
      </form>

      {result !== null && (
        <div className="card p-6 mt-4">
          {result === 0 ? (
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-success shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-success">Not found in any known breach</h3>
                <p className="text-sm text-muted mt-1">
                  This password hasn't appeared in HIBP's dataset. That's good — but absence of evidence isn't evidence of absence.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-danger shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-danger">Found in {result.toLocaleString()} breaches</h3>
                <p className="text-sm text-muted mt-1">
                  This password is publicly known. Change it everywhere it's used.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
