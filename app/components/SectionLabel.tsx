import type { ReactNode } from "react";
import { C } from "../lib/data";

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono), monospace", fontSize: 12,
      letterSpacing: "0.15em", marginBottom: 30,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ color: C.faint }}>{index}</span>
      <span style={{ color: C.muted }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}
