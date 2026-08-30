"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  LineChart,
  Waves,
  Activity,
  Brain,
  Sigma,
  FlaskConical,
  Repeat,
  BookOpen,
  Terminal,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";

/* ============================================================================
   TIME-SERIES FORECASTING OF STOCK PRICES — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout; inline styles carry the palette, which is
   matplotlib's tab10 — one colour per model, so the page accents double as the
   chart legend.
   Motion: CSS transitions + IntersectionObserver (no framer-motion dependency).
   ========================================================================== */

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  field: "#EDEFF1", // matplotlib figure background
  plot: "#FFFFFF", // plot area / cards
  grid: "#DCE0E4", // gridlines and hairlines
  ink: "#15181C",
  muted: "#5B636C",
  faint: "#878E96",
  series: "#2B3138", // the historical price line
  // tab10, in the order the models run
  arima: "#1F77B4",
  garch: "#FF7F0E",
  prophet: "#2CA02C",
  knn: "#D62728",
  lstm: "#9467BD",
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

/** Returns [ref, inView] — fires once. */
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return [ref, inView, reduced];
}

/** Scroll-triggered fade + slide-up. `delay` staggers grid children. */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, inView, reduced] = useInView();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(18px)",
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
    <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em]" style={{ color: C.muted }}>
      {children}
    </p>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className="inline-flex items-end gap-[3px]">
        {[C.arima, C.garch, C.prophet, C.knn, C.lstm].map((c, i) => (
          <span
            key={c}
            className="block w-[3px] rounded-sm"
            style={{ height: [9, 15, 11, 18, 13][i], backgroundColor: c }}
          />
        ))}
      </span>
      <span className="font-mono text-sm tracking-tight" style={{ color: C.ink }}>
        forecast-sp500
      </span>
    </span>
  );
}

/* --- Signature element: the divergence chart -----------------------------
   Historical shape is a compressed monthly view of ^GSPC, 2015-01 to 2020-06.
   The five forecast paths illustrate how the methods diverge. They are NOT
   recorded output — the repo prints metrics at runtime but saves none.
   TODO: replace with the real 30-day forecast values once you record a run.
   ------------------------------------------------------------------------- */
const HISTORY = [
  2050, 2100, 2080, 1920, 2040, 2060, 2100, 2180, 2240, 2360, 2420, 2470, 2580,
  2680, 2820, 2600, 2700, 2780, 2900, 2910, 2750, 2650, 2500, 2790, 2840, 2900,
  2940, 3000, 2980, 3050, 3120, 3230, 3300, 3380, 2950, 2450, 2550, 2790, 2930,
  3040, 3120,
];

const MODELS = [
  {
    key: "arima",
    name: "ARIMA(5,1,2)",
    color: C.arima,
    icon: Sigma,
    lib: "statsmodels",
    note: "Order carried over from the original auto.arima run; residuals checked with Ljung-Box.",
    path: [3130, 3140, 3148, 3155, 3160, 3165, 3168, 3170],
  },
  {
    key: "garch",
    name: "GARCH(1,1)",
    color: C.garch,
    icon: Waves,
    lib: "arch",
    note: "AR(3) mean over percentage returns; models volatility clustering rather than level.",
    path: [3115, 3108, 3100, 3095, 3090, 3086, 3083, 3080],
  },
  {
    key: "prophet",
    name: "Prophet",
    color: C.prophet,
    icon: Activity,
    lib: "prophet",
    note: "Default seasonality, additive trend with changepoints — the most confident extrapolator here.",
    path: [3150, 3175, 3200, 3215, 3240, 3255, 3275, 3290],
  },
  {
    key: "knn",
    name: "KNN (k=50)",
    color: C.knn,
    icon: Repeat,
    lib: "scikit-learn",
    note: "30-day lag windows as feature vectors; recursive forecasts pull toward the neighbourhood mean.",
    path: [3100, 3080, 3060, 3050, 3040, 3035, 3030, 3028],
  },
  {
    key: "lstm",
    name: "LSTM(6)",
    color: C.lstm,
    icon: Brain,
    lib: "TensorFlow / Keras",
    note: "Box-Cox and standardised, sequence length 11, trained 100 epochs, then inverse-transformed.",
    path: [3135, 3150, 3162, 3172, 3180, 3186, 3190, 3193],
  },
];

const Y_MIN = 1850;
const Y_MAX = 3450;
const VB_W = 760;
const VB_H = 320;
const PAD = { l: 46, r: 12, t: 14, b: 26 };

function DivergenceChart({ visible }) {
  const [ref, inView, reduced] = useInView();

  const total = HISTORY.length + 8; // history + 8 forecast points
  const x = (i) => PAD.l + (i / (total - 1)) * (VB_W - PAD.l - PAD.r);
  const y = (v) =>
    PAD.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (VB_H - PAD.t - PAD.b);

  const histPath = HISTORY.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const lastIdx = HISTORY.length - 1;
  const lastVal = HISTORY[lastIdx];

  const gridValues = [2000, 2400, 2800, 3200];

  return (
    <div ref={ref}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="block w-full"
        role="img"
        aria-label="Historical S&P 500 closing prices with five overlaid 30-day forecasts that diverge from one another."
      >
        {/* gridlines + y labels */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={VB_W - PAD.r}
              y1={y(v)}
              y2={y(v)}
              stroke={C.grid}
              strokeWidth="1"
            />
            <text
              x={PAD.l - 8}
              y={y(v) + 3.5}
              textAnchor="end"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              fill={C.faint}
            >
              {v}
            </text>
          </g>
        ))}

        {/* forecast boundary */}
        <line
          x1={x(lastIdx)}
          x2={x(lastIdx)}
          y1={PAD.t}
          y2={VB_H - PAD.b}
          stroke={C.faint}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={x(lastIdx) + 5}
          y={PAD.t + 10}
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          fill={C.faint}
        >
          forecast →
        </text>

        {/* history */}
        <path d={histPath} fill="none" stroke={C.series} strokeWidth="1.6" />

        {/* five forecasts */}
        {MODELS.map((m) => {
          const pts = [lastVal, ...m.path];
          const d = pts
            .map((v, i) => `${i === 0 ? "M" : "L"}${x(lastIdx + i)},${y(v)}`)
            .join(" ");
          const on = visible[m.key];
          return (
            <path
              key={m.key}
              d={d}
              fill="none"
              stroke={m.color}
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{
                opacity: on ? (inView ? 1 : 0) : 0,
                strokeDasharray: 260,
                strokeDashoffset: reduced ? 0 : inView ? 0 : 260,
                transition: reduced
                  ? "opacity 150ms linear"
                  : "stroke-dashoffset 900ms cubic-bezier(.22,.61,.36,1), opacity 250ms linear",
              }}
            />
          );
        })}

        {/* x labels */}
        <text x={PAD.l} y={VB_H - 8} fontSize="9" fontFamily="ui-monospace, monospace" fill={C.faint}>
          2015-01
        </text>
        <text
          x={VB_W - PAD.r}
          y={VB_H - 8}
          textAnchor="end"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          fill={C.faint}
        >
          2020-06 + 30d
        </text>
      </svg>
    </div>
  );
}

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: LineChart,
    title: "Five models, one series",
    body: "ARIMA, GARCH, Prophet, KNN and an LSTM all fit the identical S&P 500 closing prices and forecast the same horizon.",
  },
  {
    icon: Activity,
    title: "Technical indicators first",
    body: "Bollinger Bands and MACD are computed and plotted before any model runs, so the series is looked at before it is fitted.",
  },
  {
    icon: FlaskConical,
    title: "Stationarity diagnostics",
    body: "An Augmented Dickey-Fuller test with ACF and PACF plots, which is where the ARIMA order came from in the first place.",
  },
  {
    icon: Waves,
    title: "Volatility modelling",
    body: "A GARCH(1,1) on percentage returns captures the clustering that a mean-only model cannot see.",
  },
  {
    icon: Repeat,
    title: "Rolling-origin validation",
    body: "The KNN model is scored with a five-fold TimeSeriesSplit, so no future window ever leaks into a past fit.",
  },
  {
    icon: Terminal,
    title: "No keys, no config",
    body: "Data comes straight from Yahoo Finance through yfinance. Clone it, install the requirements, run one file.",
  },
];

/* --- Content: engineering decisions -------------------------------------- */
const DECISIONS = [
  {
    tag: "Model substitution",
    title: "The 'NNETAR' model is an LSTM, and the code says so.",
    body: "The original R study used nnetar — a feed-forward NNAR(11,6) averaging twenty networks. The Python port keeps the same 11-input, 6-node shape but swaps in a single recurrent network, because a modern equivalent was the point of the port. The function is still named run_nnetar_model and labelled NNETAR-like, which is a naming compromise worth knowing about: the write-up describes the R architecture, the code runs the LSTM.",
    file: "Scripts/nnetar_model.py:20-46",
  },
  {
    tag: "Forecast construction",
    title: "Recursive multi-step, with the error cost accepted.",
    body: "Both KNN and the LSTM forecast one step, append the prediction to the input window, and feed it back — thirty times. That compounds error across the horizon, and it shows: the KNN path decays toward its neighbourhood mean while Prophet extrapolates its trend confidently. Direct multi-step forecasting would avoid the feedback, but recursive keeps every model on the same one-step-ahead footing, which is what makes the comparison fair.",
    file: "Scripts/knn_model.py:37-40",
  },
  {
    tag: "Preprocessing",
    title: "Box-Cox before the network, inverted after.",
    body: "The LSTM path applies a Box-Cox transform to stabilise variance and a StandardScaler on top, then inverts both after prediction so the output is back in index points. It is worth naming the constraint this carries: Box-Cox requires strictly positive input, which is safe for an index level but would fail immediately on returns — so this preprocessing choice quietly fixes what the model can be pointed at.",
    file: "Scripts/nnetar_model.py:26-31, 58-59",
  },
];

/* --- Content: README-vs-code findings ------------------------------------
   The repo's README documents the earlier R implementation. Where the two
   disagree, the code is authoritative.
   ------------------------------------------------------------------------- */
const DIVERGENCES = [
  { area: "Language", readme: "R — getSymbols, auto.arima, rugarch", code: "Python — Scripts/*.py" },
  { area: "ARIMA", readme: "auto.arima with Box-Cox λ = −0.718", code: "hardcoded ARIMA(5,1,2), no Box-Cox" },
  { area: "Neural net", readme: "feed-forward NNAR(11,6), 20-network ensemble", code: "single LSTM(6), sequence length 11" },
  { area: "GARCH mean", readme: "ARMA(3,2) via ugarchspec", code: "AR(3) — the MA terms are dropped" },
  { area: "Evaluation", readme: "70/30 train-test split on ARIMA", code: "fits the full series; only KNN does CV" },
  { area: "Reported metrics", readme: "RMSE figures from the R run", code: "computed at runtime, never saved" },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  { group: "Language", items: ["Python 3", "single batch entrypoint"] },
  { group: "Statistics", items: ["statsmodels (ARIMA, ADF, ACF/PACF)", "arch (GARCH)", "scipy (Box-Cox)"] },
  { group: "Learning", items: ["scikit-learn (KNN, TimeSeriesSplit)", "TensorFlow / Keras (LSTM)", "prophet"] },
  { group: "Data", items: ["yfinance", "pandas", "numpy", "mplfinance"] },
  { group: "Output", items: ["matplotlib"] },
  { group: "Infra", items: ["none — local CLI"] },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "5", label: "forecasting models" },
  { value: "30", label: "day forecast horizon" },
  { value: "~5.4", label: "years of daily data" },
  { value: "341", label: "lines of Python" },
  { value: "7", label: "source files" },
  { value: "0", label: "servers, endpoints, tables" },
];

/* --- Plot slot ------------------------------------------------------------
   The repo ships 17 plots + 10 equation images, but they are from the original
   R run. TODO: capture fresh output from the Python code before publishing.
   ------------------------------------------------------------------------- */
function Plot({ src, w, h, alt, caption }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure>
      <div className="overflow-hidden rounded border" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
        {failed ? (
          <div
            className="flex flex-col items-center justify-center gap-2 px-6 text-center"
            style={{ aspectRatio: `${w} / ${h}`, backgroundColor: C.plot, color: C.faint }}
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
            style={{ aspectRatio: `${w} / ${h}`, objectFit: "contain", backgroundColor: C.plot }}
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

export default function ForecastingLanding() {
  const [visible, setVisible] = useState({
    arima: true,
    garch: true,
    prophet: true,
    knn: true,
    lstm: true,
  });
  const toggle = (k) => setVisible((v) => ({ ...v, [k]: !v[k] }));

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: C.field, color: C.ink }}>
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.grid, backgroundColor: "rgba(237,239,241,0.92)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="rounded focus:outline-none focus-visible:ring-2" style={{ outlineColor: C.arima }}>
            <Logo />
          </a>
          <nav className="flex items-center gap-3">
            <a
              href="#models"
              className="hidden font-mono text-xs transition-colors sm:inline-block"
              style={{ color: C.muted }}
            >
              models
            </a>
            <a
              href="#engineering"
              className="hidden font-mono text-xs transition-colors sm:inline-block"
              style={{ color: C.muted }}
            >
              engineering
            </a>
            {/* TODO: repository URL */}
            <a
              href="https://github.com/zssain/Time-Series-Forecasting-of-Stock-Prices" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded border bg-white px-3 py-2 font-mono text-xs transition-colors hover:bg-slate-50"
              style={{ borderColor: C.grid, color: C.ink }}
            >
              <Github size={14} aria-hidden="true" />
              <span className="hidden sm:inline">source</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ==================================================================
          1 — HERO
          ================================================================== */}
      <section id="top">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <Reveal>
            <Eyebrow>Comparative time-series study</Eyebrow>
            <h1 className="max-w-3xl font-mono text-3xl leading-[1.2] tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Five forecasting models, one S&amp;P 500.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: C.muted }}>
              A Python study that fits ARIMA, GARCH, Prophet, a k-nearest-neighbours
              regressor and an LSTM to the same index, then plots every 30-day
              forecast on the same axes — because the interesting result is how
              differently they behave, not which one wins.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="https://github.com/zssain/Time-Series-Forecasting-of-Stock-Prices" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded px-6 py-3 font-mono text-sm text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: C.ink, outlineColor: C.arima }}
              >
                <Github size={15} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 rounded border bg-white px-6 py-3 font-mono text-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: C.grid, color: C.ink, outlineColor: C.arima }}
              >
                Read the method
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          {/* --- SIGNATURE: the divergence chart --- */}
          <Reveal delay={120}>
            <figure className="mt-12 rounded border p-4 sm:p-6" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
              <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-sm">^GSPC close · 2015-01-01 → 2020-06-04 · 30-day horizon</span>
                <span className="font-mono text-xs" style={{ color: C.faint }}>
                  toggle a model to isolate it
                </span>
              </figcaption>

              <DivergenceChart visible={visible} />

              {/* legend / toggles */}
              <ul className="mt-4 flex flex-wrap gap-2">
                {MODELS.map((m) => {
                  const on = visible[m.key];
                  return (
                    <li key={m.key}>
                      <button
                        type="button"
                        onClick={() => toggle(m.key)}
                        aria-pressed={on}
                        className="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs transition-colors duration-200 focus:outline-none focus-visible:ring-2"
                        style={{
                          borderColor: on ? m.color : C.grid,
                          color: on ? C.ink : C.faint,
                          backgroundColor: C.plot,
                          outlineColor: m.color,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block h-0.5 w-4"
                          style={{ backgroundColor: on ? m.color : C.grid }}
                        />
                        {m.name}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 text-xs leading-relaxed" style={{ color: C.faint }}>
                {/* TODO: replace the forecast paths with values from a recorded run */}
                Illustrative shapes showing how the methods diverge. The code
                prints RMSE, MAE and MAPE at runtime but saves nothing, so no
                recorded output exists in the repository yet.
              </p>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          Verified numbers strip
          ================================================================== */}
      <section className="border-y" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {NUMBERS.map((n, i) => (
              <Reveal as="li" key={n.label} delay={i * 60}>
                <p className="font-mono text-3xl tracking-tight">{n.value}</p>
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
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>The problem</Eyebrow>
            <h2 className="font-mono text-2xl leading-tight tracking-tight sm:text-3xl">
              No single model is obviously right for a financial series.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                Price series are noisy, non-stationary and volatility-clustered.
                Choosing a forecasting method usually means reading five papers
                before you have plotted a single line, and each paper evaluates
                on its own data with its own metric.
              </p>
              <p style={{ color: C.ink }}>
                This puts five classical and modern approaches on one series, one
                horizon and one set of axes. Run it and you can see immediately
                that Prophet extrapolates its trend confidently, the recursive
                KNN decays toward its neighbourhood mean, and GARCH barely moves
                the level at all — which is the honest answer to "which model
                should I use".
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          3 — FEATURE GRID
          ================================================================== */}
      <section id="models" className="border-y" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <Eyebrow>What it does</Eyebrow>
            <h2 className="max-w-2xl font-mono text-2xl leading-tight tracking-tight sm:text-3xl">
              Diagnostics before models, and the same treatment for each.
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-px border sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: C.grid, backgroundColor: C.grid }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal as="li" key={f.title} delay={i * 80}>
                  <div className="h-full px-6 py-6 transition-colors duration-200 hover:bg-slate-50" style={{ backgroundColor: C.plot }}>
                    <Icon size={18} aria-hidden="true" style={{ color: C.muted }} />
                    <h3 className="mt-3 font-mono text-sm">{f.title}</h3>
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
          Model specs, engineering decisions, README-vs-code, stack.
          ================================================================== */}
      <section id="engineering">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <Eyebrow>Under the hood</Eyebrow>
            <h2 className="max-w-3xl font-mono text-2xl leading-tight tracking-tight sm:text-3xl">
              One entrypoint, six modules, no framework.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: C.muted }}>
              <code className="font-mono text-base">main.py</code> downloads the
              series once and fans out: the visualisation module charts
              indicators and tests stationarity, then five model modules each
              take the same prices and return an independent 30-day forecast.
              There is no server, database or queue. It runs top to bottom and
              exits, which is the point — swapping or adding a model is one file.
            </p>
          </Reveal>

          {/* --- Model specification table --- */}
          <Reveal delay={100}>
            <div className="mt-10 overflow-hidden rounded border" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
              <table className="w-full text-left">
                <caption className="sr-only">
                  The five models with their libraries and key parameters
                </caption>
                <thead>
                  <tr className="border-b" style={{ borderColor: C.grid }}>
                    <th scope="col" className="px-5 py-3 font-mono text-xs font-normal" style={{ color: C.faint }}>
                      model
                    </th>
                    <th scope="col" className="hidden px-5 py-3 font-mono text-xs font-normal sm:table-cell" style={{ color: C.faint }}>
                      library
                    </th>
                    <th scope="col" className="px-5 py-3 font-mono text-xs font-normal" style={{ color: C.faint }}>
                      specification
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <tr key={m.key} className="border-b last:border-0" style={{ borderColor: C.grid }}>
                        <th scope="row" className="px-5 py-4 align-top">
                          <span className="flex items-center gap-2.5 font-mono text-sm font-normal">
                            <Icon size={15} aria-hidden="true" style={{ color: m.color }} />
                            {m.name}
                          </span>
                        </th>
                        <td className="hidden px-5 py-4 align-top font-mono text-xs sm:table-cell" style={{ color: C.faint }}>
                          {m.lib}
                        </td>
                        <td className="px-5 py-4 align-top text-sm leading-relaxed" style={{ color: C.muted }}>
                          {m.note}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* --- Engineering decisions --- */}
          <div className="mt-14">
            <Reveal>
              <h3 className="font-mono text-xl tracking-tight">Three decisions worth defending</h3>
            </Reveal>
            <div className="mt-6 grid gap-px border lg:grid-cols-3" style={{ borderColor: C.grid, backgroundColor: C.grid }}>
              {DECISIONS.map((d, i) => (
                <Reveal key={d.title} delay={i * 110}>
                  <article className="h-full px-6 py-6" style={{ backgroundColor: C.plot }}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: C.faint }}>
                      {d.tag}
                    </p>
                    <h4 className="mt-3 font-mono text-sm leading-snug">{d.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>
                      {d.body}
                    </p>
                    <p
                      className="mt-5 inline-block rounded border px-2.5 py-1 font-mono text-[11px]"
                      style={{ borderColor: C.grid, color: C.faint }}
                    >
                      {d.file}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          {/* --- README vs code: the audit table --- */}
          <div className="mt-14">
            <Reveal>
              <div className="flex items-start gap-3">
                <BookOpen size={18} aria-hidden="true" className="mt-1 shrink-0" style={{ color: C.muted }} />
                <div>
                  <h3 className="font-mono text-xl tracking-tight">Where the README and the code disagree</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: C.muted }}>
                    The README documents the earlier R implementation; the code
                    is a later Python port. Rather than quietly leave the two out
                    of step, here is the diff. Where they disagree, the code is
                    authoritative.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-6 overflow-x-auto rounded border" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.grid }}>
                      <th scope="col" className="px-5 py-3 font-mono text-xs font-normal" style={{ color: C.faint }}>
                        area
                      </th>
                      <th scope="col" className="px-5 py-3 font-mono text-xs font-normal" style={{ color: C.faint }}>
                        README says (R)
                      </th>
                      <th scope="col" className="px-5 py-3 font-mono text-xs font-normal" style={{ color: C.knn }}>
                        code does (Python)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIVERGENCES.map((d) => (
                      <tr key={d.area} className="border-b last:border-0" style={{ borderColor: C.grid }}>
                        <th scope="row" className="px-5 py-3 font-mono text-xs font-normal align-top">
                          {d.area}
                        </th>
                        <td className="px-5 py-3 align-top text-sm" style={{ color: C.faint }}>
                          {d.readme}
                        </td>
                        <td className="px-5 py-3 align-top text-sm" style={{ color: C.ink }}>
                          {d.code}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>

          {/* --- Stack badges --- */}
          <Reveal delay={80}>
            <div className="mt-14 border-t pt-10" style={{ borderColor: C.grid }}>
              <h3 className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: C.faint }}>
                Stack
              </h3>
              <dl className="mt-6 space-y-4">
                {STACK.map((s) => (
                  <div key={s.group} className="sm:flex sm:gap-8">
                    <dt className="w-28 shrink-0 font-mono text-sm">{s.group}</dt>
                    <dd className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                      {s.items.map((item) => (
                        <span
                          key={item}
                          className="rounded border bg-white px-2.5 py-1 font-mono text-xs"
                          style={{ borderColor: C.grid, color: C.muted }}
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed" style={{ color: C.faint }}>
                <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                Honest limitations: dependencies are unpinned, there is no error
                handling, nothing is written to disk, and the thirty-step
                recursive forecasts compound error across the horizon. Treat the
                output as illustrative of model behaviour, not as production
                forecasts — and never as trading advice.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================
          5 — PLOT SHOWCASE
          The repo ships 17 plots, but they came from the original R run.
          TODO: capture fresh matplotlib output from the Python code.
          Slots assume 1200 × 800 — adjust to your saved figure size.
          ================================================================== */}
      <section className="border-y" style={{ borderColor: C.grid, backgroundColor: C.plot }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <Eyebrow>Output</Eyebrow>
            <h2 className="max-w-2xl font-mono text-2xl leading-tight tracking-tight sm:text-3xl">
              What comes out of one run.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {[
              {
                src: "/plots/bollinger.png",
                alt: "TODO: Bollinger Band chart of the S&P 500 close with a 20-day moving average and two standard deviation bands.",
                caption: "Bollinger Bands. A 20-day moving average with ±2σ envelopes, plotted before any model is fitted.",
              },
              {
                src: "/plots/acf-pacf.png",
                alt: "TODO: autocorrelation and partial autocorrelation plots used to select the ARIMA order.",
                caption: "ACF and PACF alongside the Augmented Dickey-Fuller statistic — where the (5,1,2) order originally came from.",
              },
              {
                src: "/plots/garch-volatility.png",
                alt: "TODO: conditional volatility plot from the fitted GARCH(1,1) model.",
                caption: "Conditional volatility from the GARCH(1,1) fit, showing the clustering a level-only model cannot represent.",
              },
              {
                src: "/plots/forecast-overlay.png",
                alt: "TODO: the five 30-day forecasts overlaid on the historical closing price series.",
                caption: "The comparison itself: five 30-day forecasts on one set of axes. This is the figure the whole study exists to produce.",
              },
            ].map((p, i) => (
              <Reveal key={p.src} delay={i * 90}>
                <Plot src={p.src} w={1200} h={800} alt={p.alt} caption={p.caption} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          6 — FOOTER CTA
          ================================================================== */}
      <footer style={{ backgroundColor: C.ink, color: "#F3F4F6" }}>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-16">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <h2 className="font-mono text-2xl leading-tight tracking-tight sm:text-3xl">
                  Clone it, run one file, watch them disagree.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: "#A8AEB6" }}>
                  Seven files, 341 lines, no API keys and nothing to configure.
                  The comparison harness is small enough to read in a sitting and
                  swap a sixth model into.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="https://github.com/zssain/Time-Series-Forecasting-of-Stock-Prices" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded bg-white px-6 py-3 font-mono text-sm transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ color: C.ink, outlineColor: "#FFFFFF" }}
                >
                  <Github size={15} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded border px-6 py-3 font-mono text-sm transition-colors duration-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: "#3A4048", color: "#F3F4F6", outlineColor: "#FFFFFF" }}
                >
                  Get in touch
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>

          <div
            className="mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "#2A3038" }}
          >
            <span className="font-mono text-sm">forecast-sp500</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs" style={{ color: "#A8AEB6" }}>
              <span>Built by Zuhair Hussain</span>
              <a
                href="https://www.linkedin.com/in/zuhairhussain28/"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="transition-colors hover:text-white"
              >
                mohammedzuhairhussain28@gmail.com
              </a>
              {/* TODO: no LICENSE file exists in the repo — set one or delete this line */}
              <span>Licence: TODO</span>
            </div>
          </div>

          <p className="mt-8 text-xs leading-relaxed" style={{ color: "#7C838C" }}>
            Educational comparison of forecasting methods on a single index. It
            saves no signals and makes no trade decisions. Nothing here is
            financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
