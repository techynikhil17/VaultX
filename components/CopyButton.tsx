"use client";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  value: string;
  label?: string;
  autoClearMs?: number;
  className?: string;
}

export function CopyButton({ value, label, autoClearMs = 30000, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label || "Value"} copied — clipboard auto-clears in ${Math.round(autoClearMs / 1000)}s`);
      setTimeout(() => setCopied(false), 2000);
      if (autoClearMs > 0) {
        setTimeout(async () => {
          try {
            const current = await navigator.clipboard.readText();
            if (current === value) await navigator.clipboard.writeText("");
          } catch {
            // Clipboard read may be blocked — best effort.
          }
        }, autoClearMs);
      }
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <button onClick={copy} className={className || "btn-ghost p-2"} title={`Copy ${label || ""}`} type="button">
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </button>
  );
}
