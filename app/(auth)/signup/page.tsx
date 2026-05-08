"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/schemas";
import { analyzePassword } from "@/lib/strength";
import { getRoast } from "@/lib/roasts";
import { getSuggestions } from "@/lib/suggestions";
import { ShieldCheck, Loader2, Flame } from "lucide-react";

const supabase = createClient();

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-warm dashboard before user clicks
  useEffect(() => { router.prefetch("/dashboard"); }, [router]);

  const strength = analyzePassword(password);
  const roast = password ? getRoast(password, strength) : null;
  const suggestions = password ? getSuggestions(password, strength) : [];

  const barColor =
    strength.score >= 85 ? "bg-success shadow-glow-success" :
    strength.score >= 65 ? "bg-emerald-400" :
    strength.score >= 45 ? "bg-warn" :
    strength.score >= 25 ? "bg-orange-500" : "bg-danger";

  const labelColor =
    strength.score >= 65 ? "text-success" :
    strength.score >= 45 ? "text-warn" : "text-danger";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (strength.score < 45) { toast.error("Master password is too weak — pick something stronger"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Keep spinner through navigation — component unmounts anyway
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
      <h1 className="text-2xl font-bold mb-1">Create your vault</h1>
      <p className="text-sm text-muted mb-7">Your account password <em>is</em> your encryption key — choose wisely.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label">Master password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Make it unguessable" required />
          {password && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold ${labelColor}`}>{strength.label}</span>
                <span className="text-muted font-mono">{strength.score}/100 · {strength.crackTime}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${strength.score}%` }} />
              </div>
              {roast && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-warn/5 border border-warn/20 text-xs text-warn/90 animate-fade-in">
                  <Flame size={13} className="shrink-0 mt-0.5" />
                  <span>{roast}</span>
                </div>
              )}
              {suggestions.length > 0 && (
                <ul className="space-y-1 text-xs text-muted pl-1">
                  {suggestions.map((s, i) => <li key={i}>→ {s}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
        <button className="btn-primary w-full py-3 mt-2" disabled={loading}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : "Create vault →"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
