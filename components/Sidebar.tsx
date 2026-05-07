"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, KeyRound, Wand2, ShieldAlert, ScrollText, LogOut, ShieldCheck, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: KeyRound },
  { href: "/generator", label: "Generator", icon: Wand2 },
  { href: "/breach-check", label: "Breach Check", icon: ShieldAlert },
  { href: "/activity", label: "Activity Log", icon: ScrollText },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("activity_logs").insert({ user_id: u.user.id, action: "logout" });
    }
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-border flex flex-col">
      <div className="px-5 py-5 border-b border-border flex items-center gap-2">
        <ShieldCheck className="text-accent" size={22} />
        <span className="font-semibold">VaultX</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active ? "bg-accent/10 text-accent" : "text-fg/80 hover:bg-panel hover:text-fg"
              )}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-fg/80 hover:bg-panel hover:text-fg">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
