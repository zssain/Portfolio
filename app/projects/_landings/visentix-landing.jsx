"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  FileText,
  ShieldCheck,
  GitCompare,
  BarChart3,
  Gauge,
  Ban,
  UserCheck,
  RefreshCcw,
  Server,
  Database,
  Cpu,
  Layers,
  Quote,
  AlertTriangle,
  Check,
  Image as ImageIcon,
} from "lucide-react";

/* ============================================================================
   VISENTIX — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout/type; inline styles carry the exact hexes
   pulled from the admin console (navy #0F2A4A, field #F5F7FA, blue #2563AC).
   Motion: CSS transitions + IntersectionObserver (no framer-motion dependency).
   ========================================================================== */

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  navy: "#0F2A4A", // sidebar / anchoring bands
  navyDeep: "#0A1E37", // footer
  navySoft: "#1D3D63", // hairlines and chips on navy
  field: "#F5F7FA", // page background
  card: "#FFFFFF",
  border: "#E4EAF1",
  heading: "#12365E", // console headings
  text: "#1B2A3D",
  muted: "#5B6B7F",
  mutedOnNavy: "#9CB2CC",
  blue: "#2563AC", // selection / primary action
  blueSoft: "#EAF1FA",
  green: "#16A34A", // "system active"
  greenSoft: "#E8F6EE",
  red: "#DC3B3B", // "offline"
  gold: "#9A7B2F", // ACTIVE badge
  goldSoft: "#FAF3E2",
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
function Eyebrow({ children, onNavy = false }) {
  return (
    <p
      className="mb-4 text-xs font-bold uppercase tracking-[0.14em]"
      style={{ color: onNavy ? "#7FB0E8" : C.blue }}
    >
      {children}
    </p>
  );
}

function StatusDot({ color }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function Logo({ onNavy = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* Wordmark stands in for the chevron-V lockup in the app */}
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black"
        style={{
          backgroundColor: onNavy ? "#FFFFFF" : C.navy,
          color: onNavy ? C.navy : "#FFFFFF",
        }}
      >
        V
      </span>
      <span
        className="text-lg font-bold tracking-tight"
        style={{ color: onNavy ? "#FFFFFF" : C.heading }}
      >
        Visentix
      </span>
    </span>
  );
}

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: FileText,
    title: "Three ways in",
    body: "A URL, a PDF/DOCX/TXT upload, or pasted text — one shared pipeline behind all three.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    body: "URL fetches pass an SSRF guard, uploads are typed by their real bytes, and every route is role-gated.",
  },
  {
    icon: GitCompare,
    title: "Semantic matching",
    body: "Clauses link to actual regulator enforcement actions and statutory obligations by meaning, not keywords.",
  },
  {
    icon: BarChart3,
    title: "Fourteen explainable scores",
    body: "Exposure, benchmark deviation, disclosure maturity, transparency and AI readiness — each with its formula and inputs stored.",
  },
  {
    icon: Ban,
    title: "No legal verdicts",
    body: "A hard guardrail blocks words like violation or illegal from any generated text, and raises rather than shipping one.",
  },
  {
    icon: UserCheck,
    title: "Expert in the loop",
    body: "Nothing reaches a customer until a reviewer approves it; the report is then frozen and re-renders byte for byte.",
  },
];

/* --- Content: the confidence index (signature element) ------------------- */
const VCI_COMPONENTS = [
  { label: "NLP classification", weight: 30 },
  { label: "Benchmark cohort", weight: 25 },
  { label: "Regulatory coverage", weight: 15 },
  { label: "Enforcement match", weight: 15 },
  { label: "Source reliability", weight: 15 },
];

/* --- Content: engineering decisions -------------------------------------- */
const DECISIONS = [
  {
    tag: "Determinism",
    title: "The model labels and rephrases. It never scores.",
    body: "Qwen3:8b does exactly two jobs: classify a clause against a 30-type taxonomy, and rephrase a finding that has already been computed. Every score comes from formulas F-001 to F-014 whose weights and thresholds are read from a formula_version row, never hardcoded — so a score can be traced to the exact formula version that produced it. If a number could move because a model felt different today, nobody could stand behind the report.",
    file: "app/services/scoring/ · formula_version",
  },
  {
    tag: "Guardrail",
    title: "Banned verdict language raises instead of shipping.",
    body: "Generated prose is scanned for legal-verdict terms — violation, unlawful, non-compliant, liable — and assembly fails loudly rather than emitting one, because the product reports exposure, not legality. Verbatim source excerpts inside double or smart quotes are exempt, but single quotes deliberately are not: they collide with contractions, which is exactly how the GRD-003 regression got through the first time.",
    file: "app/services/guardrail.py",
  },
  {
    tag: "Cost control",
    title: "Startup validates the GPU backend without calling it.",
    body: "The classifier runs on a scale-to-zero RunPod Serverless endpoint, so there is no idle GPU bill — but a naive health check would wake the worker on every deploy and every uptime ping. Backend selection resolves from configuration alone, with no network call at boot, and /health reports model-backend state without touching the endpoint. The trade is a cold start on the first request after a quiet period.",
    file: "app/config.py:117-155",
  },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  { group: "Backend", items: ["Python 3.13", "FastAPI 0.115", "Pydantic 2.11", "APScheduler", "PyJWT"] },
  { group: "Data", items: ["Supabase Postgres", "pgvector 0.4 (ivfflat)", "~48 tables", "55 additive migrations", "Row-Level Security"] },
  { group: "AI & retrieval", items: ["Qwen3:8b via Ollama", "all-MiniLM-L6-v2", "384-dim, L2-normalised", "cosine similarity"] },
  { group: "Frontend", items: ["React 19", "TypeScript 6", "Vite 8", "React Router 7", "Recharts 3"] },
  { group: "Infra", items: ["Azure VM + Caddy", "RunPod Serverless", "Cloudflare", "WeasyPrint", "nightly pg_dump → S3"] },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "14", label: "scoring formulas" },
  { value: "30", label: "clause types in the taxonomy" },
  { value: "67", label: "API endpoints" },
  { value: "~48", label: "database tables" },
  { value: "985", label: "test functions" },
  { value: "0", label: "legal verdicts, by construction" },
];

/* --- Screenshot slot ------------------------------------------------------
   Shows the real capture when the file exists at `src`. Until then it draws a
   labelled frame at the exact aspect ratio so the layout doesn't collapse.
   -------------------------------------------------------------------------- */
function Shot({ src, w, h, alt, caption }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure>
      <div
        className="overflow-hidden rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-lg"
        style={{ borderColor: C.border, backgroundColor: C.card }}
      >
        {failed ? (
          <div
            className="flex flex-col items-center justify-center gap-2 px-6 text-center"
            style={{ aspectRatio: `${w} / ${h}`, backgroundColor: "#EBEFF5", color: C.muted }}
          >
            <ImageIcon size={20} aria-hidden="true" />
            <p className="font-mono text-xs">{src}</p>
            <p className="font-mono text-[11px]">
              {w} × {h}
            </p>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            width={w}
            height={h}
            loading="lazy"
            onError={() => setFailed(true)}
            className="block w-full"
            style={{ aspectRatio: `${w} / ${h}`, objectFit: "cover", backgroundColor: "#EBEFF5" }}
          />
        )}
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        {caption}
      </figcaption>
    </figure>
  );
}

/* ========================================================================== */

export default function VisentixLanding() {
  const [vci, setVci] = useState(72); // signature element: confidence index
  const suppressed = vci < 40;

  return (
    <div
      className="min-h-screen antialiased"
      style={{ backgroundColor: C.field, color: C.text }}
    >
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.border, backgroundColor: "rgba(245,247,250,0.92)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="rounded-lg focus:outline-none focus-visible:ring-2" style={{ outlineColor: C.blue }}>
            <Logo />
          </a>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#how"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white sm:inline-block"
              style={{ color: C.muted }}
            >
              How it works
            </a>
            <a
              href="#engineering"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white sm:inline-block"
              style={{ color: C.muted }}
            >
              Engineering
            </a>
            {/* TODO: repository URL */}
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white"
              style={{ color: C.heading }}
            >
              <Github size={16} aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ==================================================================
          1 — HERO
          Left: positioning. Right: a scorecard in the console's own idiom.
          ================================================================== */}
      <section id="top">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow>Privacy intelligence</Eyebrow>
            <h1
              className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl"
              style={{ color: C.heading }}
            >
              Read the fine print,
              <br />
              at scale.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: C.muted }}>
              Visentix reads a company's public privacy notice and turns it into
              a scorecard — what's disclosed, what's missing, how it compares to
              its peers — with every number traceable back to the clause it came
              from. It reports exposure, never legal verdicts.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: C.blue, outlineColor: C.blue }}
              >
                <Github size={16} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: C.border, color: C.heading, outlineColor: C.blue }}
              >
                Read the architecture
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-6 text-xs font-medium" style={{ color: C.muted }}>
              FastAPI · Supabase Postgres + pgvector · Qwen3:8b on RunPod Serverless
            </p>
          </Reveal>

          {/* --- Scorecard card, styled like the console --- */}
          <Reveal delay={140} className="lg:col-span-6">
            <div
              className="rounded-xl border p-6 shadow-sm"
              style={{ borderColor: C.border, backgroundColor: C.card }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: C.heading }}>
                  Assessment summary
                </h2>
                <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: C.green }}>
                  <StatusDot color={C.green} />
                  Reviewed
                </span>
              </div>
              <p className="mt-1 text-sm" style={{ color: C.muted }}>
                {/* TODO: swap for a real assessed company once you have permission to name one */}
                Example vendor notice · 212 substantive clauses
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { k: "Regulatory exposure", v: "F-002", n: "64", tone: C.gold },
                  { k: "Disclosure maturity", v: "F-005", n: "71", tone: C.blue },
                  { k: "Transparency", v: "F-006", n: "58", tone: C.gold },
                  { k: "AI transparency", v: "F-007", n: "34", tone: C.red },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-lg border px-4 py-3"
                    style={{ borderColor: C.border, backgroundColor: C.field }}
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      {s.k}
                    </dt>
                    <dd className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-bold" style={{ color: s.tone }}>
                        {s.n}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: C.muted }}>
                        {s.v}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div
                className="mt-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm leading-relaxed"
                style={{ backgroundColor: C.blueSoft, color: C.heading }}
              >
                <Quote size={15} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.blue }} />
                Every score stores its formula version, its inputs and its source
                lineage, so the same notice always produces the same report.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          Verified numbers strip
          ================================================================== */}
      <section className="border-y" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {NUMBERS.map((n, i) => (
              <Reveal as="li" key={n.label} delay={i * 60}>
                <p
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: n.value === "0" ? C.green : C.heading }}
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
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" style={{ color: C.heading }}>
              Nobody can compare a hundred privacy notices by reading them.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                Privacy policies are long, deliberately vague, and written by
                lawyers. Comparing one company's notice to another — or spotting
                what a policy quietly leaves out — is slow manual work, and any
                tool that automates it risks drifting into legal advice, which is
                the one thing a privacy team cannot ship.
              </p>
              <p style={{ color: C.text }}>
                Visentix splits a notice into clauses, labels each one against a
                30-type taxonomy, correlates it with real regulator enforcement
                actions, and runs a deterministic scoring engine over the result.
                It reports exposure and maturity, flags weak evidence rather than
                hiding it, and holds everything behind an expert reviewer before
                a customer sees a number.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          3 — FEATURE GRID
          ================================================================== */}
      <section id="how" className="border-y" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>What it does</Eyebrow>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" style={{ color: C.heading }}>
              Built to produce a number someone can defend in a meeting.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal as="li" key={f.title} delay={i * 80}>
                  <div
                    className="h-full rounded-xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: C.border, backgroundColor: C.field }}
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: C.blueSoft, color: C.blue }}
                    >
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-bold" style={{ color: C.heading }}>
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
          4 — TECHNICAL DEEP-DIVE (navy band)
          Pipeline, the confidence index, engineering decisions, stack.
          ================================================================== */}
      <section id="engineering" style={{ backgroundColor: C.navy, color: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow onNavy>Under the hood</Eyebrow>
            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              A straight pipeline, with the AI kept off the scoring path.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: C.mutedOnNavy }}>
              Extract, decompose, classify, score, review, freeze. There is no
              agent loop, no natural-language-to-SQL, and no retrieval-augmented
              generation — embeddings correlate clauses to enforcement actions
              and obligations, and their neighbours are never injected into a
              prompt.
            </p>
          </Reveal>

          {/* --- Pipeline --- */}
          <Reveal delay={100}>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: FileText, t: "Extract", d: "URL, upload or pasted text. URLs pass an SSRF guard; uploads are typed by magic bytes, not the filename they arrived with." },
                { icon: Layers, t: "Decompose", d: "A deterministic splitter walks the notice's real structure. A noise filter keeps headings and boilerplate for lineage but excludes them from scoring." },
                { icon: Cpu, t: "Classify", d: "Qwen3:8b labels each clause. On any failure it records an honest degraded result rather than a confident guess." },
                { icon: GitCompare, t: "Correlate", d: "384-dim MiniLM embeddings match clauses to enforcement actions above a 0.30 floor and obligations above 0.35, weighted by regulator priority." },
                { icon: BarChart3, t: "Score", d: "Formulas F-001 to F-014 run over substantive clauses only, with weights read from the database and lineage stored per score." },
                { icon: UserCheck, t: "Review and freeze", d: "An expert confirms or edits every finding; approval freezes a snapshot that re-renders to PDF identically." },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <li
                    key={s.t}
                    className="rounded-xl border px-6 py-6"
                    style={{ borderColor: C.navySoft, backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <Icon size={19} aria-hidden="true" style={{ color: "#7FB0E8" }} />
                    <h3 className="mt-3 text-sm font-bold">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedOnNavy }}>
                      {s.d}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* --- SIGNATURE: the confidence index --- */}
          <Reveal delay={80}>
            <div className="mt-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h3 className="text-2xl font-bold">The honesty layer</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: C.mutedOnNavy }}>
                  Every score carries a Confidence Index built from five weighted
                  inputs. Below 40, the finding is suppressed rather than shown —
                  a thin peer cohort or a degraded classification lowers
                  confidence, and a low-confidence number is worse than no
                  number. Drag the slider to see it.
                </p>

                <ul className="mt-6 space-y-2">
                  {VCI_COMPONENTS.map((c) => (
                    <li key={c.label} className="flex items-center justify-between text-sm">
                      <span style={{ color: C.mutedOnNavy }}>{c.label}</span>
                      <span className="font-mono text-xs" style={{ color: "#FFFFFF" }}>
                        {c.weight}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-7">
                <div
                  className="rounded-xl border p-6"
                  style={{ borderColor: C.navySoft, backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <label htmlFor="vci" className="block text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "#7FB0E8" }}>
                    Visentix Confidence Index
                  </label>
                  <div className="mt-3 flex items-center gap-4">
                    <input
                      id="vci"
                      type="range"
                      min={0}
                      max={100}
                      value={vci}
                      onChange={(e) => setVci(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${
                          suppressed ? C.red : C.green
                        } ${vci}%, ${C.navySoft} ${vci}%)`,
                        accentColor: suppressed ? C.red : C.green,
                      }}
                      aria-describedby="vci-state"
                    />
                    <span
                      className="w-14 shrink-0 text-right text-2xl font-extrabold tabular-nums"
                      style={{ color: suppressed ? C.red : C.green }}
                    >
                      {vci}
                    </span>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: C.mutedOnNavy }}>
                    Suppression threshold: 40
                  </p>

                  {/* The finding, suppressed or presented */}
                  <div
                    id="vci-state"
                    className="mt-6 rounded-lg border p-5 transition-all duration-300"
                    style={{
                      borderColor: suppressed ? "rgba(220,59,59,0.5)" : C.navySoft,
                      backgroundColor: suppressed ? "rgba(220,59,59,0.08)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    {suppressed ? (
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.red }} />
                        <div>
                          <p className="text-sm font-bold">Suppressed — not presented to the customer</p>
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.mutedOnNavy }}>
                            The evidence behind this finding is too weak to
                            report. The reviewer sees why it was withheld; the
                            customer sees nothing rather than a number that
                            can't be defended.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.green }} />
                        <div>
                          <p className="text-sm font-bold">Finding presented · retention disclosure</p>
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.mutedOnNavy }}>
                            Retention language is present but unspecific: no
                            defined period and no deletion trigger. Exposure is
                            elevated relative to the industry cohort. Phrased in
                            exposure terms only — never as a legal conclusion.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* --- Engineering decisions --- */}
          <div className="mt-16">
            <Reveal>
              <h3 className="text-2xl font-bold">Three decisions worth defending</h3>
            </Reveal>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {DECISIONS.map((d, i) => (
                <Reveal key={d.title} delay={i * 110}>
                  <article
                    className="h-full rounded-xl border p-6"
                    style={{ borderColor: C.navySoft, backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#7FB0E8" }}>
                      {d.tag}
                    </p>
                    <h4 className="mt-3 text-base font-bold leading-snug">{d.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.mutedOnNavy }}>
                      {d.body}
                    </p>
                    <p
                      className="mt-5 inline-flex items-center gap-2 rounded-md px-2.5 py-1 font-mono text-[11px]"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)", color: C.mutedOnNavy }}
                    >
                      <Server size={12} aria-hidden="true" />
                      {d.file}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          {/* --- Stack badges --- */}
          <Reveal delay={80}>
            <div className="mt-16 border-t pt-10" style={{ borderColor: C.navySoft }}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "#7FB0E8" }}>
                Stack
              </h3>
              <dl className="mt-6 space-y-5">
                {STACK.map((s) => (
                  <div key={s.group} className="sm:flex sm:gap-8">
                    <dt className="w-36 shrink-0 text-sm font-bold">{s.group}</dt>
                    <dd className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                      {s.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-md border px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-white/5"
                          style={{ borderColor: C.navySoft, color: C.mutedOnNavy }}
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.mutedOnNavy }}>
                <Gauge size={14} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: "#7FB0E8" }} />
                Honest limitations: it's a pilot. Classification quality and
                latency aren't formally benchmarked, background jobs run in a
                single process, and enforcement similarity is computed in Python
                rather than as an indexed pgvector query — fine at pilot scale,
                all first in line if it needed to serve load.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          5 — SCREENSHOT SHOWCASE
          Admin console capture is 3014 × 1800. Remaining slots are TODO.
          Drop files into /screenshots and keep the filenames below.
          ================================================================== */}
      <section className="border-b" style={{ borderColor: C.border }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>The console</Eyebrow>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" style={{ color: C.heading }}>
              Where an analyst runs and checks the work.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {[
              {
                src: "/screenshots/visentix-admin.png",
                w: 3014,
                h: 1800,
                wide: true,
                alt: "The Visentix admin console showing system health, live database record counts, the global gate mode selector and system operations.",
                caption:
                  "Admin console. Live record counts straight from Postgres, model-backend state reported without waking the scale-to-zero GPU, and the gate mode that decides whether customers see drafts at all.",
              },
              {
                // TODO: capture the intake screen (URL / upload / paste)
                src: "/screenshots/visentix-intake.png",
                w: 3014,
                h: 1800,
                alt: "TODO: the intake screen offering URL, file upload and pasted-text entry.",
                caption:
                  "Intake. One pipeline behind three entry points, with the SSRF guard and magic-byte typing applied before anything is stored.",
              },
              {
                // TODO: capture the workbench / review queue
                src: "/screenshots/visentix-workbench.png",
                w: 3014,
                h: 1800,
                alt: "TODO: the workbench where a reviewer confirms, edits or dismisses findings.",
                caption:
                  "Workbench. Every finding is confirmed, edited or dismissed by a reviewer, and each action is captured as a training label.",
              },
              {
                // TODO: capture a rendered report or the PDF output
                src: "/screenshots/visentix-report.png",
                w: 3014,
                h: 1800,
                alt: "TODO: a frozen report showing scores, findings and their source clauses.",
                caption:
                  "The frozen report. Once approved it re-renders byte for byte, with the model, corpus and benchmark versions stamped on every score.",
              },
            ].map((shot, i) => (
              <Reveal key={shot.src} delay={i * 90} className={shot.wide ? "lg:col-span-2" : undefined}>
                <Shot src={shot.src} w={shot.w} h={shot.h} alt={shot.alt} caption={shot.caption} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          6 — FOOTER CTA
          ================================================================== */}
      <footer style={{ backgroundColor: C.navyDeep, color: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  The scoring engine is the interesting part.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: C.mutedOnNavy }}>
                  Fourteen formulas, weights held in the database rather than in
                  code, a confidence index that suppresses its own output, and a
                  guardrail that would rather fail than call something illegal.
                  It's all in the repository.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: C.blue, outlineColor: "#7FB0E8" }}
                >
                  <Github size={16} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: C.navySoft, color: "#FFFFFF", outlineColor: "#7FB0E8" }}
                >
                  Get in touch
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <div
            className="mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: C.navySoft }}
          >
            <Logo onNavy />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: C.mutedOnNavy }}>
              <span>Built by Zuhair Hussain</span>
              <a
                href="https://www.linkedin.com/in/zuhairhussain28/"
                target="_blank"
                rel="noreferrer"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: "#7FB0E8" }}
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: "#7FB0E8" }}
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
