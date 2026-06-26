"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { C, GLOBE_SKILLS, type GlobeSkill } from "../lib/data";

function Logo({ item }: { item: GlobeSkill }) {
  if (item.path) {
    return (
      <svg viewBox="0 0 24 24" width={38} height={38} role="img" aria-label={item.label} style={{ display: "block" }}>
        <title>{item.label}</title>
        <path d={item.path} fill={item.color} />
      </svg>
    );
  }
  if (item.svg) {
    return (
      <span className="zh-ico" aria-label={item.label} style={{ width: item.wide ? 60 : 40, height: 40, display: "inline-block" }} dangerouslySetInnerHTML={{ __html: item.svg }} />
    );
  }
  return null;
}

/* Hover glow + scale, animated with a Framer spring. The two drop-shadows keep
   a matching structure in both states so Framer interpolates blur/alpha smoothly
   (the var(--accent-rgb) color stays a static token, so it tracks the theme). */
const LOGO_REST = {
  scale: 1,
  filter:
    "drop-shadow(0px 0px 0px rgba(var(--accent-rgb),0)) drop-shadow(0px 0px 0px rgba(var(--accent-rgb),0))",
};
const LOGO_HOVER = {
  scale: 1.18,
  filter:
    "drop-shadow(0px 0px 10px rgba(var(--accent-rgb),0.85)) drop-shadow(0px 0px 4px rgba(var(--accent-rgb),0.6))",
};
const LOGO_SPRING = { type: "spring" as const, stiffness: 300, damping: 18 };

export default function SkillsGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const N = GLOBE_SKILLS.length;

    // base points on a unit sphere (fibonacci distribution)
    const base = GLOBE_SKILLS.map((_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      };
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rotX = 0.2, rotY = 0;
    // no auto-rotation under reduced motion: start at rest and stay there unless dragged
    let velX = reduced ? 0 : 0.0006, velY = reduced ? 0 : 0.0024;
    let down = false, lastX = 0, lastY = 0, raf = 0;

    let radius = 150, cx = 0, cy = 0;
    const measure = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      radius = Math.min(w, h) * 0.46;
      cx = w / 2;
      cy = h / 2;
    };
    measure();

    // Pointer Events unify mouse + touch + pen; setPointerCapture keeps the drag
    // alive (and routes move/up to the wrap) on both mouse and touch.
    const onDown = (e: PointerEvent) => {
      down = true; lastX = e.clientX; lastY = e.clientY;
      wrap.style.cursor = "grabbing";
      try { wrap.setPointerCapture(e.pointerId); } catch {}
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      velY = dx * 0.006;
      velX = -dy * 0.006;
    };
    const onUp = (e: PointerEvent) => {
      down = false; wrap.style.cursor = "grab";
      try { wrap.releasePointerCapture(e.pointerId); } catch {}
    };
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", measure);

    const tick = () => {
      if (!down) {
        const targetY = reduced ? 0 : 0.0024;
        velY += (targetY - velY) * 0.03;
        velX += (0 - velX) * 0.03;
      }
      rotY += velY;
      rotX += velX;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      for (let i = 0; i < N; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        const p = base[i];
        // rotate Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y;
        // rotate X
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        const depth = (z2 + 1) / 2; // 0 back .. 1 front
        const left = cx + x2 * radius;
        const top = cy + y2 * radius;
        const scale = 0.58 + depth * 0.46;
        el.style.transform = `translate(-50%, -50%) translate(${left}px, ${top}px) scale(${scale})`;
        el.style.opacity = String(0.16 + depth * 0.84);
        el.style.zIndex = String(Math.round(depth * 100));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div>
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(460px, 64vw, 640px)",
          cursor: "grab",
          touchAction: "none",
          overflow: "hidden",
        }}
      >
        {/* soft accent glow for depth */}
        <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: "62%", height: "62%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(var(--accent-rgb),0.10), transparent 68%)", pointerEvents: "none" }} />
        {/* faint wireframe sphere behind the logos */}
        <svg
          viewBox="0 0 200 200"
          aria-hidden
          style={{
            position: "absolute", left: "50%", top: "50%",
            width: "min(90%, 600px)", transform: "translate(-50%, -50%)",
            opacity: 0.5, pointerEvents: "none",
          }}
        >
          <circle cx="100" cy="100" r="84" fill="none" stroke={C.border} strokeWidth="0.6" />
          {[0.32, 0.62, 0.86].map((r, i) => (
            <ellipse key={"h" + i} cx="100" cy="100" rx="84" ry={84 * r} fill="none" stroke={C.border} strokeWidth="0.5" />
          ))}
          {[0.32, 0.62, 0.86].map((r, i) => (
            <ellipse key={"v" + i} cx="100" cy="100" rx={84 * r} ry="84" fill="none" stroke={C.border} strokeWidth="0.5" />
          ))}
        </svg>

        {GLOBE_SKILLS.map((it, i) => (
          <div
            key={it.label}
            className="zh-node"
            ref={(el) => { nodeRefs.current[i] = el; }}
            style={{ position: "absolute", left: 0, top: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, willChange: "transform, opacity" }}
          >
            <motion.span
              className="zh-logo"
              initial={LOGO_REST}
              whileHover={LOGO_HOVER}
              transition={LOGO_SPRING}
            >
              <Logo item={it} />
            </motion.span>
            {!it.noLabel && <span className="zh-glabel">{it.label}</span>}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 6, marginBottom: 8 }}>
        <span style={{
          fontFamily: "var(--font-mono), monospace", fontSize: 11, color: C.muted,
          border: `1px solid ${C.border}`, borderRadius: 99, padding: "5px 14px",
          background: "rgba(var(--bg-rgb),0.7)", whiteSpace: "nowrap",
        }}>
          drag to explore skills universe
        </span>
      </div>
    </div>
  );
}
