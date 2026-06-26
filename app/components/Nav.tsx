"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { C } from "../lib/data";
import { scrollToId } from "../lib/scrollToId";
import { HOVER_TAP } from "../lib/motion";

const NAV = ["Work", "Projects", "Skills", "Contact"];

export function Nav() {
  const [active, setActive] = useState("");

  // active-section highlight: mark the section crossing a band near the top
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.toLowerCase())).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
      <nav style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px clamp(20px, 6vw, 80px)", background: "rgba(var(--bg-rgb),0.72)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}` }}>
        <a href="#top" style={{ fontFamily: "var(--font-mono), monospace", color: C.text, textDecoration: "none", fontSize: 15 }}>
          <span style={{ color: C.accent }}>~/</span>zuhair
        </a>
        <div style={{ display: "flex", gap: 22 }} className="zh-navlinks">
          {NAV.map((n) => {
            const id = n.toLowerCase();
            return (
              <motion.a
                key={n}
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); scrollToId(id); }}
                className="zh-link"
                style={{ fontSize: 13.5, position: "relative", color: active === id ? C.text : undefined }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={HOVER_TAP.transition}
              >
                {n}
                {active === id && (
                  <motion.span
                    layoutId="nav-underline"
                    style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 2, borderRadius: 2, background: "var(--accent)" }}
                  />
                )}
              </motion.a>
            );
          })}
        </div>
      </nav>
  );
}
