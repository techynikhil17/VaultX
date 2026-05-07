"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { LogIn, LogOut, Plus, Pencil, Trash2, Shield, Heart, Eye } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  login: <LogIn size={14} className="text-success" />,
  logout: <LogOut size={14} className="text-muted" />,
  vault_create: <Plus size={14} className="text-accent" />,
  vault_update: <Pencil size={14} className="text-accent" />,
  vault_delete: <Trash2 size={14} className="text-danger" />,
  vault_view: <Eye size={14} className="text-muted" />,
  breach_check: <Shield size={14} className="text-warn" />,
  health_scan: <Heart size={14} className="text-accent" />,
};

interface Log {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export default function ActivityPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<Log[] | null>(null);

  useEffect(() => {
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setLogs((data as Log[]) || []));
  }, [supabase]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Activity log</h1>
        <p className="text-sm text-muted">Recent events on your account.</p>
      </div>

      {!logs ? (
        <div className="card p-8 animate-pulse h-32" />
      ) : logs.length === 0 ? (
        <div className="card p-10 text-center text-muted">No activity yet.</div>
      ) : (
        <div className="card divide-y divide-border">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-panel border border-border flex items-center justify-center">
                {ICONS[log.action] ?? <Eye size={14} />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{prettyAction(log.action)}</div>
                {Object.keys(log.metadata || {}).length > 0 && (
                  <div className="text-xs text-muted font-mono">{JSON.stringify(log.metadata)}</div>
                )}
              </div>
              <div className="text-xs text-muted">{formatDate(log.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function prettyAction(a: string) {
  return a.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
