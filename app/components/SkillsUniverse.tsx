"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { C, SKILLS } from "../lib/data";
import { Tag } from "./Tag";

const SkillsGlobeLazy = dynamic(() => import("./SkillsGlobe"), {
  ssr: false,
  loading: () => <div style={{ height: "clamp(460px, 64vw, 640px)" }} aria-hidden />,
});

export function SkillsUniverse() {
  const nearRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = nearRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setNear(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); }
      },
      { rootMargin: "200px 0px" }, // initialize a little before it scrolls into view
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div>
      {/* globe mounts only once scrolled near; reserves height to avoid layout shift */}
      <div ref={nearRef} style={{ minHeight: "clamp(460px, 64vw, 640px)" }}>
        {near && <SkillsGlobeLazy />}
      </div>

      {/* grouped legend — scannable + accessible fallback (always rendered) */}
      <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
        {SKILLS.map((s) => (
          <div key={s.group} style={{ display: "flex", gap: 20, alignItems: "flex-start", borderTop: `1px solid ${C.border}`, paddingTop: 14, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.muted, width: 120, flexShrink: 0 }}>{s.group}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {s.items.map((it) => (<Tag key={it}>{it}</Tag>))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
