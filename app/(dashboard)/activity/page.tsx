"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { LogIn, LogOut, Plus, Pencil, Trash2, Shield, Heart, Eye, ScrollText } from "lucide-react";
import { MotionList, MotionItem } from "@/components/motion";

const ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  login: { icon: <LogIn size={13} />, color: "text-success" },
  logout: { icon: <LogOut size={13} />, color: "text-muted" },
  vault_create: { icon: <Plus size={13} />, color: "text-accent" },
  vault_update: { icon: <Pencil size={13} />, color: "text-accent" },
  vault_delete: { icon: <Trash2 size={13} />, color: "text-danger" },
  vault_view: { icon: <Eye size={13} />, color: "text-muted" },
  breach_check: { icon: <Shield size={13} />, color: "text-warn" },
  health_scan: { icon: <Heart size={13} />, color: "text-accent" },
};

interface Log { id: string; action: string; metadata: Record<string, unknown>; created_at: string; }

const supabase = createClient();

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[] | null>(null);

  useEffect(() => {
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setLogs((data as Log[]) || []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black gradient-text mb-1">Activity</h1>
        <p className="text-sm text-muted">Every login, vault change, and breach check — timestamped.</p>
      </div>

      {!logs ? (
        <div className="divide-y divide-white/[0.04]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-40 mb-1.5" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <ScrollText size={36} className="mx-auto mb-3 opacity-20" />
          <div className="text-sm">No activity yet.</div>
        </div>
      ) : (
        <MotionList className="divide-y divide-white/[0.04]">
          {logs.map(log => {
            const style = ICONS[log.action] ?? { icon: <Eye size={13} />, color: "text-muted" };
            return (
              <MotionItem key={log.id}>
                <div className="flex items-center gap-4 py-3.5 -mx-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                  <div className={`w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 ${style.color}`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{prettyAction(log.action)}</div>
                    {Object.keys(log.metadata || {}).length > 0 && (
                      <div className="text-xs text-muted font-mono mt-0.5 truncate">{JSON.stringify(log.metadata)}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted shrink-0">{formatDate(log.created_at)}</div>
                </div>
              </MotionItem>
            );
          })}
        </MotionList>
      )}
    </div>
  );
}

function prettyAction(a: string) {
  return a.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
