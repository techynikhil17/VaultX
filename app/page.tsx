"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { ShieldCheck, Lock, KeyRound, Activity, Zap, Eye, Globe, FileText, Shield, Database, Cpu, Check, ArrowDown } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Emerald palette (no blue) ─────────────────────────────
const EM = "#10b981";
const EM2 = "#059669";
const EM_LT = "#34d399";
const EM_GLOW = "rgba(16,185,129,0.22)";
const EM_GLOW_SM = "rgba(16,185,129,0.12)";

// ─── Scroll-reveal helper ──────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return { ref, inView };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── NAV ──────────────────────────────────────────────────
function Nav() {
  const router = useRouter();
  return (
    <header className="px-6 md:px-10 py-4 flex items-center justify-between border-b border-white/[0.05] sticky top-0 z-30 backdrop-blur-md bg-[#07071a]/75">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${EM}, ${EM2})`, boxShadow: `0 0 16px ${EM_GLOW_SM}` }}>
          <ShieldCheck size={16} className="text-white" />
        </div>
        <span className="font-bold tracking-wide text-fg">VaultX</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-sm text-muted hover:text-fg transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.04]"
          onMouseDown={() => router.push("/login")} onTouchStart={() => router.push("/login")}>
          Sign in
        </button>
        <button className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:-translate-y-px active:scale-95"
          style={{ background: `linear-gradient(135deg, ${EM}, ${EM2})`, boxShadow: `0 0 20px ${EM_GLOW_SM}` }}
          onMouseDown={() => router.push("/signup")} onTouchStart={() => router.push("/signup")}>
          Get started
        </button>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────
function Hero() {
  const router = useRouter();
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Animated orbs */}
      <div className="pointer-events-none">
        <div className="absolute top-1/4 left-[20%] w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, ${EM_GLOW} 0%, transparent 65%)`, filter: "blur(50px)", animation: "orbA 9s ease-in-out infinite" }} />
        <div className="absolute bottom-1/4 right-[15%] w-[400px] h-[400px] rounded-full"
          style={{ background: `radial-gradient(circle, rgba(5,150,105,0.16) 0%, transparent 65%)`, filter: "blur(60px)", animation: "orbB 12s ease-in-out infinite" }} />
        <div className="absolute top-[10%] right-[30%] w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 65%)`, filter: "blur(40px)", animation: "orbC 7s ease-in-out infinite" }} />
      </div>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.035) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />

      <div className="relative max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium mb-10"
          style={{ borderColor: `${EM}30`, background: `${EM}09`, color: EM_LT }}>
          <Zap size={11} />
          AES-256-GCM · PBKDF2-SHA256 · Zero-knowledge · k-Anonymity
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-5 leading-[1.04]">
          <span className="text-fg/90">Your passwords.</span>
          <br />
          <span style={{
            background: `linear-gradient(120deg, ${EM} 0%, ${EM_LT} 40%, ${EM} 80%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            backgroundSize: "200% auto", animation: "shimmer 4s linear infinite"
          }}>
            Unbreachable.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Everything encrypted on your device before it touches a server.{" "}
          <span className="text-fg/55">Your master password never leaves your browser. Not once.</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.48 }}
          className="flex items-center justify-center gap-3 flex-wrap mb-16">
          <button className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${EM}, ${EM2})`, boxShadow: `0 0 32px ${EM_GLOW}` }}
            onMouseDown={() => router.push("/signup")} onTouchStart={() => router.push("/signup")}>
            Get started free →
          </button>
          <a href="#how-it-works"
            className="px-8 py-3.5 rounded-xl text-base font-medium text-fg/65 hover:text-fg border border-white/[0.08] hover:border-white/[0.14] transition-all hover:-translate-y-0.5">
            See how it works ↓
          </a>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="flex items-center justify-center gap-8 md:gap-14 flex-wrap border-t border-white/[0.05] pt-10">
          {[
            { value: "AES-256-GCM", label: "Encryption standard" },
            { value: "310,000", label: "PBKDF2 iterations" },
            { value: "Zero", label: "Server plaintext" },
            { value: "k-Anon", label: "Breach API method" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl md:text-2xl font-black" style={{ color: EM }}>{value}</div>
              <div className="text-xs text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <div className="text-[10px] text-muted uppercase tracking-widest">Scroll</div>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={14} style={{ color: `${EM}70` }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── WHAT IS VAULTX ───────────────────────────────────────
function WhatIsSection() {
  return (
    <section className="relative px-6 md:px-10 py-28 overflow-hidden">
      {/* Section depth — angled gradient + circuit grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 75% 50%, ${EM}07 0%, transparent 55%)` }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(${EM}04 1px, transparent 1px), linear-gradient(90deg, ${EM}04 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 md:gap-16 items-center">
          {/* Left — text */}
          <div>
            <Reveal>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: EM }}>What is VaultX?</div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-fg/90">
                A password manager that actually keeps{" "}
                <span style={{
                  background: `linear-gradient(120deg, ${EM}, ${EM_LT})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  filter: `drop-shadow(0 0 18px ${EM}55)`,
                }}>secrets.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-muted leading-relaxed mb-8 text-[17px]">
                VaultX is a zero-knowledge password manager — think of it as a vault where only you hold the key,
                and we never even see it. Every password is locked with military-grade encryption right on your
                device before it reaches our servers.
              </p>
            </Reveal>

            {/* Enhanced bullet cards */}
            <div className="space-y-3">
              {[
                { icon: <Lock size={16} />, title: "Client-side key derivation", text: "Your master password derives a 256-bit AES key via PBKDF2. It never leaves your browser — not even as a network request." },
                { icon: <Shield size={16} />, title: "Zero-knowledge storage", text: "We store only encrypted blobs. A full server breach exposes nothing — there's no plaintext to steal." },
                { icon: <Eye size={16} />, title: "Private breach detection", text: "Check 10B+ leaked passwords with k-Anonymity: only 5 SHA-1 chars are sent, never the password itself." },
              ].map(({ icon, title, text }, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 + i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ borderColor: `${EM}28`, background: `${EM}07`, x: 4 }}
                  className="flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-default"
                  style={{ borderColor: "rgba(255,255,255,0.055)", background: "rgba(255,255,255,0.018)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${EM}18`, color: EM, boxShadow: `0 0 16px ${EM}35` }}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-fg/90 mb-1">{title}</div>
                    <div className="text-sm text-muted leading-relaxed">{text}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — animated encryption flow card */}
          <Reveal delay={0.1} className="flex items-center justify-center">
            <EncryptionFlowCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function EncryptionFlowCard() {
  const pass = "Tr0ub4dor&3!xK9";
  const [typed, setTyped] = useState(0);
  const [hexTick, setHexTick] = useState(0);

  // Typing loop: type forward → pause → erase → pause → repeat
  useEffect(() => {
    let pos = 0, fwd = true, stopped = false;
    const tick = () => {
      if (stopped) return;
      if (fwd) {
        pos++;
        setTyped(pos);
        if (pos >= pass.length) { fwd = false; setTimeout(tick, 1800); }
        else setTimeout(tick, 115);
      } else {
        pos--;
        setTyped(pos);
        if (pos <= 0) { fwd = true; setTimeout(tick, 500); }
        else setTimeout(tick, 48);
      }
    };
    const id = setTimeout(tick, 600);
    return () => { stopped = true; clearTimeout(id); };
  }, []);

  // Hex bytes stream
  useEffect(() => {
    const id = setInterval(() => setHexTick(t => (t + 1) % 9), 190);
    return () => clearInterval(id);
  }, []);

  const hexBytes = ["a3f2", "c91b", "8e4d", "7052", "f6a1", "b3c8", "9d2e", "4f71"];

  return (
    <div className="relative w-full max-w-sm">
      {/* Ambient glow */}
      <div className="absolute -inset-8 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${EM}16 0%, transparent 65%)`, filter: "blur(28px)" }} />

      <div className="relative rounded-2xl border overflow-hidden"
        style={{ borderColor: `${EM}22`, background: "rgba(4,4,18,0.97)" }}>
        {/* Terminal chrome */}
        <div className="px-4 py-3 border-b flex items-center gap-2"
          style={{ borderColor: `${EM}10`, background: `${EM}08` }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: `${EM}80` }} />
          <span className="ml-2 text-[10px] font-mono" style={{ color: `${EM}60` }}>vaultx://encryption · live</span>
          <div className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: `${EM}50` }}>
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>●</motion.span>
            running
          </div>
        </div>

        {/* Subtle circuit grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(${EM}04 1px, transparent 1px), linear-gradient(90deg, ${EM}04 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />

        <div className="relative p-5 space-y-3">
          {/* Stage 1: Password */}
          <div className="p-4 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: EM, color: "#fff" }}>1</div>
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: `${EM}65` }}>Master password</span>
            </div>
            <div className="font-mono text-sm h-5 flex items-center" style={{ color: EM }}>
              {"•".repeat(typed)}
              {typed < pass.length && (
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.55, repeat: Infinity }}>|</motion.span>
              )}
            </div>
            <div className="mt-2 text-[10px] font-mono" style={{ color: `${EM}45` }}>
              {typed >= pass.length ? "✓ in memory · 0 network requests sent" : "typing…"}
            </div>
          </div>

          {/* Connector 1 */}
          <div className="flex items-center gap-3 pl-3">
            <div className="w-0.5 h-6 rounded-full" style={{ background: `linear-gradient(to bottom, ${EM}55, ${EM}22)` }} />
            <span className="text-[10px] font-mono" style={{ color: `${EM}45` }}>PBKDF2-SHA256 · 310,000 iterations</span>
          </div>

          {/* Stage 2: Key */}
          <div className="p-4 rounded-xl border" style={{ borderColor: `${EM}22`, background: `${EM}07` }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: EM, color: "#fff" }}>2</div>
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: `${EM}65` }}>256-bit AES key derived</span>
            </div>
            <div className="font-mono text-xs leading-6 break-all" style={{ color: EM_LT }}>
              {hexBytes.map((b, i) => (
                <span key={i} className="mr-1.5" style={{ opacity: i <= hexTick % (hexBytes.length + 1) ? 1 : 0.15, transition: "opacity 0.25s" }}>{b}</span>
              ))}
              <span className="text-muted/25">···</span>
            </div>
          </div>

          {/* Connector 2 */}
          <div className="flex items-center gap-3 pl-3">
            <div className="w-0.5 h-6 rounded-full" style={{ background: `linear-gradient(to bottom, ${EM}55, ${EM}22)` }} />
            <span className="text-[10px] font-mono" style={{ color: `${EM}45` }}>AES-256-GCM · random 96-bit IV</span>
          </div>

          {/* Stage 3: Ciphertext */}
          <div className="p-4 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-muted/60"
                style={{ background: "rgba(255,255,255,0.07)" }}>3</div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted/40">Server receives</span>
            </div>
            <div className="font-mono text-xs text-muted/35 break-all leading-5">
              KzY4Xm9Ra2·<span style={{ color: "rgba(255,255,255,0.18)" }}>HkTpZd2mYrBcXvNq</span>·aN7qB2oP==
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[9px] text-muted/35">
              <Lock size={8} /> Unreadable without your key · zero plaintext stored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURES ─────────────────────────────────────────────
const FEATURES = [
  { icon: <Lock size={20} />, title: "Client-side encryption", desc: "AES-256-GCM with PBKDF2 (310,000 iterations). Your master password never leaves your browser.", color: EM },
  { icon: <Eye size={20} />, title: "Breach detection", desc: "HaveIBeenPwned k-Anonymity API — only 5 SHA-1 chars sent, never your actual password.", color: "#f59e0b" },
  { icon: <KeyRound size={20} />, title: "TOTP Authenticator", desc: "Store encrypted TOTP seeds and generate live 6-digit codes with animated countdown rings.", color: "#8b5cf6" },
  { icon: <Zap size={20} />, title: "Strength analyzer", desc: "Entropy scoring, crack-time estimates, pattern detection, and an AI password roast system.", color: "#f43f5e" },
  { icon: <Activity size={20} />, title: "Vault health dashboard", desc: "Surface weak, reused, and breached passwords. One scan gives you a vault health score.", color: "#06b6d4" },
  { icon: <Globe size={20} />, title: "Command palette", desc: "Hit ⌘K from anywhere to search vault entries, navigate, and trigger actions instantly.", color: "#a855f7" },
  { icon: <FileText size={20} />, title: "Encrypted notes", desc: "Secure freeform notes encrypted with the same AES-256-GCM as your vault entries.", color: "#ec4899" },
  { icon: <Shield size={20} />, title: "Zero-knowledge architecture", desc: "Even a full server breach exposes nothing. Ciphertext only — ever.", color: EM },
  { icon: <Database size={20} />, title: "Activity audit log", desc: "Every login, vault change, and breach check logged and timestamped for your review.", color: "#f59e0b" },
];

function FeaturesSection() {
  return (
    <section className="px-6 md:px-10 py-28" style={{ background: `linear-gradient(180deg, transparent 0%, ${EM}09 50%, transparent 100%)` }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: EM }}>Features</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-fg/90">Everything your passwords need.</h2>
          <p className="text-muted max-w-xl mx-auto text-[17px]">Built on open standards. No black boxes. No telemetry. No excuses.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon, title, desc, color }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -3, borderColor: `${color}28`, background: `${color}07` }}
              className="p-5 rounded-2xl border transition-colors duration-200 cursor-default"
              style={{ borderColor: "rgba(255,255,255,0.055)", background: "rgba(255,255,255,0.018)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18`, color }}>
                {icon}
              </div>
              <h3 className="font-bold mb-2 text-fg/90">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TECH SECTION VISUALS ─────────────────────────────────
function PasswordTypingVisual() {
  const [shown, setShown] = useState(0);
  const pass = "Tr0ub4dor&3!xK9";
  useEffect(() => {
    setShown(0);
    const id = setInterval(() => setShown(s => { if (s >= pass.length) { clearInterval(id); return s; } return s + 1; }), 110);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="rounded-2xl border p-5" style={{ borderColor: `${EM}28`, background: `${EM}07` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: `${EM}70` }}>Master password input</div>
        <div className="text-3xl font-mono tracking-wider mb-1" style={{ color: EM }}>
          {"•".repeat(shown)}
          {shown < pass.length && <span style={{ animation: "blink 1s step-end infinite", color: EM_LT }}>|</span>}
        </div>
      </div>
      <div className="rounded-xl p-3.5 font-mono text-xs space-y-1.5" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div><span style={{ color: "#4ade80" }}>✓ </span><span className="text-muted">network requests sent:</span> <span style={{ color: "#ef4444" }}>0</span></div>
        <div><span style={{ color: "#4ade80" }}>✓ </span><span className="text-muted">localStorage writes:</span> <span style={{ color: "#ef4444" }}>0</span></div>
        <div><span style={{ color: "#4ade80" }}>✓ </span><span className="text-muted">memory scope:</span> <span style={{ color: EM }}>session only</span></div>
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ color: `${EM}80` }}>
        <Shield size={12} />
        Stays in your browser · Zero transmission
      </div>
    </div>
  );
}

function KeyDerivationVisual() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);
  const iters = Math.min((tick * 5200) % 310001, 310000);
  const hexBytes = ["a3f2", "c91b", "8e4d", "7052", "f6a1", "b3c8", "9d2e", "4f71"];
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${EM}25` }}>
        <div className="px-4 py-2.5 flex items-center justify-between text-xs font-mono" style={{ background: `${EM}10`, color: `${EM}90` }}>
          <span>PBKDF2-SHA256</span>
          <span>{iters.toLocaleString()} / 310,000</span>
        </div>
        <div className="px-1.5 py-1.5" style={{ background: "rgba(0,0,0,0.25)" }}>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-none" style={{ width: `${(iters / 310000) * 100}%`, background: `linear-gradient(90deg, ${EM2}, ${EM_LT})` }} />
          </div>
        </div>
        <div className="px-4 py-3 font-mono text-xs leading-7 break-all" style={{ background: "rgba(0,0,0,0.2)", color: EM_LT }}>
          {hexBytes.map((b, i) => (
            <span key={i} className="mr-1 transition-opacity duration-300" style={{ opacity: i <= tick % (hexBytes.length + 1) ? 1 : 0.15 }}>{b}</span>
          ))}
          <span className="text-muted">··· 256-bit key</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="text-fg/40">Password</span>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${EM}60, transparent)` }} />
        <span style={{ color: EM }}>256-bit AES key</span>
      </div>
    </div>
  );
}

type EncPhase = "plain" | "encrypting" | "cipher";
function EncryptionVisual() {
  const [phase, setPhase] = useState<EncPhase>("plain");
  useEffect(() => {
    setPhase("plain");
    const t1 = setTimeout(() => setPhase("encrypting"), 900);
    const t2 = setTimeout(() => setPhase("cipher"), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="w-full max-w-sm">
      <AnimatePresence mode="wait">
        {phase === "plain" && (
          <motion.div key="plain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="rounded-2xl border p-4 font-mono text-sm space-y-2"
            style={{ borderColor: "rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.02)" }}>
            <div className="text-[10px] text-muted uppercase tracking-widest mb-3">vault_entry (plaintext)</div>
            <div><span className="text-muted">site: </span><span className="text-fg/80">Gmail</span></div>
            <div><span className="text-muted">user: </span><span className="text-fg/80">john@gmail.com</span></div>
            <div><span className="text-muted">pass: </span><span style={{ color: EM_LT }}>myP@ssword123</span></div>
          </motion.div>
        )}
        {phase === "encrypting" && (
          <motion.div key="enc" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-6 text-center"
            style={{ borderColor: `${EM}35`, background: `${EM}08` }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} className="inline-block mb-3">
              <Cpu size={32} style={{ color: EM }} />
            </motion.div>
            <div className="font-mono text-sm font-bold" style={{ color: EM }}>AES-256-GCM encrypting…</div>
            <div className="text-xs text-muted mt-1">Generating 96-bit random IV…</div>
          </motion.div>
        )}
        {phase === "cipher" && (
          <motion.div key="cipher" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-4 font-mono text-xs"
            style={{ borderColor: `${EM}28`, background: `${EM}06` }}>
            <div className="text-[10px] mb-2 uppercase tracking-widest" style={{ color: `${EM}70` }}>ciphertext (AES-256-GCM)</div>
            <div className="break-all leading-6 text-muted/60">
              KzY4Xm9Ra2f1bQoP·<span style={{ color: EM }}>HkTpZd2mYrBcXvNq7fEoAjCu5sIwGl1y</span>·aN7qB2oPeAt==
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: EM }}>
              <Check size={11} /> Indistinguishable from random noise
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServerStorageVisual() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 rounded-xl border p-4 text-center" style={{ borderColor: `${EM}25`, background: `${EM}07` }}>
          <Cpu size={22} className="mx-auto mb-2" style={{ color: EM }} />
          <div className="text-xs font-semibold" style={{ color: EM_LT }}>Your browser</div>
          <div className="text-[10px] text-muted mt-0.5">Encrypts & decrypts</div>
        </div>
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <Lock size={13} style={{ color: EM }} />
          <motion.div animate={{ scaleX: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${EM2}, ${EM_LT})` }} />
          <div className="text-[9px]" style={{ color: `${EM}55` }}>encrypted</div>
        </div>
        <div className="flex-1 rounded-xl border p-4 text-center" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <Database size={22} className="mx-auto mb-2 text-muted/50" />
          <div className="text-xs font-semibold text-fg/40">Our server</div>
          <div className="text-[10px] text-muted mt-0.5">Sees nothing</div>
        </div>
      </div>
      <div className="rounded-xl border p-4 font-mono text-[11px] leading-5"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)" }}>
        <div className="text-[9px] text-muted uppercase tracking-widest mb-2">What our servers actually store:</div>
        <div className="text-muted/50 break-all">
          {`{"iv":"aZ3kR...","ct":"KzY4Xm9...aN7qB==","tag":"Gx2T..."}`}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-muted/40">
          <Lock size={10} /> Meaningless without your key
        </div>
      </div>
    </div>
  );
}

// ─── TECH SECTION ─────────────────────────────────────────
const TECH_STEPS: { id: string; title: string; desc: string; Visual: React.FC }[] = [
  { id: "type", title: "You type your master password", desc: "Your master password stays entirely in your browser. It is never sent to any server — not during login, not ever. It only exists in-memory for the duration of your session.", Visual: PasswordTypingVisual },
  { id: "derive", title: "PBKDF2 derives a 256-bit key", desc: "Your password is hashed 310,000 times using PBKDF2-SHA256, producing a unique 256-bit key. This key is computationally infeasible to reverse-engineer — even with modern hardware.", Visual: KeyDerivationVisual },
  { id: "encrypt", title: "AES-256-GCM encrypts your vault", desc: "Each entry is encrypted individually using AES-256-GCM with a random 96-bit IV. The result is ciphertext that is provably indistinguishable from random noise without your key.", Visual: EncryptionVisual },
  { id: "store", title: "Only ciphertext leaves your device", desc: "We store encrypted blobs — nothing more. Our servers have no concept of usernames, passwords, or sites. Even a total infrastructure breach would yield only meaningless ciphertext.", Visual: ServerStorageVisual },
];

const STEP_MS = 4500;
const TICK_MS = 40;

function TechSection() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressId = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((i: number, pause = false) => {
    setActive(i); setProgress(0);
    if (pause) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) return;
    progressId.current = setInterval(() => setProgress(p => Math.min(p + (TICK_MS / STEP_MS) * 100, 100)), TICK_MS);
    return () => { if (progressId.current) clearInterval(progressId.current); };
  }, [active, paused]);

  useEffect(() => {
    if (paused) return;
    advanceId.current = setTimeout(() => { setActive(a => (a + 1) % TECH_STEPS.length); setProgress(0); }, STEP_MS);
    return () => { if (advanceId.current) clearTimeout(advanceId.current); };
  }, [active, paused]);

  const { Visual } = TECH_STEPS[active];

  return (
    <section id="how-it-works" className="px-6 md:px-10 py-28">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: EM }}>Under the hood</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-fg/90">How VaultX keeps you safe.</h2>
          <p className="text-muted max-w-lg mx-auto text-[17px]">Watch your data flow from keyboard to encrypted storage — without ever being exposed.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${EM}18`, background: "#06060f" }}>
            {/* Terminal chrome */}
            <div className="px-5 py-3 flex items-center gap-2.5 border-b" style={{ borderColor: `${EM}12`, background: `${EM}07` }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(239,68,68,0.5)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(245,158,11,0.5)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: `${EM}70` }} />
              <span className="ml-2 text-xs font-mono" style={{ color: `${EM}60` }}>vaultx — encryption-engine · live</span>
              <div className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: `${EM}50` }}>
                <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full" style={{ background: EM }} />
                running
              </div>
            </div>

            <div className="grid md:grid-cols-[270px,1fr]">
              {/* Steps sidebar */}
              <div className="border-r py-4 px-3 space-y-1" style={{ borderColor: `${EM}0d` }}>
                {TECH_STEPS.map((step, i) => (
                  <button key={step.id} onClick={() => goTo(i, true)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
                    className="w-full text-left px-3 py-3.5 rounded-xl transition-all duration-200"
                    style={{ background: active === i ? `${EM}12` : "transparent", borderLeft: `2px solid ${active === i ? EM : "transparent"}` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 transition-all"
                        style={{ background: active === i ? EM : "rgba(255,255,255,0.06)", color: active === i ? "#fff" : "#555" }}>
                        {active > i ? <Check size={11} /> : i + 1}
                      </div>
                      <span className="text-[13px] font-medium leading-snug transition-colors"
                        style={{ color: active === i ? EM_LT : "#666" }}>
                        {step.title}
                      </span>
                    </div>
                    {active === i && (
                      <div className="ml-9 mt-2.5 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${EM2}, ${EM_LT})`, transition: "width 40ms linear" }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Visual area */}
              <div className="p-8 min-h-[380px] flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div key={active}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <Visual />
                    </div>
                    <div className="mt-6 pt-5 border-t" style={{ borderColor: `${EM}0d` }}>
                      <p className="text-sm text-muted leading-relaxed">{TECH_STEPS[active].desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── TRUST ────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: <Lock size={18} />, label: "AES-256-GCM", desc: "NIST-approved symmetric encryption" },
  { icon: <Cpu size={18} />, label: "PBKDF2-SHA256", desc: "310,000 key-stretch iterations" },
  { icon: <Eye size={18} />, label: "Zero-knowledge", desc: "We never see your plaintext data" },
  { icon: <Shield size={18} />, label: "k-Anonymity model", desc: "Breach checks without revealing passwords" },
  { icon: <Activity size={18} />, label: "Immutable audit log", desc: "Every action timestamped server-side" },
  { icon: <Database size={18} />, label: "Open standards only", desc: "No proprietary or closed algorithms" },
];

function TrustSection() {
  return (
    <section className="px-6 md:px-10 py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: EM }}>Security standards</div>
          <h2 className="text-3xl md:text-4xl font-black text-fg/90">Built on standards that stand up to scrutiny.</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRUST_ITEMS.map(({ icon, label, desc }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.38, delay: (i % 3) * 0.07 }}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${EM}13`, color: EM }}>
                {icon}
              </div>
              <div>
                <div className="font-semibold text-sm text-fg/90">{label}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────
function FinalCTA() {
  const router = useRouter();
  return (
    <section className="px-6 md:px-10 py-36 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${EM}10 0%, transparent 60%)` }} />
      <div className="relative max-w-2xl mx-auto">
        <Reveal>
          <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: EM }}>Get started</div>
          <h2 className="text-5xl md:text-6xl font-black mb-5 leading-tight text-fg/90">
            Your security<br />
            <span style={{ background: `linear-gradient(120deg, ${EM}, ${EM_LT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              starts now.
            </span>
          </h2>
          <p className="text-muted mb-10 text-lg">Free forever. No credit card. Your vault, your keys.</p>
          <button
            className="px-10 py-4 rounded-xl text-lg font-semibold text-white transition-all hover:-translate-y-1 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${EM}, ${EM2})`, boxShadow: `0 0 50px ${EM_GLOW}` }}
            onMouseDown={() => router.push("/signup")} onTouchStart={() => router.push("/signup")}>
            Create your vault →
          </button>
          <div className="mt-7 flex items-center justify-center gap-7 text-xs text-muted">
            {["No credit card", "End-to-end encrypted", "Open standards"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <Check size={11} style={{ color: EM }} />{t}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-6 py-6 border-t border-white/[0.04] text-center text-xs text-muted">
      VaultX — Zero-knowledge password manager. Open standard cryptography. Your data stays yours.
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#07071a" }}>
      <style>{`
        @keyframes orbA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(35px,-25px) scale(1.07)} 66%{transform:translate(-20px,30px) scale(0.94)} }
        @keyframes orbB { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-30px,18px) scale(1.06)} 70%{transform:translate(22px,-35px) scale(0.96)} }
        @keyframes orbC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-20px)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
      <Nav />
      <Hero />
      <WhatIsSection />
      <FeaturesSection />
      <TechSection />
      <TrustSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
