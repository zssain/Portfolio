import type { ReactNode } from "react";
import { C } from "../lib/data";

export function Tag({ children, warm }: { children: ReactNode; warm?: boolean }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono), monospace", fontSize: 11,
      color: warm ? C.accent : C.muted,
      border: `1px solid ${warm ? C.accentSoft : C.border}`,
      borderRadius: 6, padding: "3px 9px",
    }}>{children}</span>
  );
}
