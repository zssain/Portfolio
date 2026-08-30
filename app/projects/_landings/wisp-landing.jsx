"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  KeyRound,
  Timer,
  Wifi,
  Lock,
  Fingerprint,
  Footprints,
  Trash2,
  QrCode,
  Radio,
  Printer,
  AlertTriangle,
  Play,
  RotateCcw,
  Hash,
  Database,
} from "lucide-react";

/* ============================================================================
   WISP — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout; inline styles carry the exact hexes
   pulled from the app (canvas #0B0B0C, rule #232326, amber #C9A063).
   Motion: CSS transitions + IntersectionObserver (no framer-motion dependency).
   ========================================================================== */

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  canvas: "#0B0B0C", // app background
  panel: "#111112", // raised surfaces
  panelHi: "#161617", // hover / active surfaces
  rule: "#232326", // hairlines
  ruleBright: "#33333A",
  text: "#E9E7E2", // primary
  muted: "#83817C", // secondary
  faint: "#5C5A56", // tertiary / disabled
  amber: "#C9A063", // the single accent — live, verified, signed
  amberDim: "#6B5535",
  red: "#B4544A", // rejection / expiry
};

/* --- Motion helpers ------------------------------------------------------ */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return reduced;
}

/** Scroll-triggered fade + slide-up. `delay` staggers grid children. */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(18px)",
        transition: reduced
          ? "none"
          : `opacity 600ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 600ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/* --- Small shared pieces ------------------------------------------------- */
function Eyebrow({ children }) {
  return (
    <p
      className="mb-5 font-mono text-xs uppercase tracking-[0.28em]"
      style={{ color: C.amber }}
    >
      {children}
    </p>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5"
        style={{ backgroundColor: C.amber }}
      />
      <span
        className="font-mono text-base uppercase tracking-[0.32em]"
        style={{ color: C.text }}
      >
        Wisp
      </span>
    </span>
  );
}

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: KeyRound,
    title: "No-account identity",
    body: "A locally generated Ed25519 keypair is your identity. Nothing is registered anywhere, because there is nowhere to register.",
  },
  {
    icon: Timer,
    title: "Daily aliases",
    body: "Your display name is derived from your key and the date, so it rotates every day and can't be followed across them.",
  },
  {
    icon: Wifi,
    title: "Three-tier sync",
    body: "WebRTC on a shared network, camera-to-camera animated QR, or a printed QR poster. It degrades instead of failing.",
  },
  {
    icon: Lock,
    title: "Encrypted direct messages",
    body: "DMs are sealed with nacl.box before they ever leave the device, so relays carry ciphertext they cannot read.",
  },
  {
    icon: Footprints,
    title: "Verifiable hop trail",
    body: "Every relay signs a hop stamp over the message id and the previous signature, forming a chain of custody you can inspect.",
  },
  {
    icon: Trash2,
    title: "Panic wipe",
    body: "One tap clears every store and regenerates a fresh identity. Messages also self-delete on a type-based timer.",
  },
];

/* --- Content: the sync trace (signature element) -------------------------
   Four gossip phases, then the eight gates every inbound message must pass.
   ------------------------------------------------------------------------- */
const TRACE = [
  { t: "phase", line: "PHASE 1 · FINGERPRINT", note: "8192-bit Bloom filter of local ids · ~1 KB on the wire" },
  { t: "ok", line: "→ fp sent · ← fp received" },
  { t: "phase", line: "PHASE 2 · DELTA", note: "ids absent from the peer's filter, priority-desc then newest-first" },
  { t: "ok", line: "12 ids missing at peer · alerts queued ahead of chatter" },
  { t: "phase", line: "PHASE 3 · TRANSFER", note: "one envelope at a time over the data channel" },
  { t: "ok", line: "msg 1/12 … msg 12/12" },
  { t: "phase", line: "PHASE 4 · INGEST", note: "eight gates, in order, before anything is stored" },
  { t: "gate", line: "1 · recompute content id — reject on mismatch" },
  { t: "gate", line: "2 · reject unsigned alerts" },
  { t: "gate", line: "3 · verify author Ed25519 signature" },
  { t: "gate", line: "4 · verify every hop stamp in chain order" },
  { t: "gate", line: "5 · deduplicate against local store" },
  { t: "gate", line: "6 · append our own signed hop stamp" },
  { t: "gate", line: "7 · store, applying supersession" },
  { t: "gate", line: "8 · register relayers and author as known peers" },
  { t: "done", line: "SYNC COMPLETE · 12 received · 1 rejected (id mismatch)" },
];

/* --- Content: engineering decisions -------------------------------------- */
const DECISIONS = [
  {
    tag: "Transport",
    title: "WebRTC with no ICE servers, and trickle disabled.",
    body: "In a real blackout there is no STUN or TURN server to reach, and both phones are on the same local network anyway, so only host candidates can ever matter — an ICE server list would be dead weight that also leaks a dependency on the internet. Disabling trickle makes the browser emit one complete SDP instead of a stream of candidates, which is precisely what lets the entire handshake fit inside a scannable QR code.",
    file: "src/transport/rtc.ts:16",
  },
  {
    tag: "Sync protocol",
    title: "Trade fingerprints, not inventories.",
    body: "Each device hashes its message ids into an 8192-bit Bloom filter with four SHA-256-derived hashes — about a kilobyte — and sends that instead of a list. The peer checks its own ids against the filter and transfers only what is probably missing. The roughly 1% false-positive rate means an occasional message waits for the next encounter: completeness traded for a payload small enough to survive a camera link.",
    file: "src/sync/bloom.ts:18",
  },
  {
    tag: "Message design",
    title: "Content addressing over a canonical form.",
    body: "A message id is the SHA-256 of a canonical serialisation with keys sorted, whitespace stripped, and the volatile fields — signature, hops, hidden — excluded. Two devices that have never met therefore produce byte-identical input and the same id, so duplicates collapse for free and any edit changes the address. Tamper detection isn't a separate check; it falls out of how the id is built.",
    file: "src/lib/canonical.ts:37",
  },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  { group: "Client", items: ["React 19", "TypeScript 6", "Vite 8", "Zustand", "Tailwind", "framer-motion"] },
  { group: "Offline", items: ["vite-plugin-pwa", "Workbox service worker", "Dexie over IndexedDB", "4 object stores"] },
  { group: "Crypto", items: ["@noble/ed25519", "@noble/hashes", "tweetnacl", "ed2curve", "X25519 + XSalsa20-Poly1305"] },
  { group: "Transport", items: ["simple-peer (WebRTC)", "qrcode", "@zxing", "native BarcodeDetector", "pako / CompressionStream"] },
  { group: "Server", items: ["none"] },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "0", label: "servers, accounts, API keys", accent: true },
  { value: "3", label: "transport tiers" },
  { value: "8", label: "ingest validation gates" },
  { value: "4", label: "IndexedDB stores" },
  { value: "1 KB", label: "Bloom fingerprint on the wire" },
  { value: "128-bit", label: "content address per message" },
];

/* ========================================================================== */

export default function WispLanding() {
  const reduced = useReducedMotion();

  /* --- Signature element: the sync trace --------------------------------- */
  const [step, setStep] = useState(0); // how many trace lines are visible
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const runTrace = () => {
    clearInterval(timerRef.current);
    if (reduced) {
      setStep(TRACE.length);
      setRunning(false);
      return;
    }
    setStep(0);
    setRunning(true);
    timerRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= TRACE.length) {
          clearInterval(timerRef.current);
          setRunning(false);
          return s;
        }
        return s + 1;
      });
    }, 260);
  };

  const resetTrace = () => {
    clearInterval(timerRef.current);
    setRunning(false);
    setStep(0);
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased"
      style={{ backgroundColor: C.canvas, color: C.text }}
    >
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.rule, backgroundColor: "rgba(11,11,12,0.9)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="focus:outline-none focus-visible:ring-1" style={{ outlineColor: C.amber }}>
            <Logo />
          </a>
          <nav className="flex items-center gap-1 sm:gap-3">
            <a
              href="#how"
              className="hidden font-mono text-xs uppercase tracking-[0.18em] transition-colors sm:inline-block"
              style={{ color: C.muted }}
            >
              How it works
            </a>
            <a
              href="#engineering"
              className="hidden font-mono text-xs uppercase tracking-[0.18em] transition-colors sm:ml-4 sm:inline-block"
              style={{ color: C.muted }}
            >
              Engineering
            </a>
            {/* TODO: repository URL */}
            <a
              href="https://github.com/zssain/pingpong" target="_blank" rel="noreferrer"
              className="ml-2 inline-flex items-center gap-2 border px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:bg-white/5 sm:ml-6"
              style={{ borderColor: C.rule, color: C.text }}
            >
              <Github size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Source</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ==================================================================
          1 — HERO
          ================================================================== */}
      <section id="top" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12 lg:gap-12">
          <Reveal className="min-w-0 lg:col-span-7">
            <Eyebrow>Offline mesh messaging</Eyebrow>
            <h1 className="text-4xl leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              The mesh that survives
              <br />
              the blackout.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: C.muted }}>
              When the internet is gone, Wisp turns phones into a mesh — passing
              local news, life-safety alerts and encrypted messages device to
              device over Wi-Fi and QR codes. No servers, no accounts, no signal
              required.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="https://github.com/zssain/pingpong" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-1"
                style={{ backgroundColor: C.amber, color: C.canvas, outlineColor: C.amber }}
              >
                <Github size={14} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 border px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-1"
                style={{ borderColor: C.rule, color: C.text, outlineColor: C.amber }}
              >
                Read the protocol
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          {/* --- Message record: content address + hop chain --- */}
          <Reveal delay={140} className="min-w-0 lg:col-span-5">
            <div className="border" style={{ borderColor: C.rule, backgroundColor: C.panel }}>
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: C.rule }}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
                  Alert · priority 2
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-[11px]" style={{ color: C.amber }}>
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.amber }} />
                  SIGNED
                </span>
              </div>

              <div className="px-4 py-5">
                <p className="text-base leading-relaxed" style={{ color: C.text }}>
                  Field clinic open — Central School, Main Rd
                </p>
                <p className="mt-2 font-mono text-xs" style={{ color: C.muted }}>
                  [medical] · zone north · ttl 48h
                </p>

                <div className="mt-5 border-t pt-4" style={{ borderColor: C.rule }}>
                  <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: C.faint }}>
                    <Hash size={12} aria-hidden="true" />
                    Content address
                  </p>
                  <p className="mt-1.5 break-all font-mono text-xs" style={{ color: C.text }}>
                    7c1a4f90b2e83d55a6ff0c1748d29b3e
                  </p>
                </div>

                <div className="mt-4 border-t pt-4" style={{ borderColor: C.rule }}>
                  <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: C.faint }}>
                    <Footprints size={12} aria-hidden="true" />
                    Chain of custody
                  </p>
                  <ol className="mt-3 space-y-2">
                    {["amber-hare-46", "quiet-fox-11", "slate-owl-03"].map((alias, i) => (
                      <li key={alias} className="flex items-center gap-3 font-mono text-xs">
                        <span style={{ color: C.amberDim }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ color: C.text }}>{alias}</span>
                        <span className="ml-auto" style={{ color: C.faint }}>
                          sig ok
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px]" style={{ color: C.faint }}>
              {/* TODO: swap for a real capture of a message card if you'd rather show the app */}
              Illustrative record · shape matches src/types/message.ts
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          Verified numbers strip
          ================================================================== */}
      <section className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {NUMBERS.map((n, i) => (
              <Reveal as="li" key={n.label} delay={i * 60}>
                <p
                  className="font-mono text-3xl tracking-tight"
                  style={{ color: n.accent ? C.amber : C.text }}
                >
                  {n.value}
                </p>
                <p className="mt-1 text-xs leading-snug" style={{ color: C.muted }}>
                  {n.label}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================================================================
          2 — PROBLEM → SOLUTION
          ================================================================== */}
      <section className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-5">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="text-3xl leading-tight tracking-tight sm:text-4xl">
              Every messaging app assumes a server in the middle.
            </h2>
          </Reveal>
          <Reveal delay={120} className="min-w-0 lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                In a blackout, a disaster or a deliberate shutdown, people
                standing metres apart lose the ability to share what matters:
                safe routes, medical aid, where the water truck stopped. The
                moment infrastructure fails, so does everything built on top of
                it.
              </p>
              <p style={{ color: C.text }}>
                Proximity survives even when connectivity doesn't. Wisp is a
                client-only PWA that gossips signed, content-addressed messages
                between nearby devices — over a local WebRTC channel when there
                is Wi-Fi, through the camera as animated QR when there isn't, and
                via printed QR posters when there is nothing at all.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          3 — FEATURE GRID
          ================================================================== */}
      <section id="how" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>What it does</Eyebrow>
            <h2 className="max-w-2xl text-3xl leading-tight tracking-tight sm:text-4xl">
              Built for the conditions where nothing else works.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-px border sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: C.rule, backgroundColor: C.rule }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal as="li" key={f.title} delay={i * 80}>
                  <div
                    className="h-full px-6 py-7 transition-colors duration-200 hover:bg-white/[0.03]"
                    style={{ backgroundColor: C.canvas }}
                  >
                    <Icon size={18} aria-hidden="true" style={{ color: C.amber }} />
                    <h3 className="mt-4 font-mono text-sm uppercase tracking-[0.14em]">{f.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed" style={{ color: C.muted }}>
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ==================================================================
          4 — TECHNICAL DEEP-DIVE
          Transports, the sync trace, engineering decisions, stack.
          ================================================================== */}
      <section id="engineering" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>Under the hood</Eyebrow>
            <h2 className="max-w-3xl text-3xl leading-tight tracking-tight sm:text-4xl">
              There is no architecture diagram with a server on it.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: C.muted }}>
              Everything runs on the device. Posts are signed and
              content-addressed, then written to IndexedDB across four object
              stores. When two devices meet, a transport-agnostic gossip protocol
              exchanges Bloom fingerprints and moves only the difference,
              highest priority first.
            </p>
          </Reveal>

          {/* --- Transport tiers --- */}
          <Reveal delay={100}>
            <ol className="mt-12 grid gap-px border sm:grid-cols-3" style={{ borderColor: C.rule, backgroundColor: C.rule }}>
              {[
                { icon: Radio, t: "Tier 1 · WebRTC", d: "A data channel over the shared local network. Fastest path, and the only one that moves a full store in seconds." },
                { icon: QrCode, t: "Tier 2 · Camera QR", d: "No Wi-Fi at all: gzip payloads play as animated QR frames and the other camera reassembles them, capped to keep frame counts sane." },
                { icon: Printer, t: "Tier 3 · Printed drops", d: "A bundle of recent news and top alerts printed as a poster. Anyone who passes can scan it and print an updated one elsewhere." },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.t} className="px-6 py-7" style={{ backgroundColor: C.canvas }}>
                    <Icon size={18} aria-hidden="true" style={{ color: C.amber }} />
                    <h3 className="mt-3 font-mono text-sm uppercase tracking-[0.14em]">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>
                      {s.d}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* --- SIGNATURE: the sync trace --- */}
          <Reveal delay={80}>
            <div className="mt-16">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl tracking-tight">One sync, end to end</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: C.muted }}>
                    Four phases, then eight gates every inbound message must pass
                    before it is stored. Nothing is taken on trust.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={runTrace}
                    disabled={running}
                    className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-opacity duration-200 focus:outline-none focus-visible:ring-1 disabled:opacity-40"
                    style={{ backgroundColor: C.amber, color: C.canvas, outlineColor: C.amber }}
                  >
                    <Play size={13} aria-hidden="true" />
                    Run a sync
                  </button>
                  <button
                    type="button"
                    onClick={resetTrace}
                    className="inline-flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-1"
                    style={{ borderColor: C.rule, color: C.muted, outlineColor: C.amber }}
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    Reset
                  </button>
                </div>
              </div>

              <div
                className="mt-6 border p-5 sm:p-6"
                style={{ borderColor: C.rule, backgroundColor: C.panel, minHeight: 420 }}
                aria-live="polite"
              >
                {step === 0 ? (
                  <p className="font-mono text-xs" style={{ color: C.faint }}>
                    idle · two devices in range · press run
                  </p>
                ) : (
                  <ol className="space-y-1.5">
                    {TRACE.slice(0, step).map((l, i) => (
                      <li
                        key={l.line}
                        className="font-mono text-xs leading-relaxed"
                        style={{
                          color:
                            l.t === "phase"
                              ? C.amber
                              : l.t === "done"
                              ? C.text
                              : l.t === "gate"
                              ? C.muted
                              : C.muted,
                          paddingTop: l.t === "phase" && i > 0 ? 12 : 0,
                        }}
                      >
                        {l.t === "gate" && <span style={{ color: C.amberDim }}>✓ </span>}
                        {l.t === "ok" && <span style={{ color: C.amberDim }}>· </span>}
                        {l.line}
                        {l.note && (
                          <span className="block pl-4" style={{ color: C.faint }}>
                            {l.note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.faint }}>
                <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                Rejections are silent by design — a tampered id or a bad hop
                signature is dropped with a console warning and no negative
                acknowledgement to the sender.
              </p>
            </div>
          </Reveal>

          {/* --- Engineering decisions --- */}
          <div className="mt-16">
            <Reveal>
              <h3 className="text-2xl tracking-tight">Three decisions worth defending</h3>
            </Reveal>
            <div className="mt-8 grid gap-px border lg:grid-cols-3" style={{ borderColor: C.rule, backgroundColor: C.rule }}>
              {DECISIONS.map((d, i) => (
                <Reveal key={d.title} delay={i * 110}>
                  <article className="h-full px-6 py-7" style={{ backgroundColor: C.canvas }}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.amber }}>
                      {d.tag}
                    </p>
                    <h4 className="mt-3 text-base leading-snug">{d.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>
                      {d.body}
                    </p>
                    <p
                      className="mt-5 inline-block border px-2.5 py-1 font-mono text-[11px]"
                      style={{ borderColor: C.rule, color: C.faint }}
                    >
                      {d.file}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          {/* --- Stack badges --- */}
          <Reveal delay={80}>
            <div className="mt-16 border-t pt-10" style={{ borderColor: C.rule }}>
              <h3 className="font-mono text-xs uppercase tracking-[0.28em]" style={{ color: C.amber }}>
                Stack
              </h3>
              <dl className="mt-6 space-y-5">
                {STACK.map((s) => (
                  <div key={s.group} className="sm:flex sm:gap-8">
                    <dt className="w-36 shrink-0 font-mono text-sm uppercase tracking-[0.14em]">{s.group}</dt>
                    <dd className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                      {s.items.map((item) => (
                        <span
                          key={item}
                          className="border px-2.5 py-1 font-mono text-xs transition-colors duration-200 hover:bg-white/5"
                          style={{ borderColor: C.rule, color: C.muted }}
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.faint }}>
                <Fingerprint size={13} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.amber }} />
                Honest limitations: WebRTC needs both phones on the same local
                network, sync completeness is probabilistic, and local storage is
                currently bounded only by message expiry — the documented
                500-message LRU eviction is not built yet. Throughput and maximum
                practical mesh size are unmeasured.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          6 — FOOTER CTA
          ================================================================== */}
      <footer style={{ backgroundColor: C.canvas }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-7">
                <h2 className="text-3xl leading-tight tracking-tight sm:text-4xl">
                  Read the protocol. It's about 5,800 lines.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: C.muted }}>
                  Bloom-filter delta sync, Ed25519 hop chains, canonical
                  content addressing and three transports that degrade into each
                  other — all client-side, with no backend to read.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row min-w-0 lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="https://github.com/zssain/pingpong" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-1"
                  style={{ backgroundColor: C.amber, color: C.canvas, outlineColor: C.amber }}
                >
                  <Github size={14} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 border px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-1"
                  style={{ borderColor: C.rule, color: C.text, outlineColor: C.amber }}
                >
                  Get in touch
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <div
            className="mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: C.rule }}
          >
            <Logo />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs" style={{ color: C.muted }}>
              <span>Built by Zuhair Hussain</span>
              <a
                href="https://www.linkedin.com/in/zuhairhussain28/"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white focus:outline-none focus-visible:ring-1"
                style={{ outlineColor: C.amber }}
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="transition-colors hover:text-white focus:outline-none focus-visible:ring-1"
                style={{ outlineColor: C.amber }}
              >
                mohammedzuhairhussain28@gmail.com
              </a>
              {/* TODO: no LICENSE file exists in the repo — set one or delete this line */}
              <span className="inline-flex items-center gap-1.5">
                <Database size={12} aria-hidden="true" />
                Licence: TODO
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
