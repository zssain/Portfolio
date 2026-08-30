"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { C } from "../lib/data";
import { scrollToId } from "../lib/scrollToId";
import { HOVER_TAP } from "../lib/motion";
import { LogoMark } from "./LogoMark";

const NAV = ["Work", "Projects", "Skills", "Contact"];

export function Nav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

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

  // close the mobile menu once the viewport grows back to desktop width
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 620) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const go = (id: string) => { setOpen(false); scrollToId(id); };

  return (
      <nav style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px clamp(20px, 6vw, 80px)", background: "rgba(var(--bg-rgb),0.72)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}` }}>
        <a href="#top" onClick={() => setOpen(false)} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--font-mono), monospace", color: C.text, textDecoration: "none", fontSize: 15 }}>
          <LogoMark size={20} blink />
          <span><span style={{ color: C.accent }}>~/</span>zuhair</span>
        </a>

        {/* desktop links */}
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

        {/* mobile hamburger (shown ≤620px via .zh-navtoggle) */}
        <button
          className="zh-navtoggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: 7, color: C.text, cursor: "pointer" }}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="zh-navmenu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ position: "absolute", top: "100%", left: 0, right: 0, display: "flex", flexDirection: "column", background: "rgba(var(--bg-rgb),0.97)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`, padding: "6px clamp(20px, 6vw, 80px) 12px" }}
            >
              {NAV.map((n) => {
                const id = n.toLowerCase();
                return (
                  <a
                    key={n}
                    href={`#${id}`}
                    onClick={(e) => { e.preventDefault(); go(id); }}
                    className="zh-link"
                    style={{ padding: "13px 2px", fontSize: 15, borderBottom: `1px solid ${C.border}`, color: active === id ? C.accent : undefined }}
                  >
                    {n}
                  </a>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
  );
}
