"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/schemas";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user) {
      await supabase.from("activity_logs").insert({ user_id: data.user.id, action: "login" });
    }
    toast.success("Welcome back");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
      <p className="text-sm text-muted mb-6">Welcome back to your vault.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full py-2.5" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 text-center">
        No account? <Link href="/signup" className="text-accent hover:underline">Create one</Link>
      </p>
    </div>
  );
}
