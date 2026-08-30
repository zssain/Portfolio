"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  Repeat,
  Lock,
  Scale,
  ScrollText,
  Search,
  ShieldCheck,
  Globe,
  Landmark,
  Database,
  Layers,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  FileCheck,
} from "lucide-react";

/* ============================================================================
   APERTURE — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout/type; inline styles carry the exact brand
   hexes pulled from the app screenshots (navy #16243A, green #3F9C6D,
   action blue #2B4A7C).
   Motion: CSS transitions + IntersectionObserver (no framer-motion dependency).
   ========================================================================== */

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  ink: "#16243A", // navy panel / sidebar
  inkDeep: "#101B2C", // footer, deepest band
  inkSoft: "#22344F", // hairlines on navy
  paper: "#FFFFFF",
  mist: "#F7F8FA", // light section background
  rule: "#E3E7EC", // hairline on paper
  text: "#101828", // primary text on paper
  muted: "#5A6675", // secondary text on paper
  mutedOnInk: "#9FB0C6", // secondary text on navy
  green: "#3F9C6D", // "verified / decided" accent — used sparingly
  greenSoft: "#EAF5EF",
  blue: "#2B4A7C", // primary action
  amber: "#B26B12",
  amberSoft: "#FDF3E4",
};

const SERIF =
  '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif';

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
function Eyebrow({ children, onInk = false }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.18em] mb-4"
      style={{ color: onInk ? C.green : C.green }}
    >
      {children}
    </p>
  );
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#EFF1F4", fg: "#475467" },
    green: { bg: C.greenSoft, fg: "#2E7A54" },
    amber: { bg: C.amberSoft, fg: C.amber },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium font-mono"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}

function Logo({ onInk = false }) {
  const bar = onInk ? "#FFFFFF" : C.ink;
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className="inline-flex items-end gap-[3px]">
        <span
          className="block rounded-sm"
          style={{ width: 5, height: 16, backgroundColor: C.green }}
        />
        <span
          className="block rounded-sm"
          style={{ width: 5, height: 10, backgroundColor: bar }}
        />
        <span
          className="block rounded-sm"
          style={{ width: 5, height: 20, backgroundColor: bar }}
        />
      </span>
      <span
        className="text-lg tracking-tight"
        style={{ fontFamily: SERIF, color: onInk ? "#FFFFFF" : C.text }}
      >
        Aperture
      </span>
    </span>
  );
}

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: Repeat,
    title: "Replayable decisions",
    body: "Any decision reproduces exactly, offline — no network, no AI — from stored point-in-time artifacts.",
  },
  {
    icon: Lock,
    title: "Immutable audit trail",
    body: "Decisions, evidence and snapshots are immutable at the database trigger level; the ledger is hash-chained.",
  },
  {
    icon: Scale,
    title: "The policy decides, not the model",
    body: "A pure, versioned 9-gate engine makes the call. The risk model only ranks — the split is enforced in code.",
  },
  {
    icon: ScrollText,
    title: "Reasons and a path to yes",
    body: "Every decision ships plain-language reasons plus concrete recourse: a decline says what would flip it.",
  },
  {
    icon: Search,
    title: "Transparent risk model",
    body: "An additive-logistic scorecard, 11 published weights, exact closed-form contributions. No SHAP approximation.",
  },
  {
    icon: ShieldCheck,
    title: "Manipulation detection",
    body: "Eight independent detectors — circular flow, inflow bursts, balance-arithmetic tampering — band fraud risk.",
  },
];

/* --- Content: the 9-gate policy ladder (the page's signature element) ----- */
const GATES = [
  {
    n: 1,
    label: "Manipulation HIGH",
    outcome: "FRAUD_REVIEW",
    tone: "amber",
    note: "Any HIGH finding routes to a human fraud reviewer with the specific cited transactions. Never an automated decline.",
  },
  {
    n: 2,
    label: "Affordability FAIL",
    outcome: "DECLINE",
    tone: "neutral",
    note: "Debt-service ratio breaches the 0.5 ceiling under a stress test of −15% income and +20% obligations.",
  },
  {
    n: 3,
    label: "Affordability INDETERMINATE",
    outcome: "REVIEW_EVIDENCE",
    tone: "amber",
    note: "Income could not be observed. Unobservable is not the same as unaffordable, so this refers — it never fails.",
  },
  {
    n: 4,
    label: "Coverage below minimum",
    outcome: "REVIEW_EVIDENCE",
    tone: "amber",
    note: "Evidence is too thin to decide on. Recourse names the exact source that would raise the coverage score.",
  },
  {
    n: 5,
    label: "Manipulation ELEVATED",
    outcome: "REVIEW_FRAUD",
    tone: "amber",
    note: "Two or more medium findings, or a lone medium above 0.75 confidence. A skipped detector is never read as clean.",
  },
  {
    n: 6,
    label: "PD over decline threshold",
    outcome: "DECLINE_RISK",
    tone: "neutral",
    note: "The scorecard ranks this applicant past the configured ceiling. The PD is a ranking, not a calibrated probability.",
  },
  {
    n: 7,
    label: "Low PD + high coverage",
    outcome: "APPROVE_ENHANCED",
    tone: "green",
    note: "Strong signal on well-evidenced cash flow. Principal is bound by the affordability headroom, not the score.",
  },
  {
    n: 8,
    label: "Standard PD + mid coverage",
    outcome: "APPROVE_STANDARD",
    tone: "green",
    note: "The ordinary approval path: stable inflow, on-time utility streak, DSR inside the ceiling.",
  },
  {
    n: 9,
    label: "Catch-all",
    outcome: "APPROVE_STARTER",
    tone: "green",
    note: "Nothing disqualifying fired. A starter line rather than a decline, so a thin file still gets a way in.",
  },
];

/* --- Content: engineering decisions (the section recruiters read) -------- */
const DECISIONS = [
  {
    tag: "Transaction boundaries",
    title: "The decision and its audit entry commit together. Recourse does not.",
    body: "The decision row, its reasons, and the append-only ledger entry all commit inside a single database transaction, so an auditable decision without its ledger entry can never exist. But the path-to-yes search runs outside that transaction — a slow or failed recourse computation must never roll back a decision that already legally stands. The ledger append serialises per tenant behind a row lock, so concurrent decisions can't reorder the hash chain.",
    file: "orchestrator/service.py:94",
  },
  {
    tag: "Point-in-time features",
    title: "Missing is null, never zero — and there is no fallback score.",
    body: "The feature snapshot loads only ledger events with occurred_at <= as_of, so a decision can only ever see what was knowable when it was made. Absent data is recorded as null with a lineage entry rather than coerced to 0, because a zero is a claim and an absence isn't. If the model artifact is missing, its hash mismatches, or the PD falls outside [0,1], the request raises SYSTEM_UNAVAILABLE — nothing is persisted. A wrong number is worse than no number.",
    file: "features/service.py:144",
  },
  {
    tag: "Enforced separation",
    title: "The language model has no import path into the decision.",
    body: "The LLM does three read-only jobs: phrasing applicant notices in English or Hindi, explaining a decision to an analyst, and answering questions about the architecture — each from typed facts only, with a deterministic fallback when it times out. It is kept out of the decision path structurally, not by convention: import-linter forbids the manipulation module from importing risk, coverage or affordability, and its context type cannot even carry a probability of default.",
    file: "policy/engine.py — no LLM import",
  },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  {
    group: "Backend",
    items: ["Python 3.11", "FastAPI", "Pydantic 2", "SQLAlchemy 2 async", "asyncpg", "Alembic", "Argon2id"],
  },
  {
    group: "Data",
    items: ["PostgreSQL 16", "pgvector", "29 tables · 8 trigger-immutable", "Hash-chained ledgers"],
  },
  {
    group: "ML & retrieval",
    items: ["Additive-logistic scorecard", "scikit-learn", "MiniLM-L6-v2 (local)", "HNSW · cosine · 384-dim"],
  },
  {
    group: "Frontend",
    items: ["React 18", "TypeScript 5.6", "Vite", "TanStack Query", "Tailwind", "Playwright"],
  },
  {
    group: "Delivery",
    items: ["Docker Compose", "GitHub Actions", "ruff · mypy --strict", "import-linter"],
  },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "9", label: "policy gates" },
  { value: "8", label: "fraud detectors" },
  { value: "4", label: "independent assessments" },
  { value: "11", label: "scorecard features" },
  { value: "362", label: "backend tests" },
  { value: "0", label: "LLM calls in the decision path" },
];

/* ========================================================================== */

export default function ApertureLanding() {
  const [activeGate, setActiveGate] = useState(3); // matches the demo record below
  const gate = GATES.find((g) => g.n === activeGate) || GATES[0];

  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased"
      style={{ backgroundColor: C.paper, color: C.text }}
    >
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.rule, backgroundColor: "rgba(255,255,255,0.92)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#top"
            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ outlineColor: C.blue }}
          >
            <Logo />
          </a>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#how"
              className="hidden rounded px-3 py-2 text-sm transition-colors sm:inline-block hover:bg-gray-100"
              style={{ color: C.muted }}
            >
              How it works
            </a>
            <a
              href="#engineering"
              className="hidden rounded px-3 py-2 text-sm transition-colors sm:inline-block hover:bg-gray-100"
              style={{ color: C.muted }}
            >
              Engineering
            </a>
            {/* TODO: replace with the real repository URL */}
            <a
              href="https://github.com/zssain/Aperture" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: C.text }}
            >
              <Github size={16} aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ==================================================================
          1 — HERO
          Left: positioning. Right: a real decision record from the queue.
          ================================================================== */}
      <section id="top" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12 lg:gap-12">
          <Reveal className="min-w-0 lg:col-span-6">
            <Eyebrow>Credit decisioning</Eyebrow>
            <h1
              className="text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
              style={{ fontFamily: SERIF, color: C.text }}
            >
              The model estimates.
              <br />
              The policy decides.
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed"
              style={{ color: C.muted }}
            >
              Aperture underwrites thin-file and new-to-credit applicants from
              consented cash-flow evidence. Four independent checks, one
              deterministic policy, and every decision replayable offline with
              its reasons and a path to yes.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="https://github.com/zssain/Aperture" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: C.blue, outlineColor: C.blue }}
              >
                <Github size={16} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 rounded border px-6 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: C.rule, color: C.text, outlineColor: C.blue }}
              >
                Read the architecture
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-6 font-mono text-xs" style={{ color: C.muted }}>
              FastAPI · PostgreSQL 16 · pgvector · React 18
            </p>
          </Reveal>

          {/* --- Decision record card (data taken from the live queue) ----- */}
          <Reveal delay={140} className="min-w-0 lg:col-span-6">
            <div
              className="overflow-hidden rounded-lg border shadow-sm"
              style={{ borderColor: C.rule }}
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ backgroundColor: C.ink }}
              >
                <span
                  className="font-mono text-xs uppercase tracking-[0.16em]"
                  style={{ color: C.mutedOnInk }}
                >
                  Decision record
                </span>
                <span className="font-mono text-xs" style={{ color: C.mutedOnInk }}>
                  APL-1112
                </span>
              </div>

              <div className="px-5 py-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm" style={{ color: C.muted }}>
                      Requested principal
                    </p>
                    <p
                      className="text-2xl"
                      style={{ fontFamily: SERIF, color: C.text }}
                    >
                      ₹25,000.00
                    </p>
                  </div>
                  <Pill tone="amber">REFER</Pill>
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded border" style={{ borderColor: C.rule, backgroundColor: C.rule }}>
                  {[
                    { k: "PD", v: "0.049", pill: "UNCAL" },
                    { k: "Coverage", v: "79" },
                    { k: "Verification", v: "CLEAR", dot: true },
                  ].map((row) => (
                    <div key={row.k} className="px-3 py-3" style={{ backgroundColor: C.paper }}>
                      <dt
                        className="font-mono text-[11px] uppercase tracking-wider"
                        style={{ color: C.muted }}
                      >
                        {row.k}
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-mono text-sm" style={{ color: C.text }}>
                        {row.dot && (
                          <span
                            aria-hidden="true"
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: C.green }}
                          />
                        )}
                        {row.v}
                        {row.pill && <Pill>{row.pill}</Pill>}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 text-sm leading-relaxed" style={{ color: C.muted }}>
                  <span className="font-medium" style={{ color: C.text }}>
                    Routed because:
                  </span>{" "}
                  income was not observable from the connected sources, so gate 3
                  referred the case rather than failing it.
                </p>

                <div
                  className="mt-5 flex items-center gap-2 rounded px-3 py-2.5 font-mono text-[11px]"
                  style={{ backgroundColor: C.mist, color: C.muted }}
                >
                  <Hash size={13} aria-hidden="true" style={{ color: C.green }} />
                  <span className="truncate">
                    prev 9f2c…a81b → entry 04e7…dd10 · verify_chain() ok
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-xs" style={{ color: C.muted }}>
              Recorded once. Immutable. Reproducible offline.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          Verified numbers strip
          ================================================================== */}
      <section
        className="border-b"
        style={{ backgroundColor: C.mist, borderColor: C.rule }}
      >
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {NUMBERS.map((n, i) => (
              <Reveal as="li" key={n.label} delay={i * 60}>
                <p
                  className="text-3xl"
                  style={{ fontFamily: SERIF, color: n.value === "0" ? C.green : C.text }}
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
            <h2
              className="text-3xl leading-tight sm:text-4xl"
              style={{ fontFamily: SERIF }}
            >
              Rejected for having no history, not for being unable to repay.
            </h2>
          </Reveal>
          <Reveal delay={120} className="min-w-0 lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                New-to-credit and thin-file applicants get declined because they
                have no traditional score — and the systems doing the declining
                are black boxes. You can't reproduce a decision, prove it wasn't
                edited afterwards, or tell an applicant what would change the
                answer.
              </p>
              <p style={{ color: C.text }}>
                Aperture treats those as the actual requirements. It reads how
                money moves through a consented bank, UPI, utility and telecom
                history, runs four independent checks, and hands the result to a
                fixed rulebook that is the only thing allowed to decide. Every
                outcome is deterministic, immutable, explained in plain language,
                and shipped with a concrete path to yes.
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
            <h2
              className="max-w-2xl text-3xl leading-tight sm:text-4xl"
              style={{ fontFamily: SERIF }}
            >
              Built so an auditor, an analyst and an applicant can all get an
              answer.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-3"
              style={{ borderColor: C.rule, backgroundColor: C.rule }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal as="li" key={f.title} delay={i * 80}>
                  <div
                    className="group h-full px-6 py-7 transition-colors duration-200 hover:bg-gray-50"
                    style={{ backgroundColor: C.paper }}
                  >
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded transition-colors duration-200"
                      style={{ backgroundColor: C.greenSoft, color: "#2E7A54" }}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold" style={{ color: C.text }}>
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>
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
          Navy band: architecture flow, the 9-gate ladder, decisions, stack.
          ================================================================== */}
      <section id="engineering" style={{ backgroundColor: C.ink, color: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow onInk>Under the hood</Eyebrow>
            <h2
              className="max-w-3xl text-3xl leading-tight sm:text-4xl"
              style={{ fontFamily: SERIF, color: "#FFFFFF" }}
            >
              One path from evidence to decision, and nothing may skip a step.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: C.mutedOnInk }}>
              Consent gates ingestion; adapters normalise evidence into an
              immutable, hash-chained ledger. A point-in-time snapshot computes
              features from only what was knowable at decision time. Four
              independent assessments feed a pure policy engine — the single
              component permitted to decide.
            </p>
          </Reveal>

          {/* --- Architecture flow --- */}
          <Reveal delay={100}>
            <ol className="mt-12 grid gap-px overflow-hidden rounded-lg sm:grid-cols-2 lg:grid-cols-3"
                style={{ backgroundColor: C.inkSoft }}>
              {[
                { icon: FileCheck, t: "Consent-gated ingestion", d: "Bank, UPI, utility, telecom or an uploaded statement. Raw events land in an append-only ledger." },
                { icon: Database, t: "Point-in-time snapshot", d: "Only occurred_at <= as_of. Full lineage, a reproducible input hash, frozen immutably." },
                { icon: Layers, t: "Four assessments", d: "Risk, affordability, coverage, manipulation — none can read the others' results." },
                { icon: Scale, t: "Pure policy engine", d: "An ordered 9-gate ladder. No network, no clock, no unseeded randomness." },
                { icon: Lock, t: "One atomic write", d: "Decision, reasons and the audit entry commit in a single transaction." },
                { icon: Globe, t: "Phrasing only", d: "The LLM writes the notice in English or Hindi from typed facts. It never sees a path into the decision." },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.t} className="px-6 py-7" style={{ backgroundColor: C.ink }}>
                    <Icon size={18} aria-hidden="true" style={{ color: C.green }} />
                    <h3 className="mt-3 text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                      {s.t}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedOnInk }}>
                      {s.d}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* --- SIGNATURE: the 9-gate policy ladder --- */}
          <Reveal delay={80}>
            <div className="mt-16">
              <h3
                className="text-2xl"
                style={{ fontFamily: SERIF, color: "#FFFFFF" }}
              >
                The ladder that decides
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: C.mutedOnInk }}>
                Gates are walked in order and the first match wins. The same
                ordered tuple is the single source of truth for both the engine
                and the policy validator, so a rule can't exist in one and not
                the other. Select a gate to see what it does.
              </p>

              <div className="mt-8 grid gap-6 lg:grid-cols-12">
                <ul className="min-w-0 lg:col-span-7" role="list">
                  {GATES.map((g) => {
                    const isActive = g.n === activeGate;
                    return (
                      <li key={g.n}>
                        <button
                          type="button"
                          onClick={() => setActiveGate(g.n)}
                          aria-pressed={isActive}
                          className="flex w-full items-center gap-4 border-l-2 px-4 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: isActive ? C.green : C.inkSoft,
                            backgroundColor: isActive ? "rgba(63,156,109,0.10)" : "transparent",
                            outlineColor: C.green,
                          }}
                        >
                          <span
                            className="font-mono text-xs"
                            style={{ color: isActive ? C.green : C.mutedOnInk }}
                          >
                            {String(g.n).padStart(2, "0")}
                          </span>
                          <span
                            className="flex-1 text-sm"
                            style={{ color: isActive ? "#FFFFFF" : C.mutedOnInk }}
                          >
                            {g.label}
                          </span>
                          <span
                            className="font-mono text-[11px]"
                            style={{
                              color:
                                g.tone === "green"
                                  ? C.green
                                  : g.tone === "amber"
                                  ? "#D9A441"
                                  : C.mutedOnInk,
                            }}
                          >
                            {g.outcome}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="min-w-0 lg:col-span-5">
                  <div
                    className="rounded-lg border p-6"
                    style={{ borderColor: C.inkSoft, backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: C.green }}>
                      Gate {String(gate.n).padStart(2, "0")}
                    </p>
                    <p className="mt-3 text-lg" style={{ fontFamily: SERIF, color: "#FFFFFF" }}>
                      {gate.label}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.mutedOnInk }}>
                      {gate.note}
                    </p>
                    <p className="mt-5 font-mono text-xs" style={{ color: C.mutedOnInk }}>
                      → {gate.outcome}
                    </p>
                  </div>
                  <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.mutedOnInk }}>
                    <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                    Two modifier rules sit on top: approvals over the mandatory-review
                    ceiling are forced to a human, and a seeded, reproducible
                    exploration draw can lift a near-miss decline with an otherwise
                    clean profile.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* --- Engineering decisions --- */}
          <div className="mt-16">
            <Reveal>
              <h3 className="text-2xl" style={{ fontFamily: SERIF, color: "#FFFFFF" }}>
                Three decisions worth defending
              </h3>
            </Reveal>
            <div className="mt-8 grid gap-px overflow-hidden rounded-lg lg:grid-cols-3" style={{ backgroundColor: C.inkSoft }}>
              {DECISIONS.map((d, i) => (
                <Reveal key={d.title} delay={i * 110}>
                  <article className="h-full px-6 py-7" style={{ backgroundColor: C.ink }}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: C.green }}>
                      {d.tag}
                    </p>
                    <h4 className="mt-3 text-base font-semibold leading-snug" style={{ color: "#FFFFFF" }}>
                      {d.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.mutedOnInk }}>
                      {d.body}
                    </p>
                    <p
                      className="mt-5 inline-flex items-center gap-2 rounded px-2.5 py-1 font-mono text-[11px]"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", color: C.mutedOnInk }}
                    >
                      <Terminal size={12} aria-hidden="true" />
                      {d.file}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          {/* --- Stack badges --- */}
          <Reveal delay={80}>
            <div className="mt-16 border-t pt-10" style={{ borderColor: C.inkSoft }}>
              <h3 className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: C.green }}>
                Stack
              </h3>
              <dl className="mt-6 space-y-5">
                {STACK.map((s) => (
                  <div key={s.group} className="sm:flex sm:gap-8">
                    <dt className="w-36 shrink-0 text-sm font-medium" style={{ color: "#FFFFFF" }}>
                      {s.group}
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                      {s.items.map((item) => (
                        <span
                          key={item}
                          className="rounded border px-2.5 py-1 font-mono text-xs transition-colors duration-200 hover:bg-white/5"
                          style={{ borderColor: C.inkSoft, color: C.mutedOnInk }}
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.mutedOnInk }}>
                <CheckCircle2 size={14} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.green }} />
                Honest limitations: the scorecard is deliberately labelled
                UNCALIBRATED until real repayment outcomes exist, the Account
                Aggregator and lender integrations are simulated for the demo,
                and no accuracy or latency benchmarks have been published yet.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          6 — FOOTER CTA
          ================================================================== */}
      <footer style={{ backgroundColor: C.inkDeep, color: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-7">
                <h2 className="text-3xl leading-tight sm:text-4xl" style={{ fontFamily: SERIF, color: "#FFFFFF" }}>
                  Read the decision path end to end.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: C.mutedOnInk }}>
                  The same code path serves training and serving, and replay
                  reads stored artifacts only — no network, no model provider,
                  same result. The policy engine, the scorecard weights and the
                  replay tests are all in the repository.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row min-w-0 lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="https://github.com/zssain/Aperture" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: C.blue, outlineColor: C.green }}
                >
                  <Github size={16} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: C.inkSoft, color: "#FFFFFF", outlineColor: C.green }}
                >
                  Get in touch
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <div
            className="mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: C.inkSoft }}
          >
            <Logo onInk />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs" style={{ color: C.mutedOnInk }}>
              <span>Built by Zuhair Hussain</span>
              <a
                href="https://www.linkedin.com/in/zuhairhussain28/"
                target="_blank"
                rel="noreferrer"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.green }}
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.green }}
              >
                mohammedzuhairhussain28@gmail.com
              </a>
              {/* TODO: no LICENSE file exists in the repo — set one or delete this line */}
              <span className="inline-flex items-center gap-1.5">
                <Landmark size={12} aria-hidden="true" />
                Licence: TODO
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
