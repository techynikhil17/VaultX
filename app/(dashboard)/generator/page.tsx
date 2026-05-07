"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { generatePassword, generateMultiple, type GenOptions } from "@/lib/generator";
import { StrengthMeter } from "@/components/strength/StrengthMeter";
import { CopyButton } from "@/components/CopyButton";

const DEFAULTS: GenOptions = {
  length: 20,
  upper: true,
  lower: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
  pronounceable: false,
};

export default function GeneratorPage() {
  const [opts, setOpts] = useState<GenOptions>(DEFAULTS);
  const [pw, setPw] = useState("");
  const [bulk, setBulk] = useState<string[]>([]);

  function regen() {
    setPw(generatePassword(opts));
    setBulk(generateMultiple(opts, 6));
  }

  useEffect(() => { regen(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [opts]);

  // Ctrl+G regenerates.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        regen();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [opts]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Password generator</h1>
        <p className="text-sm text-muted">Cryptographically secure (uses crypto.getRandomValues). Press Ctrl+G to regenerate.</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <input className="input flex-1 font-mono text-base" value={pw} readOnly />
          <CopyButton value={pw} label="Password" className="btn-secondary" />
          <button onClick={regen} className="btn-secondary" title="Regenerate (Ctrl+G)"><RefreshCw size={14} /></button>
        </div>
        <StrengthMeter password={pw} />
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Options</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm">Length</label>
              <span className="font-mono text-sm">{opts.length}</span>
            </div>
            <input
              type="range" min={8} max={128} value={opts.length}
              onChange={(e) => setOpts({ ...opts, length: parseInt(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Toggle checked={opts.upper} onChange={(v) => setOpts({ ...opts, upper: v })} label="Uppercase (A-Z)" />
            <Toggle checked={opts.lower} onChange={(v) => setOpts({ ...opts, lower: v })} label="Lowercase (a-z)" />
            <Toggle checked={opts.numbers} onChange={(v) => setOpts({ ...opts, numbers: v })} label="Numbers (0-9)" />
            <Toggle checked={opts.symbols} onChange={(v) => setOpts({ ...opts, symbols: v })} label="Symbols (!@#...)" />
            <Toggle checked={opts.excludeAmbiguous} onChange={(v) => setOpts({ ...opts, excludeAmbiguous: v })} label="Exclude ambiguous (Il1O0)" />
            <Toggle checked={!!opts.pronounceable} onChange={(v) => setOpts({ ...opts, pronounceable: v })} label="Pronounceable" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">More options</h2>
          <button onClick={regen} className="btn-secondary text-xs"><RefreshCw size={12} /> Refresh</button>
        </div>
        <ul className="space-y-2">
          {bulk.map((b, i) => (
            <li key={i} className="flex items-center gap-2 font-mono text-sm">
              <span className="flex-1 truncate">{b}</span>
              <CopyButton value={b} label="Password" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-accent rounded"
      />
      {label}
    </label>
  );
}
