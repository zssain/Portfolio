"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  Zap,
  Bot,
  LineChart,
  ShieldCheck,
  CloudSun,
  ScrollText,
  RefreshCw,
  MessageSquare,
  Server,
  Database,
  Layers,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";

/* ============================================================================
   DYNAMIC PRICING ENGINE — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout; inline styles carry the exact hexes
   pulled from the app shell (canvas #0D0E11, card #16181D, action #2563EB).

   TODO (naming): the repo calls this both "Dynamic Pricing Engine" (folder,
   Dockerfile, app header) and "Hanco AI" (README, PROJECT_NAME). The app
   header wins below — pick one before publishing and update PRODUCT_NAME.
   ========================================================================== */

const PRODUCT_NAME = "Dynamic Pricing Engine";

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  canvas: "#0D0E11",
  card: "#16181D",
  cardHi: "#1C1F26",
  border: "#26292F",
  text: "#F2F4F7",
  muted: "#98A1B0",
  faint: "#6B7280",
  blue: "#2563EB", // primary action, ML stage
  blueSoft: "rgba(37,99,235,0.14)",
  emerald: "#10B981", // savings / approved stage
  emeraldSoft: "rgba(16,185,129,0.14)",
  amber: "#D9A441", // rules / loyalty
  amberSoft: "rgba(217,164,65,0.14)",
  red: "#EF5350",
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
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.blue }}>
      {children}
    </p>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="inline-block h-7 w-7 rounded-lg"
        style={{
          background:
            "conic-gradient(from 210deg, #7C3AED, #2563EB, #EC4899, #7C3AED)",
        }}
      />
      <span className="text-base font-bold tracking-tight" style={{ color: C.text }}>
        {PRODUCT_NAME}
      </span>
    </span>
  );
}

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: Zap,
    title: "One price, every channel",
    body: "The website, the chatbot and external API clients all call the same endpoint, so a quote in chat equals a quote on the site.",
    tint: C.blue,
    tintSoft: C.blueSoft,
  },
  {
    icon: LineChart,
    title: "Model and rules, blended",
    body: "A gradient-boosting baseline, informed by a SARIMA forecast of seasonal demand, combines 60/40 with a business-rules price for stability.",
    tint: C.blue,
    tintSoft: C.blueSoft,
  },
  {
    icon: TrendingUp,
    title: "Competitor-aware",
    body: "A daily headless-browser scrape of four Saudi rivals sets the market band, with hot routes refreshed every six hours.",
    tint: C.amber,
    tintSoft: C.amberSoft,
  },
  {
    icon: ShieldCheck,
    title: "Profit-first guardrails",
    body: "Never below cost plus 15%, never above 10% over the market median. When the two conflict, profit wins.",
    tint: C.emerald,
    tintSoft: C.emeraldSoft,
  },
  {
    icon: MessageSquare,
    title: "Booking assistant",
    body: "A guided eleven-step flow books a car end to end and holds the vehicle transactionally for fifteen minutes.",
    tint: C.blue,
    tintSoft: C.blueSoft,
  },
  {
    icon: RefreshCw,
    title: "Hot-reloadable models",
    body: "A new model version is picked up from the registry within a minute and swapped in without a redeploy or a restart.",
    tint: C.emerald,
    tintSoft: C.emeraldSoft,
  },
];

/* --- Signature element: the price waterfall -------------------------------
   Real arithmetic, matching the engine's documented pipeline.
   TODO: base_daily_rate, cost_per_day and market_median are illustrative —
   swap for figures from a live instance before publishing.
   ------------------------------------------------------------------------- */
const BASE_RATE = 240; // SAR/day, Toyota Camry class
const COST_PER_DAY = 150; // SAR/day
const MARKET_MEDIAN = 210; // SAR/day, median of four scraped competitors

const DURATIONS = [
  { key: "D1", label: "1 day", discount: 1.0 },
  { key: "D3", label: "3 days", discount: 0.95 },
  { key: "D7", label: "7 days", discount: 0.9 },
  { key: "M1", label: "30 days", discount: 0.85 },
];

const LOCATIONS = [
  { key: "city", label: "City branch", premium: 1.0 },
  { key: "airport", label: "Airport", premium: 1.1 },
];

function computePrice(duration, location) {
  const rule = BASE_RATE * duration.discount * location.premium;
  // Illustrative ML baseline: the trained model isn't bundled in the repo, so a
  // deployment without one falls back to a formula. See the limitations note.
  const ml = BASE_RATE * (0.93 + (location.premium - 1) * 0.6);
  const blended = 0.6 * rule + 0.4 * ml;
  const floor = Math.max(COST_PER_DAY * 1.15, MARKET_MEDIAN * 0.7);
  const ceiling = MARKET_MEDIAN * 1.1;
  const clamped = Math.min(Math.max(blended, floor), ceiling);
  const snapped = Math.round(clamped / 5) * 5;
  const final = Math.min(Math.max(snapped, floor), ceiling);
  return { rule, ml, blended, floor, ceiling, clamped, final };
}

const sar = (n) => `SAR ${n.toFixed(0)}`;

/* --- Content: engineering decisions -------------------------------------- */
const DECISIONS = [
  {
    tag: "Market reference",
    title: "The median, not the average.",
    body: "Competitor scrapes are noisy — one mispriced luxury listing drags an average hard, and pricing would chase it. The engine takes the median of the four providers precisely because it resists outliers, and pairs it with a hard cost floor. Together that means a single bad scrape can neither push a price below cost nor make the fleet follow a junk rate off a cliff.",
    file: "PRICING_SYSTEM_README.md · Phase 7",
  },
  {
    tag: "Conversation design",
    title: "The chatbot is a state machine, not an agent.",
    body: "Booking runs through eleven explicit states with forward-only transitions; intent is matched by keyword with no model involved. The LLM is called for exactly one job — mapping 'I want something small' to a real category — with temperature 0.1, a 16-token output cap, and a reply that is re-validated against the allowed list in code. It cannot inject text into the flow, so the prompt-injection surface is close to nothing.",
    file: "chatbot/orchestrator.py:527",
  },
  {
    tag: "Consistency, and its cost",
    title: "The chatbot calls the same endpoint the website does.",
    body: "Rather than reimplement pricing for chat, the assistant makes an HTTP call to the app's own /pricing/unified-price — so the two channels cannot drift apart, ever. The honest trade-off is that this is a localhost round-trip: an extra serialisation hop and a second FastAPI request per quote, which is the top latency bottleneck in the system. The right fix is calling the pricing function in-process while keeping it the single source of truth.",
    file: "chatbot/orchestrator.py:719",
  },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  { group: "Backend", items: ["Python 3.11", "FastAPI 0.110", "Pydantic 2.6", "Uvicorn", "APScheduler", "slowapi"] },
  {
    group: "ML",
    // TODO: confirm the SARIMA library and order (statsmodels SARIMAX(p,d,q)(P,D,Q,s)?)
    items: ["ONNX Runtime 1.25", "scikit-learn GradientBoosting", "SARIMA demand forecasting", "LightGBM 4.3", "skl2onnx"],
  },
  { group: "Data", items: ["Firebase Firestore", "Firebase Auth", "Firebase Storage (model registry)"] },
  { group: "Signals", items: ["Playwright + BeautifulSoup", "Open-Meteo", "9 cities", "4 competitors"] },
  { group: "Frontend", items: ["React 18", "Vite 5", "TypeScript 5", "TanStack Query 5", "Tailwind 3"] },
  { group: "Infra", items: ["Docker", "nginx + supervisor", "AWS App Runner", "ECR", "Secrets Manager"] },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "36", label: "REST endpoints" },
  { value: "10", label: "features per price" },
  { value: "11", label: "chatbot states" },
  { value: "4", label: "competitors scraped daily" },
  { value: "9", label: "cities with weather coverage" },
  { value: "60/40", label: "rules to model blend" },
];

/* --- Screenshot slot ----------------------------------------------------- */
function Shot({ src, w, h, alt, caption }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure>
      <div
        className="overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-xl"
        style={{ borderColor: C.border, backgroundColor: C.card }}
      >
        {failed ? (
          <div
            className="flex flex-col items-center justify-center gap-2 px-6 text-center"
            style={{ aspectRatio: `${w} / ${h}`, backgroundColor: C.cardHi, color: C.faint }}
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
            style={{ aspectRatio: `${w} / ${h}`, objectFit: "cover", backgroundColor: C.cardHi }}
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

export default function PricingEngineLanding() {
  const [durationKey, setDurationKey] = useState("D3");
  const [locationKey, setLocationKey] = useState("airport");

  const duration = DURATIONS.find((d) => d.key === durationKey) || DURATIONS[0];
  const location = LOCATIONS.find((l) => l.key === locationKey) || LOCATIONS[0];
  const p = computePrice(duration, location);
  const clampedByCeiling = p.blended > p.ceiling;
  const clampedByFloor = p.blended < p.floor;

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: C.canvas, color: C.text }}>
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.border, backgroundColor: "rgba(13,14,17,0.88)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="rounded-lg focus:outline-none focus-visible:ring-2" style={{ outlineColor: C.blue }}>
            <Logo />
          </a>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#how"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 sm:inline-block"
              style={{ color: C.muted }}
            >
              How it works
            </a>
            <a
              href="#engineering"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 sm:inline-block"
              style={{ color: C.muted }}
            >
              Engineering
            </a>
            {/* TODO: repository URL */}
            <a
              href="https://github.com/zssain/Dynamic-Pricing-Engine" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: C.blue }}
            >
              <Github size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Source</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ==================================================================
          1 — HERO
          ================================================================== */}
      <section id="top">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Eyebrow>Car rental · Saudi Arabia</Eyebrow>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              One price engine.
              <br />
              Website, chatbot, API.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: C.muted }}>
              A pricing service that blends a machine-learning baseline with
              business rules, clamps the result between a cost floor and the
              scraped market band, and serves the identical number to every
              channel — with the full breakdown logged for retraining.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="https://github.com/zssain/Dynamic-Pricing-Engine" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: C.blue, outlineColor: C.blue }}
              >
                <Github size={16} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: C.border, color: C.text, outlineColor: C.blue }}
              >
                Read the architecture
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-6 text-xs" style={{ color: C.faint }}>
              FastAPI · Firestore · ONNX Runtime · Playwright · AWS App Runner
            </p>
          </Reveal>

          {/* --- Signals feeding one quote --- */}
          <Reveal delay={140} className="lg:col-span-6">
            <div className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.card }}>
              <p className="text-sm font-semibold" style={{ color: C.muted }}>
                Ten signals per quote
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { icon: CloudSun, label: "Weather", note: "Open-Meteo, live", tint: C.amber, soft: C.amberSoft },
                  { icon: TrendingUp, label: "Competitors", note: "4 providers, daily", tint: C.emerald, soft: C.emeraldSoft },
                  { icon: Gauge, label: "Utilisation", note: "fleet, per branch", tint: C.blue, soft: C.blueSoft },
                  { icon: LineChart, label: "Demand index", note: "SARIMA seasonal forecast", tint: C.blue, soft: C.blueSoft },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.label}
                      className="rounded-xl border p-4 transition-colors duration-200"
                      style={{ borderColor: C.border, backgroundColor: C.cardHi }}
                    >
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: s.soft, color: s.tint }}
                      >
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <p className="mt-3 text-sm font-semibold">{s.label}</p>
                      <p className="mt-0.5 text-xs" style={{ color: C.faint }}>
                        {s.note}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.faint }}>
                <ScrollText size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                Season, weekend flags, duration bucket, city, vehicle class and
                base rate make up the rest. Every quote's inputs and outputs are
                written to an audit collection.
              </p>
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
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Static rates leave money on the table — and channels disagree.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                Rental pricing is usually set by hand and updated rarely, so
                rates drift out of line with demand and the market. Worse, the
                website, the call centre and the chatbot often quote different
                numbers for the same car on the same dates, which is the kind of
                thing customers screenshot.
              </p>
              <p style={{ color: C.text }}>
                This computes one price from live signals — weather, season,
                fleet utilisation, demand and scraped competitor rates — and
                serves it from a single endpoint to every channel. Guardrails
                keep it above cost and inside the market band, and every decision
                is logged with its full breakdown.
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
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Six things the engine guarantees.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal as="li" key={f.title} delay={i * 80}>
                  <div
                    className="h-full rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ borderColor: C.border, backgroundColor: C.cardHi }}
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: f.tintSoft, color: f.tint }}
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
          Waterfall, engineering decisions, stack.
          ================================================================== */}
      <section id="engineering">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>Under the hood</Eyebrow>
            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              How a number gets built, and what stops it going wrong.
            </h2>
          </Reveal>

          {/* --- SIGNATURE: the price waterfall --- */}
          <Reveal delay={100}>
            <div className="mt-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h3 className="text-xl font-bold">Build a quote</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>
                  A mid-size sedan in Riyadh. Change the duration and the pickup
                  point and watch the number move through each stage of the
                  pipeline.
                </p>

                <fieldset className="mt-6">
                  <legend className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.faint }}>
                    Duration
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DURATIONS.map((d) => {
                      const active = d.key === durationKey;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setDurationKey(d.key)}
                          aria-pressed={active}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: active ? C.blue : C.border,
                            backgroundColor: active ? C.blueSoft : C.card,
                            color: active ? C.text : C.muted,
                            outlineColor: C.blue,
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-6">
                  <legend className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.faint }}>
                    Pickup
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {LOCATIONS.map((l) => {
                      const active = l.key === locationKey;
                      return (
                        <button
                          key={l.key}
                          type="button"
                          onClick={() => setLocationKey(l.key)}
                          aria-pressed={active}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: active ? C.blue : C.border,
                            backgroundColor: active ? C.blueSoft : C.card,
                            color: active ? C.text : C.muted,
                            outlineColor: C.blue,
                          }}
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <p className="mt-6 text-xs leading-relaxed" style={{ color: C.faint }}>
                  {/* TODO: replace with figures from a live instance */}
                  Base {sar(BASE_RATE)}/day · cost {sar(COST_PER_DAY)}/day ·
                  market median {sar(MARKET_MEDIAN)}/day. Illustrative inputs;
                  the arithmetic is the engine's.
                </p>
              </div>

              {/* --- The waterfall itself --- */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.card }}>
                  <ol className="space-y-3" aria-live="polite">
                    {[
                      {
                        label: "ML baseline",
                        // TODO: confirm whether the SARIMA forecast is one of the 10 features
                        // or a separate signal applied alongside them.
                        note: "ONNX gradient-boosting over 10 features, incl. a SARIMA demand forecast",
                        value: p.ml,
                        tint: C.blue,
                      },
                      {
                        label: "Rule price",
                        note: `base × ${duration.discount} duration${
                          location.premium > 1 ? " × 1.10 airport premium" : ""
                        }`,
                        value: p.rule,
                        tint: C.amber,
                      },
                      {
                        label: "Blend · 60% rules / 40% model",
                        note: "rules weighted higher for stability",
                        value: p.blended,
                        tint: C.text,
                      },
                    ].map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                        style={{ borderColor: C.border, backgroundColor: C.cardHi }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: row.tint }}>
                            {row.label}
                          </p>
                          <p className="mt-0.5 truncate text-xs" style={{ color: C.faint }}>
                            {row.note}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-sm tabular-nums" style={{ color: C.text }}>
                          {sar(row.value)}
                        </span>
                      </li>
                    ))}

                    {/* Guardrail band */}
                    <li
                      className="rounded-xl border px-4 py-3"
                      style={{
                        borderColor: clampedByFloor || clampedByCeiling ? C.emerald : C.border,
                        backgroundColor: clampedByFloor || clampedByCeiling ? C.emeraldSoft : C.cardHi,
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold" style={{ color: C.emerald }}>
                          Guardrails
                        </p>
                        <span className="font-mono text-xs tabular-nums" style={{ color: C.muted }}>
                          {sar(p.floor)} — {sar(p.ceiling)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: C.faint }}>
                        Floor is the higher of cost + 15% and 70% of the market
                        median; ceiling is 110% of it.
                        {clampedByCeiling && " Blended price exceeded the ceiling and was pulled down."}
                        {clampedByFloor && " Blended price fell under the floor and was lifted."}
                        {!clampedByCeiling && !clampedByFloor && " Blended price sat inside the band untouched."}
                      </p>
                    </li>
                  </ol>

                  {/* Final */}
                  <div
                    className="mt-4 flex items-end justify-between rounded-xl px-5 py-4"
                    style={{ backgroundColor: C.blueSoft }}
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>
                        Quoted rate
                      </p>
                      <p className="mt-1 text-xs" style={{ color: C.faint }}>
                        Snapped to a 5-SAR step inside the band
                      </p>
                    </div>
                    <p className="text-3xl font-extrabold tabular-nums tracking-tight">
                      {sar(p.final)}
                      <span className="ml-1 text-sm font-semibold" style={{ color: C.muted }}>
                        /day
                      </span>
                    </p>
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
                    className="h-full rounded-2xl border p-6"
                    style={{ borderColor: C.border, backgroundColor: C.card }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: C.blue }}>
                      {d.tag}
                    </p>
                    <h4 className="mt-3 text-base font-bold leading-snug">{d.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>
                      {d.body}
                    </p>
                    <p
                      className="mt-5 inline-flex items-center gap-2 rounded-md px-2.5 py-1 font-mono text-[11px]"
                      style={{ backgroundColor: C.cardHi, color: C.faint }}
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
            <div className="mt-16 border-t pt-10" style={{ borderColor: C.border }}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.blue }}>
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
                          className="rounded-md border px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-white/5"
                          style={{ borderColor: C.border, color: C.muted }}
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
                Honest limitations: no trained model file ships with the repo, so
                a fresh deployment uses the fallback formula until training runs.
                There are no published accuracy or latency benchmarks, and it
                runs as a single-worker container — real scale needs a shared
                cache and a shared rate limiter.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          5 — SCREENSHOT SHOWCASE
          Dashboard capture is 3024 × 1964. Remaining slots are TODO.
          Drop files into /screenshots and keep the filenames below.
          ================================================================== */}
      <section className="border-y" style={{ borderColor: C.border, backgroundColor: C.card }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>The product</Eyebrow>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Same engine behind every screen.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {[
              {
                src: "/screenshots/pricing-dashboard.png",
                w: 3024,
                h: 1964,
                wide: true,
                alt: "The customer dashboard showing total bookings, loyalty points, amount saved through dynamic pricing and AI bookings, with quick actions below.",
                caption:
                  "Customer dashboard. Saved amount is computed against the undiscounted rate, and AI bookings track how many reservations came through the assistant rather than the site.",
              },
              {
                // TODO: capture the fleet browse / vehicle detail page with a live quote
                src: "/screenshots/pricing-fleet.png",
                w: 3024,
                h: 1964,
                alt: "TODO: the fleet browser showing vehicles with their dynamically priced daily rates.",
                caption:
                  "Fleet. Every card's rate comes from the same unified endpoint, with the market-comparison line and the applied discounts shown alongside.",
              },
              {
                // TODO: capture the chatbot mid-booking
                src: "/screenshots/pricing-chatbot.png",
                w: 3024,
                h: 1964,
                alt: "TODO: the booking assistant partway through the eleven-step flow.",
                caption:
                  "Booking assistant. Eleven forward-only states, a quote locked for fifteen minutes, and a Firestore transaction that verifies availability before it writes.",
              },
              {
                // TODO: capture the admin / pricing decisions view
                src: "/screenshots/pricing-admin.png",
                w: 3024,
                h: 1964,
                alt: "TODO: the admin view showing logged pricing decisions and competitor scrape status.",
                caption:
                  "Pricing audit. Each decision stores its inputs, features, market stats and model version — the training set for the next model.",
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
      <footer style={{ backgroundColor: C.canvas }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  The interesting part is the guardrails.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: C.muted }}>
                  A model that proposes, rules that temper it, and bounds that
                  make it impossible to price below cost or chase a bad scrape —
                  plus a chatbot deliberately built as a state machine. It's all
                  in the repository.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="https://github.com/zssain/Dynamic-Pricing-Engine" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: C.blue, outlineColor: C.blue }}
                >
                  <Github size={16} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: C.border, color: C.text, outlineColor: C.blue }}
                >
                  Get in touch
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <div
            className="mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: C.border }}
          >
            <Logo />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: C.muted }}>
              <span>Built by Zuhair Hussain</span>
              <a
                href="https://www.linkedin.com/in/zuhairhussain28/"
                target="_blank"
                rel="noreferrer"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.blue }}
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.blue }}
              >
                mohammedzuhairhussain28@gmail.com
              </a>
              {/* TODO: README says "Proprietary — Hanco-AI". Confirm what to show publicly. */}
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
