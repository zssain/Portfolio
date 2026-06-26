// Shared interaction spring used by nav links, hero/code buttons, and the send button.
export const HOVER_TAP = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};
