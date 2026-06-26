import { C, ACHIEVEMENTS } from "../lib/data";

export function AchievementsStrip() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 2, marginBottom: 10 }}>
      {ACHIEVEMENTS.map(([n, l]) => (
        <div key={l} style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: C.panel, padding: "10px 16px" }}>
          <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 16, color: C.text, lineHeight: 1.1 }}>{n}</div>
          <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: C.muted, marginTop: 5 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}
