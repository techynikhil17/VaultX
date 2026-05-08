"use client";
import { analyzePassword } from "@/lib/strength";
import { getRoast } from "@/lib/roasts";
import { getSuggestions } from "@/lib/suggestions";
import { Check, X, Flame, Lightbulb } from "lucide-react";
import { PasswordDNA } from "@/components/PasswordDNA";

export function StrengthMeter({ password, showDNA = true }: { password: string; showDNA?: boolean }) {
  const r = analyzePassword(password);
  const roast = getRoast(password, r);
  const suggestions = getSuggestions(password, r);

  const barColor =
    r.score >= 85 ? "bg-success" :
    r.score >= 65 ? "bg-emerald-400" :
    r.score >= 45 ? "bg-warn" :
    r.score >= 25 ? "bg-orange-500" : "bg-danger";

  const labelColor =
    r.score >= 65 ? "text-success" :
    r.score >= 45 ? "text-warn" : "text-danger";

  const checks = [
    { ok: r.breakdown.length >= 12, label: "12+ chars" },
    { ok: r.breakdown.upper, label: "Uppercase" },
    { ok: r.breakdown.lower, label: "Lowercase" },
    { ok: r.breakdown.number, label: "Number" },
    { ok: r.breakdown.symbol, label: "Symbol" },
  ];

  return (
    <div className="space-y-4">
      {/* Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-bold ${labelColor}`}>{r.label}</span>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-mono">{r.entropyBits}b</span>
            <span>·</span>
            <span>{r.crackTime}</span>
            <span>·</span>
            <span className="font-semibold">{r.score}/100</span>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${r.score}%` }} />
        </div>
      </div>

      {/* Checks */}
      <div className="grid grid-cols-5 gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex flex-col items-center gap-1 text-[10px] ${c.ok ? "text-success" : "text-muted/50"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${c.ok ? "bg-success/10" : "bg-white/5"}`}>
              {c.ok ? <Check size={11} /> : <X size={11} />}
            </div>
            {c.label}
          </div>
        ))}
      </div>

      {/* DNA */}
      {showDNA && <PasswordDNA password={password} />}

      {/* Roast */}
      {roast && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 animate-fade-in">
          <Flame size={14} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300/90 leading-relaxed">{roast}</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted">
              <Lightbulb size={11} className="shrink-0 mt-0.5 text-accent" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings (non-roast) */}
      {r.warnings.length > 0 && r.score >= 45 && (
        <ul className="space-y-1 text-xs text-warn/80">
          {r.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
        </ul>
      )}
    </div>
  );
}
