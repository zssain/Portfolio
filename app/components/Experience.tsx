import { GitBranch, Calendar } from "lucide-react";
import { C, EXPERIENCE } from "../lib/data";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import { Tag } from "./Tag";

export function GitLog() {
  return (
    <section id="work" style={{ padding: "70px 0" }}>
      <Reveal>
      <SectionLabel index="01">EXPERIENCE</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <GitBranch size={20} style={{ color: C.accent }} />
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(17px, 2.6vw, 24px)", color: C.text }}>
          $ git log <span style={{ color: C.muted }}>--stat --oneline</span>
        </span>
      </div>

      <div className="tl">
        {EXPERIENCE.map((e, i) => (
          <div key={e.hash} className={"tl-row " + (i % 2 === 0 ? "left" : "right")}>
            <span className="tl-node"><i /></span>
            <span className="tl-conn" />
            <span className="tl-date"><Calendar size={13} /> {e.date}</span>
            <div className="tl-card">
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.panel, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.accent }}>{e.hash}</span>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: C.blue, border: `1px solid rgba(127,166,201,0.3)`, borderRadius: 5, padding: "2px 8px" }}>{e.branch}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.faint }}>{e.org}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>
                  {e.role} <span style={{ color: C.faint, fontWeight: 400 }}>@ {e.org}</span>
                </h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.62, borderLeft: `2px solid ${C.border}`, paddingLeft: 14, margin: "12px 0 16px" }}>{e.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {e.tags.map((t) => (<Tag key={t} warm>{t}</Tag>))}
                </div>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.faint }}>
                  {e.stat.files} files changed{"  "}
                  <span style={{ color: C.green }}>+{e.stat.ins}</span>{"  "}
                  <span style={{ color: "#c08a6a" }}>-{e.stat.del}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="tl-init">
          <span className="tl-node"><i /></span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.muted }}>
            initial commit — B.Tech AI, Mahindra University
          </span>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
