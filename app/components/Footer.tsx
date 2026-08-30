import { C } from "../lib/data";
import { LogoMark } from "./LogoMark";

export function Footer() {
  return (
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 0 54px", textAlign: "center", fontFamily: "var(--font-mono), monospace" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontSize: 15, color: C.text }}>
            <LogoMark size={17} style={{ color: C.accent }} />
            Mohammed Zuhair Hussain <span style={{ color: C.faint }}>| AI / ML Engineer</span>
          </div>
        </footer>
  );
}
