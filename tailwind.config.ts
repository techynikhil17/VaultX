import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07071a",
        panel: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        muted: "#6060a0",
        fg: "#e0e0f5",
        accent: "#10b981",
        "accent-2": "#059669",
        success: "#22c55e",
        warn: "#f59e0b",
        danger: "#ef4444",
        "accent-glow": "rgba(16,185,129,0.35)",
      },
      backgroundImage: {
        "mesh": "radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.16) 0%, transparent 50%), radial-gradient(ellipse at 50% 10%, rgba(16,185,129,0.05) 0%, transparent 50%)",
        "mesh-subtle": "radial-gradient(ellipse at 15% 50%, rgba(99,102,241,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(139,92,246,0.08) 0%, transparent 50%)",
        "grid": "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "28px 28px",
      },
      boxShadow: {
        "glow": "0 0 30px rgba(16,185,129,0.22)",
        "glow-sm": "0 0 15px rgba(16,185,129,0.18)",
        "glow-lg": "0 0 60px rgba(16,185,129,0.28)",
        "glow-success": "0 0 20px rgba(34,197,94,0.2)",
        "glow-danger": "0 0 20px rgba(239,68,68,0.2)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      keyframes: {
        "count-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-in": { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "glow-pulse": { "0%,100%": { boxShadow: "0 0 20px rgba(99,102,241,0.15)" }, "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.35)" } },
        "spin-slow": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        "blink": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "page-in": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "count-up": "count-up 0.5s ease forwards",
        "fade-in": "fade-in 0.3s ease forwards",
        "slide-in": "slide-in 0.25s ease forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "spin-slow": "spin-slow 30s linear infinite",
        "blink": "blink 1s step-end infinite",
        "page-in": "page-in 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
