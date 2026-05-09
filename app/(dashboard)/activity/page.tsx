"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { LogIn, LogOut, Plus, Pencil, Trash2, Shield, Heart, Eye, ScrollText } from "lucide-react";
import { MotionList, MotionItem } from "@/components/motion";

const ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  login: { icon: <LogIn size={13} />, color: "text-success", bg: "rgba(34,197,94,0.1)" },
  logout: { icon: <LogOut size={13} />, color: "text-muted", bg: "rgba(255,255,255,0.04)" },
  vault_create: { icon: <Plus size={13} />, color: "text-accent", bg: "rgba(16,185,129,0.1)" },
  vault_update: { icon: <Pencil size={13} />, color: "text-accent", bg: "rgba(16,185,129,0.08)" },
  vault_delete: { icon: <Trash2 size={13} />, color: "text-danger", bg: "rgba(239,68,68,0.1)" },
  vault_view: { icon: <Eye size={13} />, color: "text-muted", bg: "rgba(255,255,255,0.04)" },
  breach_check: { icon: <Shield size={13} />, color: "text-warn", bg: "rgba(245,158,11,0.1)" },
  health_scan: { icon: <Heart size={13} />, color: "text-accent", bg: "rgba(16,185,129,0.1)" },
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
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card-sm flex items-center gap-4 p-4">
              <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-40 mb-2" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card py-16 text-center text-muted">
          <ScrollText size={36} className="mx-auto mb-3 opacity-20" />
          <div className="text-sm">No activity yet.</div>
        </div>
      ) : (
        <MotionList className="space-y-2">
          {logs.map(log => {
            const style = ICONS[log.action] ?? { icon: <Eye size={13} />, color: "text-muted", bg: "rgba(255,255,255,0.04)" };
            const meta = Object.entries(log.metadata || {}).filter(([, v]) => v !== null && v !== undefined);
            return (
              <MotionItem key={log.id}>
                <div
                  className="glass-card-sm px-4 py-3.5 flex items-start gap-4 transition-all duration-150 group"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.color}`}
                    style={{ background: style.bg }}
                  >
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{prettyAction(log.action)}</div>
                    {meta.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {meta.map(([k, v]) => (
                          <span
                            key={k}
                            className="text-[10px] px-2 py-0.5 rounded-md font-mono"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <span className="text-muted">{k}:</span>{" "}
                            <span className="text-fg/70">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted shrink-0 mt-0.5">{formatDate(log.created_at)}</div>
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
