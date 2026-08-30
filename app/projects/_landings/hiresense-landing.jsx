"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  Crosshair,
  Scale,
  EyeOff,
  MessageCircle,
  Lightbulb,
  FileSpreadsheet,
  SlidersHorizontal,
  FileText,
  Brain,
  Database,
  Terminal,
  AlertTriangle,
} from "lucide-react";

/* ============================================================================
   HIRESENSE — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout; inline styles carry the exact hexes from
   the Streamlit dashboard (field #0E1117, block #1A1C23, coral #F0595B).
   Motion: CSS transitions + IntersectionObserver (no framer-motion dependency).
   ========================================================================== */

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  field: "#0E1117", // Streamlit dark base
  block: "#1A1C23", // input / card blocks
  blockHi: "#22252E",
  rule: "#2A2E38",
  text: "#FAFAFA",
  muted: "#9BA1AC",
  faint: "#6B7280",
  coral: "#F0595B", // primary action, active stage
  coralSoft: "rgba(240,89,91,0.12)",
  coralDim: "#7A2E2F",
  teal: "#4FB6A5", // secondary signal (match score)
  amber: "#D9A441",
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
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.coral }}>
      {children}
    </p>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md"
        style={{ backgroundColor: C.coralSoft }}
      >
        <Crosshair size={15} style={{ color: C.coral }} />
      </span>
      <span className="text-base font-bold tracking-tight" style={{ color: C.text }}>
        HireSense
      </span>
    </span>
  );
}

/* --- Content: the agent relay (signature element) -------------------------
   Seven single-purpose scripts, run in a fixed order by the supervisor. Each
   reads the previous stage's CSV and writes its own — that handoff is the
   whole architecture, so it earns the numbering.
   ------------------------------------------------------------------------- */
const AGENTS = [
  {
    n: 1,
    name: "JD optimizer",
    file: "jd_optimizer.py",
    reads: "job_description.csv",
    writes: "optimized_jds.csv",
    model: "t5-small · spaCy en_core_web_sm",
    body:
      "Scores the job post's Flesch-Kincaid grade. Above 10, T5 paraphrases it into plainer language; at or below, the text passes through untouched. Named entities are extracted either way.",
  },
  {
    n: 2,
    name: "CV grader",
    file: "cv_grader.py",
    reads: "optimized_jds.csv + PDFs",
    writes: "cv_grading_results.csv",
    model: "all-MiniLM-L6-v2 · cosine similarity",
    body:
      "Extracts text from every uploaded PDF, embeds each CV and the job description as 384-dimension vectors, and ranks candidates by cosine similarity. Meaning, not keyword overlap.",
  },
  {
    n: 3,
    name: "Bias monitor",
    file: "bias_agent.py",
    reads: "cv_grading_results.csv",
    writes: "cv_bias_fairness.csv",
    model: "lexicon match · spaCy NER",
    body:
      "Flags loaded terms from an eight-word lexicon in both the job post and the CVs, and replaces every detected personal name with [REDACTED] before a human reads the shortlist.",
  },
  {
    n: 4,
    name: "Persona scorer",
    file: "persona_agent.py",
    reads: "cv_bias_fairness.csv",
    writes: "persona_fit_results.csv",
    model: "distilbert-base-uncased-sst-2",
    body:
      "Adds a soft signal on top of the raw match: 0.7 × positive sentiment plus 0.3 × a normalised count of soft-skill keywords.",
  },
  {
    n: 5,
    name: "Explainer",
    file: "explainability_agent.py",
    reads: "persona_fit_results.csv",
    writes: "explainability_results.csv",
    model: "sklearn LinearRegression · SHAP",
    body:
      "Fits a linear model over the match and persona scores, then uses SHAP to write a per-candidate sentence naming which feature moved the score and by how much.",
  },
  {
    n: 6,
    name: "Feedback blend",
    file: "feedback_agent.py",
    reads: "explainability_results.csv",
    writes: "feedback_adjusted_results.csv",
    model: "deterministic arithmetic",
    body:
      "Combines the two scores into a composite — 0.6 × match plus 0.4 × persona — and applies a small adjustment to produce the final ranking number.",
  },
  {
    n: 7,
    name: "Shortlist",
    file: "sql_agent.py",
    reads: "feedback_adjusted_results.csv",
    writes: "final_selected_candidates.csv",
    model: "SQLite",
    body:
      "Loads every candidate into a twelve-column table, selects the rows at or above the score threshold, and writes the shortlist the dashboard renders.",
  },
];

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: Crosshair,
    title: "Semantic CV match",
    body: "Ranks candidates by how close their CV is to the job in meaning, so good applicants aren't lost to different wording.",
  },
  {
    icon: Scale,
    title: "Biased-language flags",
    body: "Catches loaded terms like 'rockstar' and 'ninja' in the job post and in the CVs themselves.",
  },
  {
    icon: EyeOff,
    title: "Name redaction",
    body: "Detected personal names are replaced with [REDACTED] before anyone reviews the shortlist.",
  },
  {
    icon: MessageCircle,
    title: "Persona signal",
    body: "A sentiment and soft-skills score sits alongside the raw match rather than being folded invisibly into it.",
  },
  {
    icon: Lightbulb,
    title: "Per-candidate explanation",
    body: "Every ranking carries a sentence naming which feature moved the score, so no result is unexplained.",
  },
  {
    icon: FileSpreadsheet,
    title: "Inspectable at every stage",
    body: "Each of the seven stages writes a CSV you can open. Nothing about the ranking is hidden in memory.",
  },
];

/* --- Content: engineering decisions -------------------------------------- */
const DECISIONS = [
  {
    tag: "Orchestration",
    title: "Agents talk through CSV files, not function calls.",
    body: "The supervisor runs each of the seven agents as its own subprocess, and every handoff is a file on disk. That buys three things: any stage can be run alone from the command line, the intermediate state is inspectable by opening a spreadsheet, and a failure is localised to one script instead of one long traceback. The cost is honest and known — every run cold-loads T5, MiniLM, distilbert and spaCy from scratch, seven Python starts deep. Simplicity over speed, chosen on purpose for a build with a deadline.",
    file: "supervisor.py:17-35",
  },
  {
    tag: "Preprocessing",
    title: "Rewrite the job post only when it needs rewriting.",
    body: "Paraphrasing every job description would be a good way to quietly corrupt half of them. Instead the optimizer computes a Flesch-Kincaid grade first and only calls T5 when the post reads above grade 10. A clearly-written job description passes through byte for byte, and the model is spent on the ones that are actually dense.",
    file: "jd_optimizer.py:80-88",
  },
  {
    tag: "Retrieval",
    title: "One vector per CV, and the limit that comes with it.",
    body: "Each CV is embedded whole rather than chunked, and compared to a single job-description vector by brute-force cosine — no vector database, no ANN index, no top-k cutoff. At hackathon scale that is the right amount of machinery, and it keeps the scoring trivial to reason about. It also carries a real limit worth naming: MiniLM truncates at roughly 256 word-piece tokens, so anything past about half a page of CV never reaches the score.",
    file: "cv_grader.py:62-63",
  },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  { group: "Interface", items: ["Streamlit ≥1.32"] },
  { group: "Orchestration", items: ["Python subprocess", "pandas ≥2.2", "numpy ≥1.26"] },
  { group: "NLP", items: ["sentence-transformers", "all-MiniLM-L6-v2 (384-d)", "t5-small", "distilbert-SST2", "spaCy en_core_web_sm"] },
  { group: "Scoring", items: ["scikit-learn ≥1.4", "SHAP ≥0.44", "PyTorch ≥2.2"] },
  { group: "Storage", items: ["SQLite", "PyPDF2 ≥3.0", "CSV artifacts per stage"] },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "7", label: "pipeline agents" },
  { value: "4", label: "NLP models, all local" },
  { value: "384", label: "embedding dimensions" },
  { value: "898", label: "lines of Python" },
  { value: "12", label: "columns per candidate row" },
  { value: "0", label: "API keys required" },
];

/* ========================================================================== */

export default function HireSenseLanding() {
  const [activeN, setActiveN] = useState(2); // CV grader — the interesting one
  const active = AGENTS.find((a) => a.n === activeN) || AGENTS[0];

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: C.field, color: C.text }}>
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.rule, backgroundColor: "rgba(14,17,23,0.9)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="rounded-md focus:outline-none focus-visible:ring-2" style={{ outlineColor: C.coral }}>
            <Logo />
          </a>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a href="#how" className="hidden rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5 sm:inline-block" style={{ color: C.muted }}>
              How it works
            </a>
            <a href="#engineering" className="hidden rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5 sm:inline-block" style={{ color: C.muted }}>
              Engineering
            </a>
            {/* TODO: repository URL */}
            <a
              href="https://github.com/zssain/HireSense" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ borderColor: C.rule, color: C.text }}
            >
              <Github size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Source</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ==================================================================
          1 — HERO
          ================================================================== */}
      <section id="top" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow>Explainable CV screening</Eyebrow>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Seven agents.
              <br />
              One shortlist.
              <br />
              Every score explained.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: C.muted }}>
              HireSense scores a stack of CVs against one job description using
              sentence embeddings, flags biased language on both sides, redacts
              names before review, and attaches a reason to every ranking it
              produces.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="https://github.com/zssain/HireSense" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: C.coral, color: "#160607", outlineColor: C.coral }}
              >
                <Github size={16} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: C.rule, color: C.text, outlineColor: C.coral }}
              >
                Read the architecture
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-6 text-xs" style={{ color: C.faint }}>
              Streamlit · sentence-transformers · SHAP · SQLite · runs entirely on CPU
            </p>
          </Reveal>

          {/* --- A candidate row, as the dashboard renders it --- */}
          <Reveal delay={140} className="lg:col-span-6">
            <div className="rounded-lg border p-6" style={{ borderColor: C.rule, backgroundColor: C.block }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Ranked candidate</p>
                <span className="rounded px-2 py-0.5 font-mono text-xs" style={{ backgroundColor: C.coralSoft, color: C.coral }}>
                  #1 of 40
                </span>
              </div>

              {/* TODO: replace with a row from a real run once you have one to publish */}
              <p className="mt-4 font-mono text-sm" style={{ color: C.muted }}>
                candidate_id: cv_0417.pdf
              </p>
              <p className="mt-1 font-mono text-sm" style={{ color: C.muted }}>
                candidate_name: [REDACTED]
              </p>

              <dl className="mt-5 space-y-3">
                {[
                  { k: "Match score", v: 0.81, c: C.teal },
                  { k: "Persona fit", v: 0.64, c: C.amber },
                  { k: "Composite", v: 0.74, c: C.coral },
                ].map((row) => (
                  <div key={row.k}>
                    <div className="flex items-baseline justify-between">
                      <dt className="text-xs uppercase tracking-wide" style={{ color: C.faint }}>
                        {row.k}
                      </dt>
                      <dd className="font-mono text-sm tabular-nums">{row.v.toFixed(2)}</dd>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: C.blockHi }}>
                      <div className="h-full rounded-full" style={{ width: `${row.v * 100}%`, backgroundColor: row.c }} />
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-5 rounded-md border p-4" style={{ borderColor: C.rule, backgroundColor: C.field }}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: C.faint }}>
                  <Lightbulb size={12} aria-hidden="true" />
                  Explanation
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: C.text }}>
                  Match to the job description increases the score by 0.14;
                  persona fit decreases it by 0.03.
                </p>
              </div>

              <p className="mt-4 text-xs" style={{ color: C.faint }}>
                Bias flags: none detected · name redacted before review
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          Verified numbers strip
          ================================================================== */}
      <section className="border-b" style={{ borderColor: C.rule, backgroundColor: C.block }}>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {NUMBERS.map((n, i) => (
              <Reveal as="li" key={n.label} delay={i * 60}>
                <p className="text-3xl font-extrabold tracking-tight">{n.value}</p>
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
          <Reveal className="lg:col-span-5">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              A ranking nobody can explain is a ranking nobody should trust.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                Screening a stack of CVs by hand is slow, and the ordering rarely
                comes with a reason you could defend to the candidate who didn't
                make it. Keyword filters make it worse: they miss good people who
                phrased things differently and quietly reward whoever gamed the
                wording.
              </p>
              <p style={{ color: C.text }}>
                HireSense scores on meaning rather than exact terms, surfaces
                biased phrasing in the job post as well as the CVs, redacts names
                before a human looks, and attaches an explanation to every
                result. Each stage leaves a CSV behind, so the ranking can be
                audited after the fact.
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
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Six things every shortlist comes with.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal as="li" key={f.title} delay={i * 80}>
                  <div
                    className="h-full rounded-lg border p-6 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ borderColor: C.rule, backgroundColor: C.block }}
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                      style={{ backgroundColor: C.coralSoft, color: C.coral }}
                    >
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{f.title}</h3>
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
          The agent relay, engineering decisions, stack.
          ================================================================== */}
      <section id="engineering" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>Under the hood</Eyebrow>
            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Seven scripts, run in order, each one auditable on its own.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: C.muted }}>
              "Agent" here means a single-purpose Python script, not an
              autonomous model deciding what to do next. There is no LLM loop and
              no tool calling — the supervisor runs a fixed sequence, and each
              stage reads the previous stage's CSV and writes its own.
            </p>
          </Reveal>

          {/* --- SIGNATURE: the agent relay --- */}
          <Reveal delay={100}>
            <div className="mt-12 grid gap-6 lg:grid-cols-12">
              <ol className="lg:col-span-7" role="list">
                {AGENTS.map((a, i) => {
                  const isActive = a.n === activeN;
                  return (
                    <li key={a.n}>
                      <button
                        type="button"
                        onClick={() => setActiveN(a.n)}
                        aria-pressed={isActive}
                        className="flex w-full items-center gap-4 rounded-md px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2"
                        style={{
                          backgroundColor: isActive ? C.block : "transparent",
                          outlineColor: C.coral,
                        }}
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs"
                          style={{
                            backgroundColor: isActive ? C.coral : C.blockHi,
                            color: isActive ? "#160607" : C.muted,
                          }}
                        >
                          {a.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold" style={{ color: isActive ? C.text : C.muted }}>
                            {a.name}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[11px]" style={{ color: C.faint }}>
                            {a.reads} → {a.writes}
                          </span>
                        </span>
                      </button>
                      {/* connector */}
                      {i < AGENTS.length - 1 && (
                        <span aria-hidden="true" className="ml-[26px] block h-3 w-px" style={{ backgroundColor: C.rule }} />
                      )}
                    </li>
                  );
                })}
              </ol>

              <div className="lg:col-span-5">
                <div className="h-full rounded-lg border p-6" style={{ borderColor: C.rule, backgroundColor: C.block }}>
                  <p className="font-mono text-xs" style={{ color: C.coral }}>
                    stage {active.n} / 7
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{active.name}</h3>
                  <p className="mt-1 font-mono text-xs" style={{ color: C.faint }}>
                    {active.file}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>
                    {active.body}
                  </p>

                  <dl className="mt-5 space-y-3 border-t pt-4" style={{ borderColor: C.rule }}>
                    <div>
                      <dt className="text-xs uppercase tracking-wide" style={{ color: C.faint }}>
                        Models loaded
                      </dt>
                      <dd className="mt-1 font-mono text-xs" style={{ color: C.text }}>
                        {active.model}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide" style={{ color: C.faint }}>
                        Writes
                      </dt>
                      <dd className="mt-1 font-mono text-xs" style={{ color: C.text }}>
                        {active.writes}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </Reveal>

          {/* --- Engineering decisions --- */}
          <div className="mt-16">
            <Reveal>
              <h3 className="text-2xl font-bold tracking-tight">Three decisions worth defending</h3>
            </Reveal>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {DECISIONS.map((d, i) => (
                <Reveal key={d.title} delay={i * 110}>
                  <article className="h-full rounded-lg border p-6" style={{ borderColor: C.rule, backgroundColor: C.block }}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: C.coral }}>
                      {d.tag}
                    </p>
                    <h4 className="mt-3 text-base font-bold leading-snug">{d.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>
                      {d.body}
                    </p>
                    <p
                      className="mt-5 inline-flex items-center gap-2 rounded px-2.5 py-1 font-mono text-[11px]"
                      style={{ backgroundColor: C.blockHi, color: C.faint }}
                    >
                      <Terminal size={11} aria-hidden="true" />
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
              <h3 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.coral }}>
                Stack
              </h3>
              <dl className="mt-6 space-y-5">
                {STACK.map((s) => (
                  <div key={s.group} className="sm:flex sm:gap-8">
                    <dt className="w-32 shrink-0 text-sm font-bold">{s.group}</dt>
                    <dd className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                      {s.items.map((item) => (
                        <span
                          key={item}
                          className="rounded border px-2.5 py-1 font-mono text-xs transition-colors duration-200 hover:bg-white/5"
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
                <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.amber }} />
                Honest limitations: the bias check is a fixed eight-word lexicon,
                and both it and the persona score read only the first 200
                characters of each CV. Long CVs are truncated at the embedding
                stage. Scanned image PDFs produce no text and are skipped
                silently. The SHAP explainer sits over a fixed 0.6/0.4 blend, so
                it restates those weights rather than discovering them. Nothing
                here has been benchmarked for match quality or bias-detection
                accuracy.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          6 — FOOTER CTA
          ================================================================== */}
      <footer style={{ backgroundColor: C.field }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  Eight files. No API keys. Runs on a laptop.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: C.muted }}>
                  Every model is a local download — MiniLM, T5-small, distilbert
                  and spaCy — so the whole pipeline runs offline on CPU. The
                  scoring logic is short enough to read in one sitting.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="https://github.com/zssain/HireSense" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: C.coral, color: "#160607", outlineColor: C.coral }}
                >
                  <Github size={16} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: C.rule, color: C.text, outlineColor: C.coral }}
                >
                  Get in touch
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <div
            className="mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: C.rule }}
          >
            <Logo />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: C.muted }}>
              <span>Built by Zuhair Hussain</span>
              <a
                href="https://www.linkedin.com/in/zuhairhussain28/"
                target="_blank"
                rel="noreferrer"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.coral }}
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.coral }}
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

          <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.faint }}>
            <Brain size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
            HireSense ranks and explains; it does not decide. Automated CV
            screening should support a human reviewer, not replace one.
          </p>
        </div>
      </footer>
    </div>
  );
}
