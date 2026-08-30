"use client";

import { useState, useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { FolderGit2, BookMarked, ArrowUpRight, Pin } from "lucide-react";
import { C, PROJECTS, langColor, type Project } from "../lib/data";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import { Tag } from "./Tag";

/* Project grid stagger + per-card reveal (distinct labels so they don't collide
   with the section-level <Reveal> "hidden"/"show" variants). */
const projGridContainer: Variants = {
  gridHidden: {},
  gridShow: { transition: { staggerChildren: 0.1 } },
};
const projCardItem: Variants = {
  gridHidden: { opacity: 0, y: 18 },
  gridShow: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } },
};

// Logical viewport the landing page renders at inside the hover preview; the
// iframe is then scaled down to the card's width.
const PREVIEW_W = 1280;
const PREVIEW_H = 800; // 16:10 slice of the page (the hero region)

function ProjectCard({ p }: { p: Project }) {
  const [hover, setHover] = useState(false);
  // Touch devices have no hover: show the preview inline instead of as a popover.
  const [hoverCapable, setHoverCapable] = useState(true);
  const shotRef = useRef<HTMLDivElement>(null);
  const [shotW, setShotW] = useState(0);
  useEffect(() => {
    setHoverCapable(window.matchMedia("(hover: hover)").matches);
  }, []);

  const onEnter = () => {
    setHover(true);
    if (shotRef.current) setShotW(shotRef.current.offsetWidth);
  };
  const titleHref = p.landing ? `/projects/${p.landing}` : p.github;
  const titleExternal = !p.landing;
  // Mount the (heavy) iframe only while actively hovering a hover-capable device.
  const showPreview = p.landing && hoverCapable && hover && shotW > 0;

  return (
    <motion.div
      className="proj-card"
      onHoverStart={onEnter}
      onHoverEnd={() => setHover(false)}
      initial={{ y: 0, borderColor: C.border, boxShadow: "0px 16px 44px rgba(0,0,0,0)" }}
      whileHover={{ y: -4, borderColor: "var(--accent)", boxShadow: "0px 16px 44px rgba(0,0,0,0.45)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <motion.div
        ref={shotRef}
        className="proj-shot"
        initial={false}
        animate={
          hoverCapable
            ? { opacity: hover ? 1 : 0, y: hover ? 0 : 10, scale: hover ? 1 : 0.97 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {p.landing ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", overflow: "hidden", background: "#fff" }}>
            {showPreview ? (
              <iframe
                src={`/projects/${p.landing}`}
                title={p.title + " live preview"}
                loading="lazy"
                scrolling="no"
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: "absolute", top: 0, left: 0, width: PREVIEW_W, height: PREVIEW_H, border: 0, transform: `scale(${shotW / PREVIEW_W})`, transformOrigin: "top left", pointerEvents: "none" }}
              />
            ) : (
              <div className="proj-shot-ph">Live preview →</div>
            )}
          </div>
        ) : p.image ? (
          <img src={p.image} alt={p.title + " preview"} style={{ width: "100%", display: "block" }} />
        ) : (
          <div className="proj-shot-ph">UI screenshot</div>
        )}
      </motion.div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <BookMarked size={17} style={{ color: C.muted }} />
        <a
          href={titleHref}
          {...(titleExternal ? { target: "_blank", rel: "noreferrer" } : {})}
          className="proj-title"
          style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 19, fontWeight: 600, color: C.text, textDecoration: "none", transition: "color .2s ease", flex: 1 }}
        >
          {p.title}
        </a>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 99, padding: "2px 9px" }}>Public</span>
      </div>
      {p.category && <span className="proj-cat">{p.category}</span>}
      <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.65, margin: "12px 0 16px" }}>{p.desc}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {p.tags.map((t) => (<Tag key={t} warm>{t}</Tag>))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 14, fontFamily: "var(--font-mono), monospace", fontSize: 12.5, color: C.muted }}>
        {p.lang && (<span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 10, height: 10, borderRadius: 99, background: langColor(p.lang) }} />{p.lang}</span>)}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {p.landing && (
            <a href={`/projects/${p.landing}`} className="proj-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.accent, textDecoration: "none", border: `1px solid ${C.accentSoft2}`, borderRadius: 7, padding: "6px 12px" }}>
              Overview <ArrowUpRight size={13} />
            </a>
          )}
          <a href={p.github} target="_blank" rel="noreferrer" className="proj-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.text, textDecoration: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 12px" }}>
            Code <ArrowUpRight size={13} />
          </a>
          {p.demo && (
            <a href={p.demo} target="_blank" rel="noreferrer" className="proj-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.accent, textDecoration: "none", border: `1px solid ${C.accentSoft2}`, borderRadius: 7, padding: "6px 12px" }}>
              Demo <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact list row for the non-pinned projects (the "more" list beside the
// pinned cards). Mirrors the old repo-list styling.
function ProjectRepoItem({ p }: { p: Project }) {
  const href = p.landing ? `/projects/${p.landing}` : p.github;
  const external = !p.landing;
  return (
    <a className="proj-repo" href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 14.5, fontWeight: 500, color: C.accent, flex: 1, minWidth: 0, lineHeight: 1.3, wordBreak: "break-word" }}>{p.title}</span>
        {p.pinned && <Pin size={12} fill="currentColor" style={{ color: C.accent, flexShrink: 0, marginTop: 3 }} />}
        <ArrowUpRight size={14} style={{ color: C.muted, flexShrink: 0, marginTop: 2 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, fontFamily: "var(--font-mono), monospace", fontSize: 11.5, color: C.muted }}>
        {p.lang && (<><span style={{ width: 9, height: 9, borderRadius: 99, background: langColor(p.lang), flexShrink: 0 }} />{p.lang}</>)}
        <span style={{ color: C.faint, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.category}</span>
      </div>
    </a>
  );
}

export function Projects() {
  const pinned = PROJECTS.filter((p) => p.pinned);
  const all = PROJECTS;
  return (
    <section id="projects" style={{ padding: "70px 0" }}>
      <Reveal>
      <SectionLabel index="02">PROJECTS</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <FolderGit2 size={20} style={{ color: C.accent }} />
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(17px, 2.6vw, 24px)", color: C.text }}>
          $ ls -la <span style={{ color: C.muted }}>~/projects</span>
        </span>
      </div>

      <div className="proj-wrap">
        <aside className="proj-repos">
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
            <BookMarked size={16} style={{ color: C.muted }} />
            <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 15, fontWeight: 600 }}>All projects</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 99, padding: "2px 9px" }}>{all.length}</span>
          </div>
          <div className="proj-repolist">
            {all.map((p) => (<ProjectRepoItem key={p.title} p={p} />))}
          </div>
        </aside>

        <div>
          <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, letterSpacing: "0.15em", color: C.muted, marginBottom: 14 }}>
            PINNED PROJECTS
          </div>
          <motion.div
            className="proj-grid"
            variants={projGridContainer}
            initial="gridHidden"
            whileInView="gridShow"
            viewport={{ once: true, margin: "-8% 0px" }}
          >
            {pinned.map((p) => (
              <motion.div key={p.title} variants={projCardItem}>
                <ProjectCard p={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
