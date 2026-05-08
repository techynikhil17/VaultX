"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, Menu, X, ArrowRight,
  Lock, Shield, Eye, Zap, RefreshCw, Key,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4";

const NAV_LINKS = [
  { label: "Features",     href: "#features" },
  { label: "Security",     href: "#security" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Docs",         href: "#docs" },
];

const HERO_PILLS = [
  { icon: <Lock size={11} />, label: "AES-256-GCM encrypted" },
  { icon: <Eye  size={11} />, label: "Zero-knowledge" },
  { icon: <Zap  size={11} />, label: "Breach detection" },
];

const FEATURES = [
  { Icon: Lock,      name: "Zero-Knowledge Encryption", desc: "Your key never leaves your device. Not even once." },
  { Icon: Shield,    name: "AES-256-GCM",               desc: "Military-grade encryption applied locally before sync." },
  { Icon: Eye,       name: "Breach Monitoring",         desc: "Check passwords against 10B+ leaks via k-Anonymity." },
  { Icon: Zap,       name: "Instant Autofill",          desc: "One click to fill logins across any site or app." },
  { Icon: RefreshCw, name: "Cross-Device Sync",         desc: "Encrypted sync across all your devices in real time." },
  { Icon: Key,       name: "Password Generator",        desc: "Generate strong, unique passwords with one click." },
];

const STEPS = [
  { n: 1, title: "You type your master password",          desc: "Your master password never leaves your device. It's only held in memory — never written to disk or sent anywhere.",                                     visual: "typing"   },
  { n: 2, title: "PBKDF2-SHA256 derives a 256-bit key",   desc: "310,000 iterations of PBKDF2-SHA256 turn your password into a strong encryption key. The key stays in memory only.",                                  visual: "derive"   },
  { n: 3, title: "AES-256-GCM encrypts your vault locally", desc: "Every entry is encrypted individually using AES-256-GCM with a unique IV — before touching the network.",                                            visual: "encrypt"  },
  { n: 4, title: "Only encrypted blobs reach our servers", desc: "We receive unreadable ciphertext. No plaintext, no keys, no metadata. VaultX servers are a dumb blob store.",                                         visual: "transfer" },
  { n: 5, title: "A server breach exposes nothing",        desc: "Even if our servers were fully compromised, attackers get encrypted blobs they cannot decrypt without your key.",                                      visual: "breach"   },
];

// ── IntersectionObserver reveal hook ────────────────────────────────────────
function useReveal(threshold = 0.18) {
  const ref  = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, on };
}

// ── Reveal style helpers ─────────────────────────────────────────────────────
function revealStyle(on: boolean, reduced: boolean | null, extra?: {
  dir?: "left" | "right" | "up"; delay?: number;
}): React.CSSProperties {
  const { dir = "up", delay = 0 } = extra ?? {};
  const dx = dir === "left" ? "-40px" : dir === "right" ? "40px" : "0";
  const dy = dir === "up"   ? "28px"  : "0";
  return {
    opacity:    reduced || on ? 1 : 0,
    transform:  reduced || on ? "none" : `translate(${dx},${dy})`,
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    willChange: "transform, opacity",
  };
}

// ── DataFlowVisual ────────────────────────────────────────────────────────────
const NODES = [
  { label: "YOUR DEVICE",     sub: "key in memory",     color: "rgba(16,185,129,0.5)",  fill: "rgba(16,185,129,0.10)" },
  { label: "AES-256-GCM",     sub: "encrypt locally",   color: "rgba(16,185,129,0.42)", fill: "rgba(16,185,129,0.07)" },
  { label: "ENCRYPTED BLOB",  sub: "ciphertext only",   color: "rgba(16,185,129,0.34)", fill: "rgba(16,185,129,0.05)" },
  { label: "VAULTX SERVERS",  sub: "sees nothing",      color: "rgba(255,255,255,0.14)", fill: "rgba(255,255,255,0.03)" },
];
const NODE_H = 44, NODE_GAP = 60, NODE_Y0 = 10, NODE_W = 180, CX = 100;

function DataFlowVisual() {
  const totalH = NODE_Y0 + NODES.length * NODE_H + (NODES.length - 1) * NODE_GAP + 10;
  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Ambient edge glows */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
        background:
          "radial-gradient(ellipse at 0% 50%, rgba(16,185,129,0.10) 0%, transparent 60%)," +
          "radial-gradient(ellipse at 100% 50%, rgba(16,185,129,0.07) 0%, transparent 60%)",
      }} />
      {/* Dot grid texture */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }} />

      <svg viewBox={`0 0 200 ${totalH}`} className="w-full max-w-[200px]" style={{ overflow: "visible" }}>
        <defs>
          <filter id="df-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Connecting dashed lines + traveling dots */}
        {NODES.slice(0, -1).map((_, i) => {
          const y1 = NODE_Y0 + i * (NODE_H + NODE_GAP) + NODE_H;
          const y2 = y1 + NODE_GAP;
          const pid = `dfp${i}`;
          return (
            <g key={i}>
              <line x1={CX} y1={y1} x2={CX} y2={y2}
                stroke="rgba(16,185,129,0.28)" strokeWidth="1.5" strokeDasharray="4 3"
                filter="url(#df-glow)" />
              <path id={pid} d={`M ${CX} ${y1} L ${CX} ${y2}`} fill="none" />
              <circle r="3.5" fill="#10b981" filter="url(#df-glow)">
                <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.67}s`}>
                  <mpath href={`#${pid}`} />
                </animateMotion>
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map(({ label, sub, color, fill }, i) => {
          const y = NODE_Y0 + i * (NODE_H + NODE_GAP);
          return (
            <g key={i} filter="url(#df-glow)">
              <rect x={CX - NODE_W / 2} y={y} width={NODE_W} height={NODE_H}
                rx="9" fill={fill} stroke={color} strokeWidth="1.1" />
              <text x={CX} y={y + 17} textAnchor="middle"
                fill={color} fontSize="7.5" fontWeight="700" fontFamily="ui-monospace,monospace"
                letterSpacing="0.04em">
                {label}
              </text>
              <text x={CX} y={y + 32} textAnchor="middle"
                fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="ui-monospace,monospace">
                {sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Step visuals ─────────────────────────────────────────────────────────────
function TypingVisual() {
  const dotsRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const TARGET = 18;
    let chars = 0, dir = 1, pause = 0, raf: number, last = 0;
    function tick(now: number) {
      if (pause > 0) { pause -= now - last; last = now; raf = requestAnimationFrame(tick); return; }
      const interval = dir === 1 ? 80 : 40;
      if (now - last >= interval) {
        chars = Math.max(0, Math.min(TARGET, chars + dir));
        if (dotsRef.current) dotsRef.current.textContent = "•".repeat(chars);
        if (chars === TARGET) { dir = -1; pause = 1200; }
        else if (chars === 0)  { dir =  1; pause = 400; }
        last = now;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <div className="w-full rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Master Password</div>
        <div className="flex items-center gap-0.5 font-mono text-sm min-h-[20px]">
          <span ref={dotsRef} className="text-white/75" />
          <span className="inline-block w-0.5 h-4 bg-[#10b981] rounded-sm" style={{ animation: "blink 1s step-end infinite" }} />
        </div>
      </div>
      <p className="text-xs text-white/30 text-center">Exists only in browser memory — never written to disk</p>
    </div>
  );
}

function DeriveVisual() {
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const MAX = 310000, DUR = 2600, PAUSE = 700, TOTAL = DUR + PAUSE;
    let raf: number, start: number | null = null;
    function tick(now: number) {
      if (!start) start = now;
      const elapsed = (now - start) % TOTAL;
      if (elapsed < DUR) {
        const p = elapsed / DUR;
        const e = 1 - Math.pow(1 - p, 3);
        if (numRef.current) numRef.current.textContent = Math.floor(e * MAX).toLocaleString();
        if (barRef.current) barRef.current.style.transform = `translateX(${(e - 1) * 100}%) translateZ(0)`;
      } else {
        if (numRef.current) numRef.current.textContent = "0";
        if (barRef.current) barRef.current.style.transform = "translateX(-100%) translateZ(0)";
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <div className="w-full rounded-xl px-5 py-4 text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">PBKDF2 iterations</div>
        <div className="text-3xl font-bold font-mono text-[#10b981] tabular-nums"><span ref={numRef}>0</span></div>
        <div className="text-[10px] text-white/25 mt-0.5">/ 310,000</div>
        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(16,185,129,0.12)" }}>
          <div ref={barRef} className="h-full w-full rounded-full"
            style={{ background: "linear-gradient(90deg,#10b981,#34d399)", transform: "translateX(-100%) translateZ(0)", willChange: "transform" }} />
        </div>
      </div>
      <p className="text-xs text-white/30 text-center">256-bit key stays in memory — never stored or transmitted</p>
    </div>
  );
}

function EncryptVisual() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const CYCLE = 4200, BREAKS = [0, 900, 2000, 3600];
    let raf: number, start: number | null = null, cur = 0;
    function tick(now: number) {
      if (!start) start = now;
      const t = (now - start) % CYCLE;
      let p = 0;
      for (let i = BREAKS.length - 1; i >= 0; i--) { if (t >= BREAKS[i]) { p = i; break; } }
      if (p !== cur) { cur = p; setPhase(p); }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labels  = ["Plaintext", "Encrypting…", "AES-256-GCM Output", "Sent to server"];
  const values  = ["github.com · p@ssw0rd123", "░░░░░░░░░░░░░░░░░░", "8f2a…9e4b (ciphertext)", "8f2a…9e4b (ciphertext)"];
  const isEnc   = phase >= 2;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
      <div className="w-full rounded-xl px-4 py-3 text-center"
        style={{
          background:   isEnc ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)",
          border:       `1px solid ${isEnc ? "rgba(16,185,129,0.28)" : "rgba(255,255,255,0.08)"}`,
          transition:   "background 0.5s ease, border-color 0.5s ease",
        }}>
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">{labels[phase]}</div>
        <div className="font-mono text-xs min-h-[1.2rem]"
          style={{ color: isEnc ? "#10b981" : "rgba(255,255,255,0.55)", transition: "color 0.4s ease" }}>
          {values[phase]}
        </div>
      </div>
      {phase === 3 && (
        <div className="text-[11px] text-[#10b981]/70 text-center" style={{ animation: "blurFadeUp 0.5s ease both" }}>
          Unique IV · GCM authentication tag · Zero plaintext on wire
        </div>
      )}
    </div>
  );
}

function TransferVisual() {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
      <svg viewBox="0 0 280 80" className="w-full">
        <defs>
          <filter id="tf-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="4"   y="20" width="74" height="40" rx="8" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.4)" strokeWidth="1" filter="url(#tf-glow)" />
        <text x="41"  y="37" textAnchor="middle" fill="rgba(16,185,129,0.85)" fontSize="7.5" fontWeight="700" fontFamily="ui-monospace,monospace">YOUR</text>
        <text x="41"  y="50" textAnchor="middle" fill="rgba(16,185,129,0.85)" fontSize="7.5" fontWeight="700" fontFamily="ui-monospace,monospace">DEVICE</text>
        <line x1="82" y1="40" x2="200" y2="40" stroke="rgba(16,185,129,0.22)" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="141" y="31" textAnchor="middle" fill="rgba(16,185,129,0.55)" fontSize="7" fontFamily="ui-monospace,monospace">encrypted blob</text>
        <circle r="5" fill="#10b981" filter="url(#tf-glow)">
          <animateMotion dur="1.9s" repeatCount="indefinite">
            <mpath href="#tf-path"/>
          </animateMotion>
        </circle>
        <path id="tf-path" d="M 82 40 L 200 40" fill="none"/>
        <rect x="202" y="20" width="74" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
        <text x="239" y="37" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="700" fontFamily="ui-monospace,monospace">VAULTX</text>
        <text x="239" y="50" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="700" fontFamily="ui-monospace,monospace">SERVER</text>
      </svg>
      <p className="text-xs text-white/30 text-center">Only unreadable ciphertext ever leaves your device</p>
    </div>
  );
}

function BreachVisual() {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <div className="w-full rounded-xl p-4 text-center" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)" }}>
        <div className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Server contents after full breach</div>
        <div className="font-mono text-[11px] text-white/20 leading-relaxed space-y-1">
          <div>8f2a1c9e4b2f7d3a0c1e5b8a4f9c…</div>
          <div>f3c7d1a9b2e4c8f0d5a1b6c3e8f…</div>
          <div>a1b2c3d4e5f6a7b8c9d0e1f2a3b…</div>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(34,197,94,0.10)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.20)" }}>
          ✓ Zero plaintext exposed
        </div>
      </div>
    </div>
  );
}

const STEP_PANELS: Record<string, React.ReactNode> = {
  typing:   <TypingVisual />,
  derive:   <DeriveVisual />,
  encrypt:  <EncryptVisual />,
  transfer: <TransferVisual />,
  breach:   <BreachVisual />,
};

// ── WhatIs section ────────────────────────────────────────────────────────────
const BULLETS = [
  { icon: "🔒", text: "Your master password derives a 256-bit key that never leaves your browser" },
  { icon: "🛡️", text: "We store encrypted blobs, not passwords — a server breach exposes nothing" },
  { icon: "👁️", text: "Check 10B+ breached passwords without ever sending your password" },
];

function WhatIsSection() {
  const { ref: left,  on: lo } = useReveal();
  const { ref: right, on: ro } = useReveal();
  const reduced = useReducedMotion();

  return (
    <section id="security" className="relative py-24 md:py-32 bg-[#07071a]">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }} />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left */}
          <div ref={left} style={revealStyle(lo, reduced, { dir: "left" })}>
            <p className="text-sm font-semibold tracking-widest text-[#10b981] uppercase mb-4">
              What is VaultX?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
              A password manager that actually keeps secrets.
            </h2>
            <p className="text-white/45 leading-relaxed mb-8 text-sm md:text-base">
              VaultX is a zero-knowledge password manager. Think of it as a vault where
              only you hold the key — we never see it, store it, or even know it exists.
              Every password is locked with military-grade encryption right on your device
              before it ever reaches our servers.
            </p>
            <ul className="space-y-4">
              {BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3"
                  style={{
                    opacity:    reduced || lo ? 1 : 0,
                    transform:  reduced || lo ? "none" : "translateX(-20px)",
                    transition: `opacity 0.6s ease ${lo ? i * 65 + 220 : 0}ms, transform 0.6s ease ${lo ? i * 65 + 220 : 0}ms`,
                    willChange: "transform, opacity",
                  }}>
                  <span className="text-base leading-none mt-0.5 shrink-0">{b.icon}</span>
                  <span className="text-sm text-white/50 leading-relaxed">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — animated data flow */}
          <div ref={right} style={revealStyle(ro, reduced, { dir: "right", delay: 120 })}>
            <DataFlowVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works section ──────────────────────────────────────────────────────
function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref: sec, on } = useReveal(0.10);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="how-it-works" ref={sec} className="relative py-24 md:py-32"
      style={{ background: "linear-gradient(to bottom, #07071a, #080b1c)" }}>
      {/* Faint grid texture */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14" style={revealStyle(on, reduced, { dir: "up" })}>
          <p className="text-sm font-semibold tracking-widest text-[#10b981] uppercase mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Watch your data get protected in real time.
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 items-start">
          {/* Steps list */}
          <div className="space-y-1.5" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <button key={s.n} onClick={() => { setActive(i); setPaused(true); }}
                  className="w-full text-left rounded-xl px-4 py-3.5"
                  style={{
                    background:   isActive ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                    border:       `1px solid ${isActive ? "rgba(16,185,129,0.32)" : "rgba(255,255,255,0.05)"}`,
                    opacity:      reduced || on ? 1 : 0,
                    transform:    reduced || on ? "none" : "translateX(-20px)",
                    transition:   `background 0.2s ease, border-color 0.2s ease, opacity 0.6s ease ${i * 75}ms, transform 0.6s ease ${i * 75}ms`,
                    willChange:   "transform, opacity",
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                      style={{
                        background: isActive ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.05)",
                        color:      isActive ? "#10b981"                : "rgba(255,255,255,0.28)",
                        border:     `1px solid ${isActive ? "rgba(16,185,129,0.38)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                      {s.n}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug"
                        style={{ color: isActive ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)" }}>
                        {s.title}
                      </p>
                      {isActive && (
                        <p className="text-xs text-white/30 leading-relaxed mt-1.5"
                          style={{ animation: "blurFadeUp 0.35s ease both" }}>
                          {s.desc}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Autoplay progress bar — transform-only, no width animation */}
                  {isActive && !paused && (
                    <div className="mt-3 h-px rounded-full overflow-hidden" style={{ background: "rgba(16,185,129,0.10)" }}>
                      <div className="h-full w-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg,#10b981,#34d399)",
                          animation:  "step-progress 4.5s linear forwards",
                          transform:  "translateZ(0)",
                          willChange: "transform",
                        }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live preview panel */}
          <div className="sticky top-24"
            style={revealStyle(on, reduced, { dir: "right", delay: 180 })}>
            <div className="rounded-2xl p-6 md:p-8"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-5">
                Step {STEPS[active].n} — Live Preview
              </p>
              <AnimatePresence mode="wait">
                <motion.div key={active}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced  ? undefined : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}>
                  <div className="min-h-[180px] flex items-center justify-center">
                    {STEP_PANELS[STEPS[active].visual]}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features section ──────────────────────────────────────────────────────────
function FeaturesSection() {
  const { ref, on } = useReveal(0.10);
  const reduced = useReducedMotion();

  return (
    <section id="features" ref={ref} className="py-24 md:py-32 bg-[#07071a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14" style={revealStyle(on, reduced, { dir: "up" })}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">
            Built for security without sacrificing usability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, name, desc }, i) => (
            <div key={name}
              className="rounded-2xl p-6 cursor-default"
              style={{
                background:   "rgba(255,255,255,0.025)",
                border:       "1px solid rgba(255,255,255,0.06)",
                opacity:      reduced || on ? 1 : 0,
                transform:    reduced || on ? "translateY(0)" : "translateY(24px)",
                transition:   `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms, border-color 0.2s ease`,
                willChange:   "transform, opacity",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform    = "translateY(-4px)";
                el.style.borderColor  = "rgba(16,185,129,0.24)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform    = "translateY(0)";
                el.style.borderColor  = "rgba(255,255,255,0.06)";
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.18)" }}>
                <Icon size={16} className="text-[#10b981]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{name}</h3>
              <p className="text-xs text-white/38 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#07071a] border-t border-white/[0.05] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <ShieldCheck size={10} className="text-white" />
          </div>
          <span className="text-xs text-white/35 font-medium">VaultX</span>
        </div>
        <p className="text-xs text-white/22 text-center">
          Zero-knowledge · Open source · AES-256-GCM encrypted
        </p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Security"].map((l) => (
            <a key={l} href="#" className="text-xs text-white/28 hover:text-white/60 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── Root page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for navbar frost — no scroll event listener
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Inline keyframes — no external CSS needed */}
      <style>{`
        @keyframes step-progress {
          from { transform: translateX(-100%) translateZ(0); }
          to   { transform: translateX(0)     translateZ(0); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
      `}</style>

      {/* Fixed background video — own GPU composite layer */}
      <video
        className="fixed inset-0 h-full w-full object-cover opacity-40 pointer-events-none select-none"
        src={VIDEO_URL}
        autoPlay muted loop playsInline
        aria-hidden="true"
        style={{ zIndex: -1, transform: "translateZ(0)", willChange: "transform" }}
      />

      {/* Fixed navbar */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{
          background:          scrolled ? "rgba(7,7,26,0.82)" : "transparent",
          backdropFilter:      scrolled ? "blur(18px) saturate(180%)" : "none",
          WebkitBackdropFilter:scrolled ? "blur(18px) saturate(180%)" : "none",
          borderBottom:        scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition:          "background 0.3s ease",
        }}>
        <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.4)]">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm text-white/90 group-hover:text-white transition-colors">VaultX</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-white/50 hover:text-white/90 transition-colors">{l.label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white/90 transition-colors px-3 py-1.5">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2">Get started</Link>
          </div>

          <button className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden liquid-glass mx-4 mb-4 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="p-5 space-y-4">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href}
                  className="block text-sm text-white/60 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}>{l.label}</a>
              ))}
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <Link href="/login" className="block text-center text-sm text-white/60 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="btn-primary block w-full text-sm py-2.5 text-center" onClick={() => setMenuOpen(false)}>Get started →</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero section ── */}
      <section className="relative h-screen">
        {/* Sentinel: when this exits viewport, navbar frosts */}
        <div ref={sentinelRef} className="absolute top-20 left-0 w-px h-px" aria-hidden="true" />

        {/* Bottom blur overlay masked to lower half */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backdropFilter:       "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage:            "linear-gradient(to top, black 0%, transparent 45%)",
          WebkitMaskImage:      "linear-gradient(to top, black 0%, transparent 45%)",
        }} />
        {/* Dark gradient — grounds hero content */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none" style={{
          background: "linear-gradient(to top, #07071a 0%, rgba(7,7,26,0.88) 38%, transparent 100%)",
        }} />
        {/* Corner glows — not behind headline */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(16,185,129,0.12) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 100% 0%,  rgba(16,185,129,0.08) 0%, transparent 45%)",
        }} />

        {/* Hero content — pinned bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="max-w-4xl mx-auto px-6 pb-14 md:pb-16">
            <div className="flex flex-wrap gap-2 mb-7 justify-center md:justify-start animate-blur-fade-up" style={{ animationDelay: "0ms" }}>
              {HERO_PILLS.map((p) => (
                <span key={p.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-white/55 border border-white/10"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-[#10b981]">{p.icon}</span>
                  {p.label}
                </span>
              ))}
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight text-white mb-5 text-center md:text-left animate-blur-fade-up"
              style={{ animationDelay: "120ms" }}>
              Your passwords,{" "}
              <span className="gradient-text" style={{ filter: "drop-shadow(0 0 22px rgba(16,185,129,0.45))" }}>
                encrypted
              </span>
              <br className="hidden sm:block" />
              {" "}before they leave your device.
            </h1>

            <p className="text-base md:text-lg text-white/45 max-w-2xl mb-8 text-center md:text-left leading-relaxed animate-blur-fade-up"
              style={{ animationDelay: "220ms" }}>
              Zero-knowledge AES-256-GCM vault with real-time breach detection,
              TOTP codes, and secure notes — all decrypted only on your device.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-blur-fade-up"
              style={{ animationDelay: "320ms" }}>
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-transform duration-150 active:scale-[0.96] hover:-translate-y-px"
                style={{
                  background:  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow:   "0 0 28px rgba(16,185,129,0.35), 0 1px 3px rgba(0,0,0,0.4)",
                }}>
                Create your vault free <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white/60 border border-white/[0.10] hover:text-white/90 hover:border-white/20 transition-colors duration-150"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                Sign in
              </Link>
            </div>

            <p className="mt-6 text-xs text-white/25 text-center md:text-left animate-blur-fade-up"
              style={{ animationDelay: "420ms" }}>
              Open source · No master password stored · Your key never leaves your device
            </p>
          </div>
        </div>
      </section>

      {/* ── Below-fold ── */}
      <WhatIsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
