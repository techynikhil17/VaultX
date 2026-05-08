import { Sidebar } from "@/components/Sidebar";
import { UnlockGate } from "@/components/UnlockGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden min-w-0">
        <UnlockGate>{children}</UnlockGate>
      </main>
    </div>
  );
}
