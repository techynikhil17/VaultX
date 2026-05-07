import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { VaultProvider } from "@/lib/vault-context";
import { UnlockGate } from "@/components/UnlockGate";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <VaultProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <UnlockGate>{children}</UnlockGate>
        </main>
      </div>
    </VaultProvider>
  );
}
