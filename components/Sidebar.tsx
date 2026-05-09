"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, KeyRound, Wand2, ShieldAlert, ScrollText,
  LogOut, ShieldCheck, User, ScanLine, FileText, Lock, Search
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
    <aside
      className="w-56 shrink-0 flex flex-col"
      style={{
        minHeight: "100vh",
        background: "rgba(7,7,26,0.75)",
        backdropFilter: "blur(14px) saturate(130%)",
        WebkitBackdropFilter: "blur(14px) saturate(130%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow-sm">
          <ShieldCheck size={15} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide text-fg">VaultX</div>
          <div className="text-[9px] text-muted uppercase tracking-widest">Zero-knowledge</div>
        </div>
      </div>

      {/* Search shortcut */}
      <div
        className="mx-3 mb-4 px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-150 group"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(16,185,129,0.35)";
          el.style.background = "rgba(16,185,129,0.04)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(255,255,255,0.07)";
          el.style.background = "rgba(255,255,255,0.03)";
        }}
      >
        <Search size={12} className="text-muted group-hover:text-accent transition-colors shrink-0" />
        <span className="text-xs text-muted flex-1">Search vault</span>
        <kbd className="text-[9px] bg-white/[0.06] text-muted px-1.5 py-0.5 rounded border border-white/[0.08] shrink-0">⌘K</kbd>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative overflow-hidden",
                active ? "text-accent" : "text-muted hover:text-fg"
              )}
              style={{
                borderLeft: active ? "3px solid #10b981" : "3px solid transparent",
                background: active ? "rgba(16,185,129,0.06)" : undefined,
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "";
              }}
            >
              {active && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
                />
              )}
              <Icon
                size={15}
                className={cn(
                  "shrink-0 transition-all duration-150 relative z-10",
                  active ? "text-accent" : "group-hover:text-fg group-hover:scale-110"
                )}
              />
              <span className="font-medium relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div
        className="p-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {unlocked && (
          <button
            onClick={() => { lock(); toast.success("Vault locked"); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-muted transition-all duration-150"
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "#f59e0b";
              el.style.background = "rgba(245,158,11,0.06)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "";
              el.style.background = "";
            }}
          >
            <Lock size={14} className="shrink-0" />
            <span>Lock vault</span>
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-muted transition-all duration-150"
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = "#e0e0f5";
            el.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = "";
            el.style.background = "";
          }}
        >
          <LogOut size={14} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
