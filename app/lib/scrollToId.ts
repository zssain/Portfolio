// Reliable smooth-scroll helper (also reveals the target if mid-animation).
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("in"); // ensure the target is revealed even if it was animating in
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
