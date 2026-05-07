"use client";
import { useEffect, useState } from "react";
import { useVault } from "@/lib/vault-context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export function UnlockGate({ children }: { children: React.ReactNode }) {
  const { unlocked, unlock, setUserId, userId } = useVault();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [setUserId, supabase]);

  if (unlocked) return <>{children}</>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      toast.error("Loading session...");
      return;
    }
    setBusy(true);
    const ok = await unlock(pw);
    setBusy(false);
    if (!ok) {
      toast.error("Wrong master password");
      return;
    }
    toast.success("Vault unlocked");
    setPw("");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="card p-8 w-full max-w-md">
        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
          <Lock size={22} />
        </div>
        <h2 className="text-xl font-semibold mb-1">Unlock vault</h2>
        <p className="text-sm text-muted mb-6">
          Enter your master password to derive the encryption key. It is never sent to the server.
        </p>
        <input
          autoFocus
          type="password"
          className="input"
          placeholder="Master password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="btn-primary w-full mt-4 py-2.5" disabled={busy || !pw}>
          {busy ? "Unlocking..." : "Unlock"}
        </button>
        <p className="text-xs text-muted mt-4">
          Tip: use the same password as your account login if this is your first time.
        </p>
      </form>
    </div>
  );
}
