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
      <div className="mb-10">
        <h1 className="text-3xl font-black gradient-text mb-1">Generator</h1>
        <p className="text-sm text-muted">Cryptographically secure via <span className="font-mono text-accent/80">crypto.getRandomValues</span>. Press ⌘G to regenerate.</p>
      </div>

      {/* Main password */}
      <div className="pb-10 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 mb-5">
          <input className="input flex-1 font-mono text-lg tracking-wider" value={pw} readOnly />
          <CopyButton value={pw} label="Password" className="btn-secondary" />
          <button onClick={regen} className="btn-secondary" title="⌘G"><RefreshCw size={14} /></button>
        </div>
        {pw && <StrengthMeter password={pw} showDNA={true} />}
      </div>

      {/* Options */}
      <div className="py-10 border-b border-white/[0.05]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-6">Options</h2>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Length</span>
            <span className="font-mono text-accent text-sm font-bold">{opts.length} chars</span>
          </div>
          <input
            type="range" min={8} max={128} value={opts.length}
            onChange={e => setOpts({ ...opts, length: parseInt(e.target.value) })}
            className="w-full h-1"
          />
          <div className="flex justify-between text-[10px] text-muted mt-1"><span>8</span><span>128</span></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: "upper", label: "Uppercase A–Z" },
            { key: "lower", label: "Lowercase a–z" },
            { key: "numbers", label: "Numbers 0–9" },
            { key: "symbols", label: "Symbols !@#$%" },
            { key: "excludeAmbiguous", label: "Exclude Il1O0" },
            { key: "pronounceable", label: "Pronounceable" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${(opts as any)[key] ? "bg-accent border-accent" : "border-white/20 bg-white/[0.04]"}`}
                onClick={() => setOpts({ ...opts, [key]: !(opts as any)[key] })}
              >
                {(opts as any)[key] && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-muted group-hover:text-fg transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bulk suggestions */}
      <div className="pt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">More options</h2>
          <button onClick={regen} className="btn-ghost text-xs gap-1"><RefreshCw size={11} /> Refresh</button>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {bulk.map((b, i) => (
            <div key={i} className="flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-white/[0.025] transition-colors group">
              <span className="font-mono text-sm text-fg/80 flex-1 truncate">{b}</span>
              <CopyButton value={b} label="Password" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
