"use client";
import { analyzePassword } from "@/lib/strength";
import { Check, X } from "lucide-react";

export function StrengthMeter({ password }: { password: string }) {
  const r = analyzePassword(password);

  const barColor =
    r.score >= 85 ? "bg-success" :
    r.score >= 65 ? "bg-success/80" :
    r.score >= 45 ? "bg-warn" :
    r.score >= 25 ? "bg-warn/80" : "bg-danger";

  const labelColor =
    r.score >= 65 ? "text-success" :
    r.score >= 45 ? "text-warn" : "text-danger";

  const checks = [
    { ok: r.breakdown.length >= 12, label: "12+ characters" },
    { ok: r.breakdown.upper, label: "Uppercase" },
    { ok: r.breakdown.lower, label: "Lowercase" },
    { ok: r.breakdown.number, label: "Number" },
    { ok: r.breakdown.symbol, label: "Symbol" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-sm font-medium ${labelColor}`}>{r.label}</span>
          <span className="text-xs text-muted">{r.score}/100</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all`} style={{ width: `${r.score}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            {c.ok ? <Check size={14} className="text-success" /> : <X size={14} className="text-muted" />}
            <span className={c.ok ? "text-fg" : "text-muted"}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="card p-3">
          <div className="text-muted">Entropy</div>
          <div className="font-mono text-fg">{r.entropyBits} bits</div>
        </div>
        <div className="card p-3">
          <div className="text-muted">Crack time</div>
          <div className="font-mono text-fg">{r.crackTime}</div>
        </div>
      </div>

      {r.warnings.length > 0 && (
        <ul className="space-y-1 text-xs text-warn">
          {r.warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
