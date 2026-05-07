"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/schemas";
import { analyzePassword } from "@/lib/strength";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = analyzePassword(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (strength.score < 45) {
      toast.error("Master password is too weak — pick something stronger");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email if confirmation is enabled.");
    router.push("/dashboard");
    router.refresh();
  }

  const barColor =
    strength.score >= 85 ? "bg-success" :
    strength.score >= 65 ? "bg-success/80" :
    strength.score >= 45 ? "bg-warn" :
    strength.score >= 25 ? "bg-warn/80" : "bg-danger";

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-semibold mb-1">Create your vault</h1>
      <p className="text-sm text-muted mb-6">Your password becomes your master key.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Master password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {password && (
            <div className="mt-2">
              <div className="h-1.5 bg-border rounded overflow-hidden">
                <div className={`h-full ${barColor} transition-all`} style={{ width: `${strength.score}%` }} />
              </div>
              <p className="text-xs text-muted mt-1">{strength.label} • {strength.crackTime}</p>
            </div>
          )}
        </div>
        <button className="btn-primary w-full py-2.5" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
