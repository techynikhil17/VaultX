"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/schemas";
import { ShieldCheck, Loader2 } from "lucide-react";

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-warm /dashboard so Turbopack compiles it before the user even clicks
  useEffect(() => { router.prefetch("/dashboard"); }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      if (error.message === "Invalid login credentials") {
        toast.error("Invalid email or password — no account yet? Create one free.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    if (data.user) supabase.from("activity_logs").insert({ user_id: data.user.id, action: "login" });
    // refresh() clears the Next.js router cache so the middleware sees the new
    // auth cookie immediately — without it, push() can race the cookie write in production
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <div className="card p-8 border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow-sm">
          <ShieldCheck size={15} className="text-white" />
        </div>
        <span className="font-bold">VaultX</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-muted mb-7">Sign in to access your encrypted vault.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label">Master password</label>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required />
        </div>
        <button className="btn-primary w-full py-3 mt-2" disabled={loading}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign in →"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        No account? <Link href="/signup" className="text-accent hover:underline">Create one free</Link>
      </p>
    </div>
  );
}
