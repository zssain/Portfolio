"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { Play, FolderGit2 } from "lucide-react";
import { C } from "../lib/data";
import { scrollToId } from "../lib/scrollToId";
import { HOVER_TAP } from "../lib/motion";

export function CodePanel() {
  const Ln = ({ n }: { n: number }) => (
    <span style={{ color: C.faint, width: 22, display: "inline-block", textAlign: "right", marginRight: 16, userSelect: "none" }}>{n}</span>
  );
  const kw: CSSProperties = { color: C.blue };
  const str: CSSProperties = { color: C.accent };
  const grn: CSSProperties = { color: C.green };
  const mut: CSSProperties = { color: C.muted };
  const faint: CSSProperties = { color: C.faint };

  const lines = [
    <span style={faint}>{"// welcome to my workspace"}</span>,
    <><span style={kw}>import</span>{" { "}<span style={grn}>Engineer</span>{" } "}<span style={kw}>from</span> <span style={str}>'./universe'</span>;</>,
    <>{"\u00A0"}</>,
    <><span style={kw}>const</span> <span style={grn}>Zuhair</span> = () <span style={mut}>{"=>"}</span> (</>,
    <>{"  "}<span style={mut}>{"<"}</span><span style={grn}>Engineer</span></>,
    <>{"    "}name=<span style={str}>"Mohammed Zuhair Hussain"</span></>,
    <>{"    "}role=<span style={str}>"AI / ML Engineer"</span></>,
    <>{"    "}focus={"{["}<span style={str}>"RAG"</span>, <span style={str}>"agents"</span>, <span style={str}>"LLMOps"</span>, <span style={str}>"vision"</span>{"]}"}</>,
    <>{"  "}<span style={mut}>{"/>"}</span></>,
    <>);</>,
  ];

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.editor, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#3a3f49" }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#3a3f49" }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#3a3f49" }} />
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.muted }}>portfolio.tsx</span>
      </div>
      <pre style={{ margin: 0, padding: "18px 16px", fontFamily: "var(--font-mono), monospace", fontSize: 13, lineHeight: 1.85, color: C.text, overflowX: "auto" }}>
        {lines.map((ln, i) => (<div key={i}><Ln n={i + 1} />{ln}</div>))}
      </pre>
      <div style={{ display: "flex", gap: 10, padding: "0 16px 18px" }}>
        <motion.a {...HOVER_TAP} href="#work" onClick={(e) => { e.preventDefault(); scrollToId("work"); }} className="zh-btn" style={btnSm(true)}><Play size={13} /> Run profile</motion.a>
        <motion.a {...HOVER_TAP} href="#projects" onClick={(e) => { e.preventDefault(); scrollToId("projects"); }} className="zh-btn" style={btnSm(false)}><FolderGit2 size={13} /> View projects</motion.a>
      </div>
    </div>
  );
}

export function btnSm(warm: boolean): CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontFamily: "var(--font-mono), monospace", fontSize: 12, textDecoration: "none",
    color: warm ? C.accent : C.text,
    border: `1px solid ${warm ? C.accentSoft2 : C.border}`,
    borderRadius: 7, padding: "8px 13px",
  };
}
