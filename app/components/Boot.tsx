"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { C, BOOT_LINES } from "../lib/data";
import { useReducedMotion } from "../lib/useReducedMotion";

export function Boot({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [line, setLine] = useState(0);

  // Just signal completion — AnimatePresence plays the exit transition on unmount.
  const finish = useCallback(() => { onDone(); }, [onDone]);

  useEffect(() => {
    if (reduced) { finish(); return; }
    if (line >= BOOT_LINES.length) {
      const t = setTimeout(finish, 450);
      return () => clearTimeout(t);
    }
    const full = BOOT_LINES[line];
    if (typed.length < full.length) {
      const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 22);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setLine((l) => l + 1); setTyped(""); }, 260);
    return () => clearTimeout(t);
  }, [typed, line, reduced, finish]);

  return (
    <motion.div
      onClick={finish}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 100, background: C.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontFamily: "var(--font-mono), monospace",
      }}
    >
      <div style={{ width: "min(560px, 86vw)" }}>
        {BOOT_LINES.slice(0, line).map((l) => (
          <div key={l} style={{ color: C.muted, fontSize: 13, lineHeight: 2 }}>{l}</div>
        ))}
        {line < BOOT_LINES.length && (
          <div style={{ color: C.text, fontSize: 13, lineHeight: 2 }}>
            {typed}<span className="zh-blink" style={{ color: C.accent }}>▋</span>
          </div>
        )}
        <div style={{ color: C.faint, fontSize: 11, marginTop: 28 }}>click anywhere to skip</div>
      </div>
    </motion.div>
  );
}
