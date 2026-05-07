import Link from "next/link";
import { ShieldCheck, Lock, KeyRound, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-accent" size={24} />
          <span className="font-semibold text-lg">VaultX</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Login</Link>
          <Link href="/signup" className="btn-primary">Get started</Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-fg to-muted bg-clip-text text-transparent">
            Your passwords. Encrypted on your device.
          </h1>
          <p className="text-lg text-muted mb-10 max-w-2xl mx-auto">
            VaultX is a zero-knowledge password manager. Vault entries are encrypted with AES-256-GCM
            in your browser before they ever reach the server. Strength analysis, breach checks, and
            a secure generator built in.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">Create your vault</Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">Sign in</Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 grid md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
        <Feature icon={<Lock />} title="Client-side encryption" desc="AES-256-GCM with PBKDF2 (310k iters). Master password never leaves your device." />
        <Feature icon={<KeyRound />} title="Strong generator" desc="Customizable, pronounceable, and entropy-aware password generation." />
        <Feature icon={<Activity />} title="Health dashboard" desc="Find weak, reused, and breached passwords with one health scan." />
      </section>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5">
      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted">{desc}</p>
    </div>
  );
}
