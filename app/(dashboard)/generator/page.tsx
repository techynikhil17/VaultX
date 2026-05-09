"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { generatePassword, generateMultiple, type GenOptions } from "@/lib/generator";
import { StrengthMeter } from "@/components/strength/StrengthMeter";
import { CopyButton } from "@/components/CopyButton";

const DEFAULTS: GenOptions = { length: 20, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: true, pronounceable: false };

export default function GeneratorPage() {
  const [opts, setOpts] = useState<GenOptions>(DEFAULTS);
  const [pw, setPw] = useState("");
  const [bulk, setBulk] = useState<string[]>([]);

  function regen() {
    setPw(generatePassword(opts));
    setBulk(generateMultiple(opts, 8));
  }

  useEffect(() => { regen(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [opts]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") { e.preventDefault(); regen(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [opts]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black gradient-text mb-1">Generator</h1>
        <p className="text-sm text-muted">Cryptographically secure via <span className="font-mono text-accent/80">crypto.getRandomValues</span>. Press ⌘G to regenerate.</p>
      </div>

      {/* Main password output */}
      <div className="glass-card p-6 mb-5" style={{ border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex items-center gap-2 mb-5">
          <input
            className="input flex-1 font-mono text-lg tracking-wider"
            style={{ background: "rgba(255,255,255,0.03)", fontSize: "1.05rem" }}
            value={pw}
            readOnly
          />
          <CopyButton value={pw} label="Password" className="btn-secondary shrink-0" />
          <button onClick={regen} className="btn-secondary shrink-0" title="⌘G">
            <RefreshCw size={14} />
          </button>
        </div>
        {pw && <StrengthMeter password={pw} showDNA={true} />}
      </div>

      {/* Options */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Options</h2>

        {/* Length slider */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Length</span>
            <span className="font-mono text-accent text-sm font-bold bg-accent/10 px-2.5 py-0.5 rounded-lg border border-accent/20">{opts.length} chars</span>
          </div>
          <input
            type="range" min={8} max={128} value={opts.length}
            onChange={e => setOpts({ ...opts, length: parseInt(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#10b981" }}
          />
          <div className="flex justify-between text-[10px] text-muted mt-2">
            <span>8</span>
            <span>128</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: "upper", label: "Uppercase A–Z" },
            { key: "lower", label: "Lowercase a–z" },
            { key: "numbers", label: "Numbers 0–9" },
            { key: "symbols", label: "Symbols !@#$%" },
            { key: "excludeAmbiguous", label: "Exclude Il1O0" },
            { key: "pronounceable", label: "Pronounceable" },
          ].map(({ key, label }) => {
            const on = (opts as unknown as Record<string, boolean>)[key];
            return (
              <label key={key} className="flex items-center gap-3 cursor-pointer group py-1.5">
                <div
                  className="w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-150 shrink-0"
                  style={{
                    background: on ? "#10b981" : "rgba(255,255,255,0.04)",
                    borderColor: on ? "#10b981" : "rgba(255,255,255,0.15)",
                    boxShadow: on ? "0 0 8px rgba(16,185,129,0.3)" : undefined,
                  }}
                  onClick={() => setOpts({ ...opts, [key]: !on } as GenOptions)}
                >
                  {on && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm text-muted group-hover:text-fg transition-colors">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bulk suggestions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">More options</h2>
          <button onClick={regen} className="btn-ghost text-xs gap-1.5"><RefreshCw size={11} /> Refresh</button>
        </div>
        <div className="space-y-1">
          {bulk.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-150 group"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <span className="font-mono text-sm text-fg/80 flex-1 truncate">{b}</span>
              <CopyButton value={b} label="Password" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
