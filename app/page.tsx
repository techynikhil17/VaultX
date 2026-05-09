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
  { n: 1, title: "You type your master password",         desc: "Nothing is sent yet. Your input stays in memory, isolated in your browser.", visual: "typing"   },
  { n: 2, title: "PBKDF2-SHA256 stretches your key",     desc: "310,000 iterations run locally — brute force becomes computationally impossible.", visual: "derive"   },
  { n: 3, title: "AES-256-GCM encrypts your vault",      desc: "Your data is locked on-device. The key is never serialized or stored.", visual: "encrypt"  },
  { n: 4, title: "Only encrypted blobs leave your device", desc: "Unreadable ciphertext travels to our servers. No plaintext. No keys. No metadata.", visual: "transfer" },
  { n: 5, title: "A breach exposes nothing",             desc: "Our servers hold gibberish. Without your key, it is mathematically irreversible.", visual: "breach"   },
];

const STEP_DURATION = 4200; // ms per step

// ── Hooks ────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLDivElement>(null);
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

function revealStyle(on: boolean, reduced: boolean | null, extra?: {
  dir?: "left" | "right" | "up"; delay?: number;
}): React.CSSProperties {
  const { dir = "up", delay = 0 } = extra ?? {};
  const dx = dir === "left" ? "-40px" : dir === "right" ? "40px" : "0";
  const dy = dir === "up" ? "28px" : "0";
  return {
    opacity: reduced || on ? 1 : 0,
    transform: reduced || on ? "none" : `translate(${dx},${dy})`,
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    willChange: "transform, opacity",
  };
}

// ── DataFlowVisual (WhatIs section) ──────────────────────────────────────────
const NODES = [
  { label: "YOUR DEVICE",    sub: "key in memory",   color: "rgba(16,185,129,0.55)", fill: "rgba(16,185,129,0.10)" },
  { label: "AES-256-GCM",    sub: "encrypt locally", color: "rgba(16,185,129,0.44)", fill: "rgba(16,185,129,0.07)" },
  { label: "ENCRYPTED BLOB", sub: "ciphertext only", color: "rgba(16,185,129,0.34)", fill: "rgba(16,185,129,0.05)" },
  { label: "VAULTX SERVERS", sub: "sees nothing",    color: "rgba(255,255,255,0.16)", fill: "rgba(255,255,255,0.03)" },
];
const NH = 44, NG = 58, NY0 = 10, NW = 180, CX = 100;

function DataFlowVisual() {
  const total = NY0 + NODES.length * NH + (NODES.length - 1) * NG + 10;
  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
        background:
          "radial-gradient(ellipse at 0% 50%, rgba(16,185,129,0.10) 0%, transparent 60%)," +
          "radial-gradient(ellipse at 100% 50%, rgba(16,185,129,0.07) 0%, transparent 60%)",
      }} />
      <svg viewBox={`0 0 200 ${total}`} className="w-full max-w-[200px]" style={{ overflow: "visible" }}>
        <defs>
          <filter id="df-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {NODES.slice(0, -1).map((_, i) => {
          const y1 = NY0 + i * (NH + NG) + NH;
          const y2 = y1 + NG;
          const pid = `dfp${i}`;
          return (
            <g key={i}>
              <line x1={CX} y1={y1} x2={CX} y2={y2} stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" strokeDasharray="4 3" filter="url(#df-glow)" />
              <path id={pid} d={`M ${CX} ${y1} L ${CX} ${y2}`} fill="none" />
              <circle r="3.5" fill="#10b981" filter="url(#df-glow)">
                <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.67}s`}><mpath href={`#${pid}`} /></animateMotion>
              </circle>
            </g>
          );
        })}
        {NODES.map(({ label, sub, color, fill }, i) => {
          const y = NY0 + i * (NH + NG);
          return (
            <g key={i} filter="url(#df-glow)">
              <rect x={CX - NW / 2} y={y} width={NW} height={NH} rx="9" fill={fill} stroke={color} strokeWidth="1.1" />
              <text x={CX} y={y + 17} textAnchor="middle" fill={color} fontSize="7.5" fontWeight="700" fontFamily="ui-monospace,monospace" letterSpacing="0.04em">{label}</text>
              <text x={CX} y={y + 32} textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize="7" fontFamily="ui-monospace,monospace">{sub}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Step 1: Password Input ────────────────────────────────────────────────────
function PasswordInputVisual() {
  const dotsRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const TARGET = 18;
    let chars = 0, dir = 1, pause = 0, raf: number, last = 0;
    function tick(now: number) {
      if (pause > 0) { pause -= now - last; last = now; raf = requestAnimationFrame(tick); return; }
      const interval = dir === 1 ? 75 : 38;
      if (now - last >= interval) {
        chars = Math.max(0, Math.min(TARGET, chars + dir));
        if (dotsRef.current) dotsRef.current.textContent = "•".repeat(chars);
        if (chars === TARGET) { dir = -1; pause = 1400; }
        else if (chars === 0) { dir = 1; pause = 500; }
        last = now;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Keyboard glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-16 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
      {/* Browser chrome */}
      <div className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          <div className="flex-1 mx-3 h-4 rounded-md bg-white/[0.04] flex items-center justify-center">
            <span className="text-[9px] text-white/20 font-mono">app.vaultx.io/login</span>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="text-[10px] text-white/28 uppercase tracking-widest mb-2">Master Password</div>
          <div className="flex items-center gap-0.5 px-3 py-2.5 rounded-lg font-mono text-base"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <span ref={dotsRef} className="text-white/70 tracking-widest" />
            <span className="inline-block w-0.5 h-5 bg-[#10b981] rounded-sm ml-0.5"
              style={{ animation: "blink 1s step-end infinite" }} />
          </div>
        </div>
      </div>
      {/* Memory badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)", color: "rgba(16,185,129,0.8)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
        Stays in browser memory only — never sent
      </div>
    </div>
  );
}

// ── Step 2: Key Derivation ────────────────────────────────────────────────────
const HEX_KEY = "a3f9c2e8b4d1f7a0c3e9b2d4f8a1c6e0";
const HEX_CHARS = "0123456789abcdef";

function KeyDerivationVisual() {
  const arcRef   = useRef<SVGCircleElement>(null);
  const numRef   = useRef<SVGTSpanElement>(null);
  const hexRef   = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const MAX = 310000, DUR = 3000, PAUSE = 900, TOTAL = DUR + PAUSE;
    let raf: number, start: number | null = null;
    function tick(now: number) {
      if (!start) start = now;
      const elapsed = (now - start) % TOTAL;
      if (elapsed < DUR) {
        const p = elapsed / DUR;
        const e = 1 - Math.pow(1 - p, 3);
        if (arcRef.current) arcRef.current.style.strokeDashoffset = `${100 - e * 100}`;
        if (numRef.current) numRef.current.textContent = Math.floor(e * MAX).toLocaleString();
        if (hexRef.current) {
          const revealed = Math.floor(e * HEX_KEY.length);
          let txt = "";
          for (let i = 0; i < HEX_KEY.length; i++) {
            if (i < revealed) txt += HEX_KEY[i];
            else if (i === revealed) txt += HEX_CHARS[Math.floor(Math.random() * 16)];
            else txt += "·";
          }
          hexRef.current.textContent = txt;
        }
        if (labelRef.current) labelRef.current.style.opacity = e > 0.95 ? "1" : "0";
      } else {
        if (arcRef.current) arcRef.current.style.strokeDashoffset = "100";
        if (numRef.current) numRef.current.textContent = "0";
        if (hexRef.current) hexRef.current.textContent = "·".repeat(HEX_KEY.length);
        if (labelRef.current) labelRef.current.style.opacity = "0";
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <div className="flex items-center gap-6">
        {/* Arc */}
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(16,185,129,0.10)" strokeWidth="7" />
          <circle ref={arcRef} cx="55" cy="55" r="46" fill="none"
            stroke="#10b981" strokeWidth="7" strokeLinecap="round"
            pathLength="100" strokeDasharray="100" strokeDashoffset="100"
            style={{ transform: "rotate(-90deg)", transformOrigin: "55px 55px" }} />
          <text x="55" y="48" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="9" fontFamily="ui-monospace,monospace">iters</text>
          <text x="55" y="65" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700" fontFamily="ui-monospace,monospace">
            <tspan ref={numRef}>0</tspan>
          </text>
        </svg>
        {/* Stats */}
        <div className="flex flex-col gap-1 text-xs">
          <div className="text-white/30">Algorithm</div>
          <div className="text-[#10b981] font-mono font-semibold">PBKDF2-SHA256</div>
          <div className="text-white/30 mt-2">Target</div>
          <div className="text-[#10b981] font-mono font-semibold">310,000 rounds</div>
          <div className="text-white/30 mt-2">Output</div>
          <div className="text-[#10b981] font-mono font-semibold">256-bit key</div>
        </div>
      </div>
      {/* Derived key */}
      <div className="w-full rounded-lg px-3 py-2.5" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1.5">Derived key (256-bit)</div>
        <div ref={hexRef} className="font-mono text-[11px] text-[#10b981] tracking-wide break-all">
          {"·".repeat(HEX_KEY.length)}
        </div>
      </div>
      <p ref={labelRef} className="text-xs text-[#10b981]/70 text-center font-medium"
        style={{ opacity: 0, transition: "opacity 0.5s ease" }}>
        Key derived — stays in memory, never leaves this device
      </p>
    </div>
  );
}

// ── Step 3: Local Encryption ──────────────────────────────────────────────────
const VAULT_ENTRIES = [
  { site: "github.com",  plain: "p@ssw0rd123",  cipher: "8f2a·9c4e·b7f1" },
  { site: "amazon.com",  plain: "Tr0ub4dor!",   cipher: "f3d7·a2c1·e894" },
  { site: "netflix.com", plain: "hunter2!!",    cipher: "a9b3·c7d1·e5f2" },
];

function LocalEncryptionVisual() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    const BREAKS = [0, 1400, 2400], CYCLE = 5000;
    let raf: number, start: number | null = null, cur = 0;
    function tick(now: number) {
      if (!start) start = now;
      const t = (now - start) % CYCLE;
      let p = 0;
      for (let i = BREAKS.length - 1; i >= 0; i--) { if (t >= BREAKS[i]) { p = i; break; } }
      if (p !== cur) { cur = p; setPhase(p as 0 | 1 | 2); }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between text-[9px] text-white/25 uppercase tracking-widest px-1">
        <span>Vault entry</span>
        <span style={{ color: phase >= 2 ? "#10b981" : "rgba(255,255,255,0.25)", transition: "color 0.5s ease" }}>
          {phase >= 2 ? "AES-256-GCM encrypted" : "Plaintext"}
        </span>
      </div>
      {VAULT_ENTRIES.map((e, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 gap-3"
          style={{
            background: phase >= 2 ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${phase >= 2 ? "rgba(16,185,129,0.22)" : "rgba(255,255,255,0.07)"}`,
            transition: "background 0.6s ease, border-color 0.6s ease",
            transitionDelay: `${i * 80}ms`,
          }}>
          <span className="text-xs text-white/50 font-mono shrink-0">{e.site}</span>
          <span className="text-xs font-mono text-right"
            style={{
              color: phase >= 2 ? "#10b981" : phase === 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)",
              transition: "color 0.5s ease",
              transitionDelay: `${i * 80}ms`,
            }}>
            {phase === 0 ? e.plain : phase === 1 ? "░░░░░░░░░" : e.cipher}
          </span>
        </div>
      ))}
      {/* Lock seal */}
      <div className="flex items-center justify-center gap-2 mt-1"
        style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "scale(1)" : "scale(0.8)", transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
          🔒 Vault sealed — key never stored
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Transmission Network ──────────────────────────────────────────────
function TransmissionVisual() {
  return (
    <div className="w-full flex flex-col gap-4">
      <svg viewBox="0 0 340 130" className="w-full">
        <defs>
          <filter id="nw-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="nw-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Curved path — draws itself on mount */}
        <path id="nw-path" d="M 90 65 C 155 25 185 105 250 65"
          fill="none" stroke="rgba(16,185,129,0.20)" strokeWidth="2" strokeLinecap="round"
          pathLength="100" strokeDasharray="100" strokeDashoffset="100"
          style={{ animation: "draw-path 1.2s ease 0.3s forwards" }} />
        {/* Glow copy */}
        <path d="M 90 65 C 155 25 185 105 250 65"
          fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="6" strokeLinecap="round"
          pathLength="100" strokeDasharray="100" strokeDashoffset="100"
          filter="url(#nw-glow)"
          style={{ animation: "draw-path 1.2s ease 0.3s forwards" }} />

        {/* Traveling packets × 3 */}
        {[0, 0.85, 1.7].map((begin, i) => (
          <circle key={i} r="4.5" fill="#10b981" filter="url(#nw-glow)">
            <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${1.6 + begin}s`}>
              <mpath href="#nw-path" />
            </animateMotion>
          </circle>
        ))}

        {/* Device node (left) */}
        <g filter="url(#nw-glow-sm)">
          <rect x="4" y="30" width="84" height="70" rx="10"
            fill="rgba(16,185,129,0.09)" stroke="rgba(16,185,129,0.45)" strokeWidth="1.2" />
        </g>
        <text x="46" y="55" textAnchor="middle" fill="rgba(16,185,129,0.9)" fontSize="8" fontWeight="700" fontFamily="ui-monospace,monospace">YOUR</text>
        <text x="46" y="68" textAnchor="middle" fill="rgba(16,185,129,0.9)" fontSize="8" fontWeight="700" fontFamily="ui-monospace,monospace">DEVICE</text>
        <text x="46" y="85" textAnchor="middle" fill="rgba(16,185,129,0.55)" fontSize="7" fontFamily="ui-monospace,monospace">🔑 key held</text>

        {/* Server node (right) */}
        <rect x="252" y="30" width="84" height="70" rx="10"
          fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
        <text x="294" y="55" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="8" fontWeight="700" fontFamily="ui-monospace,monospace">VAULTX</text>
        <text x="294" y="68" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="8" fontWeight="700" fontFamily="ui-monospace,monospace">SERVER</text>
        <text x="294" y="85" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="7" fontFamily="ui-monospace,monospace">no key held</text>

        {/* Packet label on path */}
        <text x="170" y="44" textAnchor="middle" fill="rgba(16,185,129,0.55)" fontSize="7.5" fontFamily="ui-monospace,monospace">encrypted blob</text>
      </svg>

      {/* Server badge */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.38)" }}>
          🔒 No key · No plaintext · No metadata on server
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Breach Scenario ───────────────────────────────────────────────────
function BreachVisual() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const BREAKS = [0, 900, 2200, 3600], CYCLE = 6000;
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

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Server node */}
      <div className="rounded-xl p-4 text-center transition-all duration-500"
        style={{
          background: phase >= 1 ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${phase >= 1 ? "rgba(239,68,68,0.28)" : "rgba(255,255,255,0.08)"}`,
        }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">VaultX Server — breach detected</span>
          {phase >= 1 && (
            <span className="text-red-400 text-sm font-bold"
              style={{ animation: "shake 0.4s ease both" }}>⚠</span>
          )}
        </div>
        {/* Stored data */}
        <div className="font-mono text-[11px] text-white/20 leading-relaxed space-y-1">
          <div>8f2a1c9e4b2f7d3a0c1e5b8a4f9c…</div>
          <div>f3c7d1a9b2e4c8f0d5a1b6c3e8f1…</div>
          <div>a1b2c3d4e5f6a7b8c9d0e1f2a3b4…</div>
        </div>
      </div>

      {/* Hacker attempt */}
      {phase >= 2 && (
        <div className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)", animation: "blurFadeUp 0.35s ease both" }}>
          <span className="text-lg shrink-0">🕵️</span>
          <div>
            <div className="text-[10px] text-red-400/70 uppercase tracking-widest mb-0.5">Attacker reads server data</div>
            <div className="font-mono text-xs text-red-400/50">8f2a1c9e… [unreadable]</div>
          </div>
        </div>
      )}

      {/* Outcome */}
      {phase >= 3 && (
        <div className="flex flex-col gap-2" style={{ animation: "blurFadeUp 0.4s ease 0.1s both" }}>
          <div className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <span className="text-red-400 text-sm">✗</span>
            <span className="text-xs text-red-400/80 font-medium">Attacker gets: mathematically irreversible gibberish</span>
          </div>
          <div className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <span className="text-[#22c55e] text-sm">✓</span>
            <span className="text-xs text-[#22c55e]/90 font-semibold">Your passwords: safe</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── How It Works Section ──────────────────────────────────────────────────────
const STEP_VISUALS: Record<string, React.ReactNode> = {
  typing:   <PasswordInputVisual />,
  derive:   <KeyDerivationVisual />,
  encrypt:  <LocalEncryptionVisual />,
  transfer: <TransmissionVisual />,
  breach:   <BreachVisual />,
};

function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progKey, setProgKey] = useState(0);
  const { ref: sec, on } = useReveal(0.08);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
      setProgKey((k) => k + 1);
    }, STEP_DURATION);
    return () => clearInterval(t);
  }, [paused]);

  function goTo(i: number) {
    setActive(i);
    setProgKey((k) => k + 1);
    setPaused(true);
  }

  const trackFill = active / (STEPS.length - 1);

  return (
    <section id="how-it-works" ref={sec} className="relative py-24 md:py-32"
      style={{ background: "linear-gradient(to bottom,#07071a,#080b1e)", scrollMarginTop: "80px" }}>
      {/* Animated grid texture */}
      <div className="absolute inset-0 opacity-[0.032] pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16" style={revealStyle(on, reduced)}>
          <p className="text-sm font-semibold tracking-widest text-[#10b981] uppercase mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Watch your data get protected in real time.
          </h2>
          <p className="text-white/35 text-sm">No trust required. The math speaks for itself.</p>
        </div>

        <div className="grid md:grid-cols-[420px_1fr] gap-8 items-start">
          {/* ── Left: Step navigator ── */}
          <div style={revealStyle(on, reduced, { dir: "left", delay: 100 })}>
            <div className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}>
              {/* Vertical track */}
              <div className="absolute left-[13px] top-7 bottom-7 w-px"
                style={{ background: "rgba(255,255,255,0.07)" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                  transform: `scaleY(${trackFill})`,
                  transformOrigin: "top",
                  background: "linear-gradient(to bottom, #10b981, rgba(16,185,129,0.35))",
                  transition: "transform 0.5s ease",
                  willChange: "transform",
                }} />
              </div>

              {/* Steps */}
              <div className="flex flex-col">
                {STEPS.map((s, i) => {
                  const isActive = i === active;
                  return (
                    <button key={s.n} onClick={() => goTo(i)}
                      className="relative flex gap-4 py-3 pr-4 text-left group"
                      style={{ background: "transparent", border: "none", appearance: "none" }}>
                      {/* Number circle */}
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold z-10 mt-0.5 transition-all duration-300"
                        style={{
                          background: isActive ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1.5px solid ${isActive ? "#10b981" : "rgba(255,255,255,0.10)"}`,
                          color: isActive ? "#10b981" : "rgba(255,255,255,0.28)",
                          boxShadow: isActive ? "0 0 12px rgba(16,185,129,0.35)" : "none",
                        }}>
                        {s.n}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug transition-colors duration-200"
                          style={{ color: isActive ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.33)" }}>
                          {s.title}
                        </p>

                        {/* Expandable body */}
                        <div style={{
                          maxHeight: isActive ? "160px" : "0px",
                          overflow: "hidden",
                          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                        }}>
                          <p className="text-xs text-white/32 leading-relaxed mt-2 mb-3">{s.desc}</p>
                          {/* Progress bar — re-keyed to restart animation */}
                          {!paused && (
                            <div key={`pb-${progKey}`} className="h-0.5 rounded-full overflow-hidden"
                              style={{ background: "rgba(16,185,129,0.12)" }}>
                              <div className="h-full w-full rounded-full"
                                style={{
                                  background: "linear-gradient(90deg,#10b981,#34d399)",
                                  animation: `step-progress ${STEP_DURATION}ms linear forwards`,
                                  willChange: "transform",
                                  transform: "translateZ(0)",
                                }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Visualization stage ── */}
          <div className="sticky top-24" style={revealStyle(on, reduced, { dir: "right", delay: 180 })}>
            <div className="rounded-2xl p-6 md:p-7 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)" }} />

              <p className="text-[10px] text-white/22 uppercase tracking-widest font-mono mb-5 relative">
                Step {STEPS[active].n} — Live Preview
              </p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={reduced ? false : { opacity: 0, filter: "blur(8px)", scale: 0.97 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, filter: "blur(8px)", scale: 0.97 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative min-h-[240px] flex flex-col justify-center"
                >
                  {STEP_VISUALS[STEPS[active].visual]}
                </motion.div>
              </AnimatePresence>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mt-5 relative">
                {STEPS.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === active ? "20px" : "6px",
                      height: "6px",
                      background: i === active ? "#10b981" : "rgba(255,255,255,0.12)",
                    }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section id="security" className="relative py-24 md:py-32 bg-[#07071a]" style={{ scrollMarginTop: "80px" }}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }} />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div ref={left} style={revealStyle(lo, reduced, { dir: "left" })}>
            <p className="text-sm font-semibold tracking-widest text-[#10b981] uppercase mb-4">What is VaultX?</p>
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
                    opacity: reduced || lo ? 1 : 0,
                    transform: reduced || lo ? "none" : "translateX(-20px)",
                    transition: `opacity 0.6s ease ${lo ? i * 65 + 220 : 0}ms, transform 0.6s ease ${lo ? i * 65 + 220 : 0}ms`,
                    willChange: "transform, opacity",
                  }}>
                  <span className="text-base leading-none mt-0.5 shrink-0">{b.icon}</span>
                  <span className="text-sm text-white/50 leading-relaxed">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div ref={right} style={revealStyle(ro, reduced, { dir: "right", delay: 120 })}>
            <DataFlowVisual />
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
    <section id="features" ref={ref} className="py-24 md:py-32 bg-[#07071a]" style={{ scrollMarginTop: "80px" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14" style={revealStyle(on, reduced)}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything you need. Nothing you don't.</h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">Built for security without sacrificing usability.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, name, desc }, i) => (
            <div key={name} className="rounded-2xl p-6 cursor-default"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: reduced || on ? 1 : 0,
                transform: reduced || on ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms`,
                willChange: "transform, opacity",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-4px)"; el.style.borderColor = "rgba(16,185,129,0.24)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.borderColor = "rgba(255,255,255,0.06)"; }}>
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
        <p className="text-xs text-white/22 text-center">Zero-knowledge · Open source · AES-256-GCM encrypted</p>
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

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <style>{`
        @keyframes step-progress {
          from { transform: translateX(-100%) translateZ(0); }
          to   { transform: translateX(0)     translateZ(0); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
        @keyframes draw-path {
          to { stroke-dashoffset: 0; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-4px) rotate(-3deg); }
          40%     { transform: translateX(4px)  rotate(3deg); }
          60%     { transform: translateX(-3px) rotate(-2deg); }
          80%     { transform: translateX(3px)  rotate(1deg); }
        }
      `}</style>

      {/* Fixed background video */}
      <video
        className="fixed inset-0 h-full w-full object-cover opacity-40 pointer-events-none select-none"
        src={VIDEO_URL} autoPlay muted loop playsInline aria-hidden="true"
        style={{ zIndex: -1, transform: "translateZ(0)", willChange: "transform" }}
      />

      {/* Fixed navbar */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled ? "rgba(7,7,26,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition: "background 0.3s ease",
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
              <a key={l.label} href={l.href}
                onClick={(e) => handleNavClick(e, l.href)}
                className="text-sm text-white/50 hover:text-white/90 transition-colors cursor-pointer">
                {l.label}
              </a>
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
          <div className="md:hidden liquid-glass mx-4 mb-4 rounded-2xl"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="p-5 space-y-4">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href}
                  className="block text-sm text-white/60 hover:text-white transition-colors"
                  onClick={(e) => handleNavClick(e, l.href)}>
                  {l.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <Link href="/login" className="block text-center text-sm text-white/60 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="btn-primary block w-full text-sm py-2.5 text-center" onClick={() => setMenuOpen(false)}>Get started →</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative h-screen">
        <div ref={sentinelRef} className="absolute top-20 left-0 w-px h-px" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" style={{
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 45%)",
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none" style={{
          background: "linear-gradient(to top, #07071a 0%, rgba(7,7,26,0.88) 38%, transparent 100%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(16,185,129,0.12) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 100% 0%,  rgba(16,185,129,0.08) 0%, transparent 45%)",
        }} />

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
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 0 28px rgba(16,185,129,0.35), 0 1px 3px rgba(0,0,0,0.4)" }}>
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

      <WhatIsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
