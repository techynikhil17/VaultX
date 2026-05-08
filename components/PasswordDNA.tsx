"use client";

const TYPE_COLORS: Record<string, { bg: string; label: string }> = {
  lower:   { bg: "#6366f1", label: "Lowercase" },
  upper:   { bg: "#8b5cf6", label: "Uppercase" },
  digit:   { bg: "#f59e0b", label: "Digit" },
  symbol:  { bg: "#10b981", label: "Symbol" },
  space:   { bg: "#ef4444", label: "Space" },
  other:   { bg: "#6b7280", label: "Other" },
};

function charType(ch: string) {
  if (/[a-z]/.test(ch)) return "lower";
  if (/[A-Z]/.test(ch)) return "upper";
  if (/[0-9]/.test(ch)) return "digit";
  if (ch === " ") return "space";
  if (/[^a-zA-Z0-9]/.test(ch)) return "symbol";
  return "other";
}

export function PasswordDNA({ password }: { password: string }) {
  if (!password) return null;

  const chars = password.split("");
  const counts: Record<string, number> = {};
  chars.forEach(c => { const t = charType(c); counts[t] = (counts[t] || 0) + 1; });

  return (
    <div className="space-y-3">
      <div className="label">Password DNA</div>
      <div className="flex flex-wrap gap-1">
        {chars.map((ch, i) => {
          const t = charType(ch);
          const col = TYPE_COLORS[t];
          return (
            <div
              key={i}
              className="relative w-5 h-5 rounded cursor-pointer transition-transform hover:scale-125 hover:z-10 group"
              style={{ background: col.bg, opacity: 0.85, boxShadow: `0 0 6px ${col.bg}55` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-[#0d0d24] border border-white/[0.12] rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  <span className="font-mono text-fg">{ch === " " ? "·" : ch}</span>
                  <span className="text-muted ml-1">pos {i + 1} · {col.label}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-[#0d0d24] border-r border-b border-white/[0.12] rotate-45 mx-auto -mt-1" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_COLORS).filter(([k]) => counts[k]).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-muted">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: v.bg }} />
            <span>{v.label} ({counts[k]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
