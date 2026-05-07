"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const supabase = createClient();
  const { lock, unlocked } = useVault();
  const [email, setEmail] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email || "");
        setCreatedAt(new Date(data.user.created_at).toLocaleDateString());
      }
      const { count: c } = await supabase.from("vault_entries").select("*", { count: "exact", head: true });
      setCount(c || 0);
    })();
  }, [supabase]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="card p-6 space-y-4">
        <Row icon={<Mail size={16} />} label="Email" value={email} />
        <Row icon={<ShieldCheck size={16} />} label="Vault entries" value={String(count)} />
        <Row icon={<Lock size={16} />} label="Account created" value={createdAt} />
        <Row icon={<Lock size={16} />} label="Vault state" value={unlocked ? "Unlocked" : "Locked"} />
      </div>

      <div className="card p-6 mt-4">
        <h2 className="font-semibold mb-2">Actions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { lock(); toast.success("Vault locked"); }}
            className="btn-secondary"
          >
            Lock vault
          </button>
        </div>
        <p className="text-xs text-muted mt-3">
          Locking clears the encryption key from memory. You'll need your master password to unlock.
        </p>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
        <div className="font-medium">{value || "—"}</div>
      </div>
    </div>
  );
}
