"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, KeyRound, Wand2, ShieldAlert, ScrollText,
  LogOut, ShieldCheck, User, ScanLine, FileText, Lock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useVault } from "@/lib/vault-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const supabase = createClient();

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: KeyRound },
  { href: "/totp", label: "Authenticator", icon: ScanLine },
  { href: "/notes", label: "Secure Notes", icon: FileText },
  { href: "/generator", label: "Generator", icon: Wand2 },
  { href: "/breach-check", label: "Breach Check", icon: ShieldAlert },
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lock, unlocked } = useVault();

  async function logout() {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from("activity_logs").insert({ user_id: data.user.id, action: "logout" });
    });
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]" style={{ minHeight: "100vh" }}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow-sm">
          <ShieldCheck size={15} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide text-fg">VaultX</div>
          <div className="text-[9px] text-muted uppercase tracking-widest">Zero-knowledge</div>
        </div>
      </div>

      {/* Shortcut hint */}
      <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 cursor-pointer hover:border-accent/30 transition-colors group"
        onClick={() => { const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }); window.dispatchEvent(e); }}>
        <ShieldCheck size={12} className="text-muted group-hover:text-accent transition-colors" />
        <span className="text-xs text-muted flex-1">Search</span>
        <kbd className="text-[9px] bg-white/5 text-muted px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group relative",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-fg hover:bg-white/[0.04] hover:translate-x-0.5"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-r-full shadow-glow-sm" />
              )}
              <Icon
                size={15}
                className={cn(
                  "transition-all duration-150",
                  active ? "text-accent" : "text-muted group-hover:text-fg group-hover:scale-110"
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        {unlocked && (
          <button
            onClick={() => { lock(); toast.success("Vault locked"); }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-muted hover:text-warn hover:bg-warn/5 transition-all"
          >
            <Lock size={14} />
            <span>Lock vault</span>
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-muted hover:text-fg hover:bg-white/[0.04] transition-all"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
