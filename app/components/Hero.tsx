"use client";

import { useRef, type MouseEvent, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import { Terminal, Mail, Download } from "lucide-react";
import { C } from "../lib/data";
import { useReducedMotion } from "../lib/useReducedMotion";
import { HOVER_TAP } from "../lib/motion";
import { CodePanel } from "./CodePanel";
import { AchievementsStrip } from "./AchievementsStrip";

/* lucide-react v1 removed brand icons; local shims keep the same { size } API. */
function Github({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
function Linkedin({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] },
  },
};

function MagneticButton({
  href,
  target,
  className,
  style,
  children,
}: {
  href: string;
  target?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 15, mass: 0.2 });
  const y = useSpring(my, { stiffness: 200, damping: 15, mass: 0.2 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const max = 6;
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
    mx.set(Math.max(-max, Math.min(max, dx)));
    my.set(Math.max(-max, Math.min(max, dy)));
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel="noreferrer"
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={HOVER_TAP.transition}
      style={{ ...style, x, y }}
    >
      {children}
    </motion.a>
  );
}

export function Hero({ booted }: { booted: boolean }) {
  return (
        <motion.div variants={heroContainer} initial="hidden" animate={booted ? "show" : "hidden"}>
        <header style={{ padding: "clamp(56px, 11vh, 110px) 0 80px" }}>
          <div className="zh-hero">
            <motion.div variants={heroItem}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.accent, border: `1px solid ${C.accentSoft}`, borderRadius: 99, padding: "5px 12px", marginBottom: 26 }}>
                <Terminal size={13} /> open to work · grad Aug 2026
              </div>
              <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "clamp(38px, 6.5vw, 66px)", fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.02em", margin: 0 }}>
                Mohammed<br />Zuhair Hussain
              </h1>
              <p style={{ color: C.muted, fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.6, maxWidth: 470, margin: "24px 0 0" }}>
                I build intelligent systems that make complex things feel simple.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
                {[
                  { label: "GitHub", icon: Github, href: "https://github.com/zssain" },
                  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/in/zuhairhussain28" },
                  { label: "Email", icon: Mail, href: "mailto:mohammedzuhairhussain28@gmail.com" },
                  { label: "Résumé", icon: Download, href: "#" },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <MagneticButton key={b.label} href={b.href} target={b.href.startsWith("http") ? "_blank" : undefined} className="zh-btn"
                      style={{ display: "inline-flex", alignItems: "center", gap: 9, color: C.text, textDecoration: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 15px", fontSize: 14 }}>
                      <Icon size={16} /> {b.label}
                    </MagneticButton>
                  );
                })}
              </div>
            </motion.div>
            <motion.div variants={heroItem}><CodePanel /></motion.div>
          </div>
        </header>

        <motion.div variants={heroItem}><AchievementsStrip /></motion.div>
        </motion.div>
  );
}
