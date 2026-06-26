"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { C } from "../lib/data";
import { HOVER_TAP } from "../lib/motion";

type Mode = "dark" | "light";

export function ThemeToggle() {
  // Start with the SSR default ("dark") to avoid hydration mismatch, then sync
  // to whatever the pre-paint script in <head> already applied (localStorage).
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Mode) || "dark";
    setMode(current);
  }, []);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <motion.button
      {...HOVER_TAP}
      onClick={toggle}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}
      title="Toggle light / dark"
      style={{
        position: "fixed", right: 18, bottom: 18, zIndex: 60,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 40, height: 40, borderRadius: 99,
        background: "rgba(var(--bg-rgb),0.7)", border: `1px solid ${C.border}`,
        color: C.text, cursor: "pointer", backdropFilter: "blur(8px)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          style={{ display: "inline-flex" }}
        >
          {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
