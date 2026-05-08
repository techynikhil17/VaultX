import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-8 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow-sm">
            <ShieldCheck size={15} className="text-white" />
          </div>
          <span className="font-bold">VaultX</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
