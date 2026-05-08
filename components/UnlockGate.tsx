"use client";
import { useEffect, useState } from "react";
import { useVault } from "@/lib/vault-context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

const supabase = createClient();

export function UnlockGate({ children }: { children: React.ReactNode }) {
  const { unlocked, unlock, setUserId, userId } = useVault();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
      setResolving(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (unlocked) return <>{children}</>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { toast.error("Session not ready — please wait"); return; }
    setBusy(true);
    const ok = await unlock(pw);
    setBusy(false);
    if (!ok) { toast.error("Wrong master password"); return; }
    toast.success("Vault unlocked");
    setPw("");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Glow ring */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow animate-glow-pulse">
              <Lock size={32} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-accent-2 blur-xl opacity-30 -z-10" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="card p-8 border-white/10">
          <h2 className="text-2xl font-bold mb-1 gradient-text">Unlock your vault</h2>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            Your master password derives the encryption key locally. It never leaves your device.
          </p>

          {resolving ? (
            <div className="flex items-center justify-center py-6 gap-2 text-muted text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading session…</span>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="label">Master password</label>
                <input
                  autoFocus
                  type="password"
                  className="input text-base"
                  placeholder="Enter your master password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
              </div>
              <button className="btn-primary w-full py-3 text-base" disabled={busy || !pw}>
                {busy ? <><Loader2 size={16} className="animate-spin" /> Deriving key…</> : <><ShieldCheck size={16} /> Unlock</>}
              </button>
              <p className="text-xs text-muted mt-4 text-center">
                PBKDF2-SHA256 · 310,000 iterations · AES-256-GCM
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
