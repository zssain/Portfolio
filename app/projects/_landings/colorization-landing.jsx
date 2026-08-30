"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Code2 as Github,
  Palette,
  Layers,
  Wand2,
  Gauge,
  Cpu,
  FlaskConical,
  Droplet,
  Upload,
  Check,
  AlertTriangle,
  Terminal,
  Image as ImageIcon,
} from "lucide-react";

/* ============================================================================
   MULTI-MODEL IMAGE COLORIZATION — portfolio landing page
   Single file, default export, no required props.
   Tailwind core utilities for layout; inline styles carry the Gradio dark
   palette from the dashboard (field #0C0D10, block #1F2028, orange #F97316).
   Motion: CSS transitions + IntersectionObserver (no framer-motion dependency).

   HONESTY NOTE: two of the four methods are deliberately weak baselines (a
   false-colour OpenCV colormap and an untrained PyTorch CNN). The page says so
   rather than presenting four peers. All metric figures below are single-run
   values recorded in the notebook, not a controlled benchmark.
   ========================================================================== */

/* --- Design tokens (swap these to re-skin the page) ---------------------- */
const C = {
  field: "#0C0D10",
  block: "#1F2028",
  blockHi: "#282A33",
  rule: "#33353F",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  faint: "#6B7280",
  orange: "#F97316", // Gradio primary — selection and submit
  orangeSoft: "rgba(249,115,22,0.12)",
  teal: "#2DD4BF", // the strong result
  amber: "#FBBF24",
  red: "#F87171",
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
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.orange }}>
      {children}
    </p>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className="inline-flex items-center gap-[3px]">
        {["#6B7280", C.orange, C.teal].map((c) => (
          <span key={c} className="block h-4 w-[5px] rounded-sm" style={{ backgroundColor: c }} />
        ))}
      </span>
      <span className="text-base font-bold tracking-tight" style={{ color: C.text }}>
        Colorization Lab
      </span>
    </span>
  );
}

/* --- Content: the four methods (signature element) ------------------------
   PSNR / SSIM figures are single-run values printed in the notebook across the
   22-image set. They are NOT a controlled benchmark, and — importantly — the
   two evaluations were not run the same way. See the caveat in the panel.
   ------------------------------------------------------------------------- */
const METHODS = [
  {
    id: "opencv",
    name: "OpenCV colormap",
    sub: "JET false colour",
    status: "runs offline",
    statusTone: C.teal,
    role: "baseline",
    psnr: [7.0, 15.09],
    ssim: [0.317, 0.731],
    body:
      "Applies a JET colormap to the luminance channel. This is false colour, not colorization — it maps brightness to a rainbow rather than inferring what colour anything was. It exists to give the metrics a floor to stand against.",
    detail: "cv2.applyColorMap · no learning involved",
  },
  {
    id: "pytorch",
    name: "PyTorch CNN",
    sub: "untrained",
    status: "runs offline",
    statusTone: C.teal,
    role: "pipeline demo",
    psnr: null,
    ssim: null,
    body:
      "A convolutional network loaded with random weights. Its output is not meaningful colour and is not meant to be — it demonstrates that the serving path, preprocessing and metric plumbing all work end to end without a trained artifact.",
    detail: "loaded with strict=False · weights never trained",
  },
  {
    id: "deoldify",
    name: "DeOldify",
    sub: "pretrained artistic",
    status: "needs 243 MB weights + fastai",
    statusTone: C.amber,
    role: "strong result",
    psnr: [16.03, 30.02],
    ssim: [0.777, 0.972],
    body:
      "The pretrained artistic generator, used as-is at render factor 35. It is by a wide margin the best output here, and the only method that produces photorealistic colour. It is also the heaviest call — a ResNet34-backed U-Net that writes and re-reads a temporary JPEG per request.",
    detail: "ColorizeArtistic_gen · render_factor=35",
  },
  {
    id: "autoencoder",
    name: "LAB autoencoder",
    sub: "trained from scratch",
    status: "needs trained .h5",
    statusTone: C.amber,
    role: "from scratch",
    psnr: null,
    ssim: null,
    body:
      "A 1.33-million-parameter encoder–decoder trained on this project's own 22 image pairs for 100 epochs, predicting the two chrominance channels of LAB. A genuine from-scratch attempt, and genuinely limited by its dataset — outputs are noisy and clip during the conversion back to RGB.",
    detail: "final loss 0.0173 · val_loss 0.0285 · aggregate PSNR/SSIM never tabulated",
  },
];

const PSNR_MAX = 32;

/* --- Range bar chart ----------------------------------------------------- */
function MetricRange({ method, activeId, metric }) {
  const [ref, inView, reduced] = useInView();
  const range = metric === "psnr" ? method.psnr : method.ssim;
  const max = metric === "psnr" ? PSNR_MAX : 1;
  const isActive = method.id === activeId;

  if (!range) {
    return (
      <div ref={ref} className="flex items-center gap-4 py-2.5">
        <span className="w-32 shrink-0 text-xs sm:w-40 sm:text-sm" style={{ color: isActive ? C.text : C.muted }}>
          {method.name}
        </span>
        <span className="flex-1 text-xs" style={{ color: C.faint }}>
          not recorded
        </span>
      </div>
    );
  }

  const left = (range[0] / max) * 100;
  const width = ((range[1] - range[0]) / max) * 100;
  const tone = method.id === "deoldify" ? C.teal : C.red;

  return (
    <div ref={ref} className="flex items-center gap-4 py-2.5">
      <span className="w-32 shrink-0 text-xs sm:w-40 sm:text-sm" style={{ color: isActive ? C.text : C.muted }}>
        {method.name}
      </span>
      <span className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: C.blockHi }}>
        <span
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${left}%`,
            width: inView ? `${width}%` : 0,
            backgroundColor: tone,
            opacity: isActive ? 1 : 0.5,
            transition: reduced ? "none" : "width 800ms cubic-bezier(.22,.61,.36,1), opacity 200ms linear",
          }}
        />
      </span>
      <span className="w-24 shrink-0 text-right font-mono text-[11px] tabular-nums" style={{ color: C.muted }}>
        {metric === "psnr"
          ? `${range[0].toFixed(1)}–${range[1].toFixed(1)}`
          : `${range[0].toFixed(2)}–${range[1].toFixed(2)}`}
      </span>
    </div>
  );
}

/* --- Content: features --------------------------------------------------- */
const FEATURES = [
  {
    icon: Layers,
    title: "Model switcher",
    body: "Pick a colorizer from one radio group and run the same image through any of them without touching code.",
  },
  {
    icon: Wand2,
    title: "Pretrained DeOldify",
    body: "The artistic generator at render factor 35 — the method that actually produces photorealistic colour.",
  },
  {
    icon: Cpu,
    title: "Autoencoder built from scratch",
    body: "A 1.33M-parameter encoder–decoder trained in LAB space to predict the two colour channels from luminance.",
  },
  {
    icon: Gauge,
    title: "Metrics on every result",
    body: "PSNR, SSIM and MSE are computed and shown alongside the image, so quality is a number and not a vibe.",
  },
  {
    icon: Droplet,
    title: "LAB colour pipeline",
    body: "The network predicts AB only and recombines with the input's own luminance, rather than regressing all three RGB channels.",
  },
  {
    icon: Upload,
    title: "Drop an image, get a result",
    body: "A Gradio interface with an upload target, a model choice and a metrics readout. No install to try it.",
  },
];

/* --- Content: engineering decisions -------------------------------------- */
const DECISIONS = [
  {
    tag: "Problem framing",
    title: "Predict the colour channels, not the whole image.",
    body: "The obvious approach is to regress RGB from grayscale. This does something better posed: convert to LAB, feed the network the L channel, and have it predict only A and B — then recombine with the original L untouched. The grayscale input already is the luminance, so asking the model to reproduce it wastes capacity and risks degrading detail it was handed for free. The output layer is tanh with AB targets normalised by 128, which matches the channel range exactly.",
    file: "PDF p.67–71, p.98",
  },
  {
    tag: "Baselines",
    title: "Two of the four methods are meant to be bad.",
    body: "The JET colormap and the untrained CNN are not competitors — they are controls. The colormap shows what a metric records when the output is false colour rather than inferred colour, and the untrained network shows the serving path working with no learned weights behind it. Reporting them next to DeOldify is what makes the 7–15 dB versus 16–30 dB gap mean something. A comparison with only strong entrants tells you nothing about the metric.",
    file: "PDF p.48–49",
  },
  {
    tag: "Known flaw",
    title: "The dashboard's metrics don't really measure colour.",
    body: "calculate_metrics converts both the result and the reference to grayscale before computing PSNR and SSIM. Since colorization preserves luminance by construction, that comparison is close to measuring nothing — two wildly different colorizations of the same photo would score almost identically. DeOldify's separate evaluation does use the full-colour reference, which is why those two sets of numbers are not comparable. The fix is to score in RGB or use a colour-aware metric; lpips is already installed and unused.",
    file: "PDF p.98 vs p.19",
  },
];

/* --- Content: stack ------------------------------------------------------ */
const STACK = [
  { group: "Serving", items: ["Gradio 5.7.1", "Google Colab", "temporary share link"] },
  { group: "Models", items: ["DeOldify (fastai 1.0.61)", "PyTorch 2.5.1 + cu121", "TensorFlow / Keras 2.17.1"] },
  { group: "Vision", items: ["OpenCV 4.10", "scikit-image 0.24 (LAB, PSNR, SSIM)", "NumPy 1.26", "Pillow 11"] },
  { group: "Data", items: ["22 grayscale/colour pairs", "17 / 5 train-validation split", "128 × 128 inputs"] },
];

/* --- Content: verified numbers ------------------------------------------ */
const NUMBERS = [
  { value: "4", label: "colorization methods explored" },
  { value: "22", label: "paired training images" },
  { value: "1.33M", label: "autoencoder parameters" },
  { value: "100", label: "training epochs" },
  { value: "3", label: "metrics per result" },
  { value: "128²", label: "input resolution" },
];

/* --- Screenshot slot ----------------------------------------------------- */
function Shot({ src, w, h, alt, caption }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure>
      <div className="overflow-hidden rounded-lg border" style={{ borderColor: C.rule, backgroundColor: C.block }}>
        {failed ? (
          <div
            className="flex flex-col items-center justify-center gap-2 px-6 text-center"
            style={{ aspectRatio: `${w} / ${h}`, backgroundColor: C.block, color: C.faint }}
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
            style={{ aspectRatio: `${w} / ${h}`, objectFit: "cover", backgroundColor: C.block }}
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

export default function ColorizationLanding() {
  const [activeId, setActiveId] = useState("deoldify");
  const [metric, setMetric] = useState("psnr");
  const active = METHODS.find((m) => m.id === activeId) || METHODS[0];

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: C.field, color: C.text }}>
      {/* ==================================================================
          NAV
          ================================================================== */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: C.rule, backgroundColor: "rgba(12,13,16,0.9)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="rounded-md focus:outline-none focus-visible:ring-2" style={{ outlineColor: C.orange }}>
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
              href="https://github.com/zssain/Multi-Model-Image-Colorization-System-with-Interactive-Dashboard-and-Performance" target="_blank" rel="noreferrer"
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
            <Eyebrow>Computer vision · comparative study</Eyebrow>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Four ways to colour
              <br />
              a black-and-white photo.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: C.muted }}>
              Upload a grayscale image, pick a colorizer, and see the result with
              its PSNR, SSIM and MSE. Two of the four methods are deliberately
              weak baselines — because a comparison with only strong entrants
              tells you nothing about the metric.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* TODO: repository URL */}
              <a
                href="https://github.com/zssain/Multi-Model-Image-Colorization-System-with-Interactive-Dashboard-and-Performance" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: C.orange, color: "#150800", outlineColor: C.orange }}
              >
                <Github size={16} aria-hidden="true" />
                View the source
              </a>
              <a
                href="#engineering"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: C.rule, color: C.text, outlineColor: C.orange }}
              >
                Read the method
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-6 text-xs" style={{ color: C.faint }}>
              Gradio · PyTorch · TensorFlow · DeOldify · OpenCV · scikit-image
            </p>
          </Reveal>

          {/* --- The LAB pipeline, which is the actual idea --- */}
          <Reveal delay={140} className="lg:col-span-6">
            <div className="rounded-lg border p-6" style={{ borderColor: C.rule, backgroundColor: C.block }}>
              <p className="text-sm font-semibold">What the network actually predicts</p>
              <p className="mt-1 text-sm" style={{ color: C.muted }}>
                Grayscale in, two channels out, recombined.
              </p>

              <ol className="mt-6 space-y-3">
                {[
                  { k: "L", label: "Luminance", note: "taken straight from the grayscale input, never predicted", tone: "#9CA3AF" },
                  { k: "A", label: "Green ↔ red", note: "predicted, tanh output scaled by 128", tone: C.orange },
                  { k: "B", label: "Blue ↔ yellow", note: "predicted, tanh output scaled by 128", tone: C.teal },
                ].map((row) => (
                  <li key={row.k} className="flex items-start gap-4 rounded-md border p-4" style={{ borderColor: C.rule, backgroundColor: C.field }}>
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded font-mono text-sm font-bold"
                      style={{ backgroundColor: C.blockHi, color: row.tone }}
                    >
                      {row.k}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: C.faint }}>
                        {row.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-5 flex items-start gap-2 rounded-md p-4 text-xs leading-relaxed" style={{ backgroundColor: C.orangeSoft, color: C.text }}>
                <Palette size={14} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.orange }} />
                Recombined through lab2rgb. The model only ever learns colour —
                the detail in the photograph is the input's, untouched.
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
              Plenty of colorizers exist. Comparing them is the hard part.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                Old and scientific images are often grayscale, and colouring them
                by hand is slow and subjective. Automated methods behave very
                differently from one another, and each paper reports its own
                numbers on its own images — which makes it hard to tell what will
                work on yours.
              </p>
              <p style={{ color: C.text }}>
                This puts four approaches behind one interface, running on the
                same image, scored with the same metrics. Including the weak ones
                is the point: seeing a false-colour colormap land at 7–15 dB
                while a pretrained model reaches 16–30 dB tells you as much about
                the metric as it does about the models.
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
              One dashboard, four backends, three numbers.
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
                      style={{ backgroundColor: C.orangeSoft, color: C.orange }}
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
          Method comparison, engineering decisions, stack.
          ================================================================== */}
      <section id="engineering" className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>Under the hood</Eyebrow>
            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Four methods, and what each one is actually for.
            </h2>
          </Reveal>

          {/* --- SIGNATURE: method selector + measured ranges --- */}
          <Reveal delay={100}>
            <div className="mt-12 grid gap-6 lg:grid-cols-12">
              {/* Selector, in the dashboard's own radio idiom */}
              <div className="lg:col-span-5">
                <p className="mb-3 text-sm font-semibold">Choose a colorization model</p>
                <ul role="list" className="space-y-2">
                  {METHODS.map((m) => {
                    const isActive = m.id === activeId;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(m.id)}
                          aria-pressed={isActive}
                          className="flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: isActive ? C.orange : C.rule,
                            backgroundColor: isActive ? C.blockHi : C.block,
                            outlineColor: C.orange,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border"
                            style={{ borderColor: isActive ? C.orange : C.faint }}
                          >
                            {isActive && <span className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.orange }} />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">
                              {m.name}{" "}
                              <span className="font-normal" style={{ color: C.faint }}>
                                ({m.sub})
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs" style={{ color: m.statusTone }}>
                              {m.status}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: C.faint }}>
                  The local dashboard runs the first two offline. DeOldify and
                  the trained autoencoder need artifacts that aren't committed to
                  the repository.
                </p>
              </div>

              {/* Detail + measured ranges */}
              <div className="lg:col-span-7">
                <div className="rounded-lg border p-6" style={{ borderColor: C.rule, backgroundColor: C.block }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{active.name}</h3>
                      <p className="mt-0.5 font-mono text-xs" style={{ color: C.faint }}>
                        {active.detail}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded border px-2 py-0.5 text-xs"
                      style={{ borderColor: C.rule, color: C.muted }}
                    >
                      {active.role}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>
                    {active.body}
                  </p>

                  {/* metric toggle */}
                  <div className="mt-6 flex items-center justify-between border-t pt-5" style={{ borderColor: C.rule }}>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.faint }}>
                      Observed across 22 images
                    </p>
                    <div className="flex gap-1">
                      {[
                        { k: "psnr", label: "PSNR dB" },
                        { k: "ssim", label: "SSIM" },
                      ].map((t) => (
                        <button
                          key={t.k}
                          type="button"
                          onClick={() => setMetric(t.k)}
                          aria-pressed={metric === t.k}
                          className="rounded px-3 py-1 font-mono text-xs transition-colors duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            backgroundColor: metric === t.k ? C.orangeSoft : "transparent",
                            color: metric === t.k ? C.orange : C.faint,
                            outlineColor: C.orange,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    {METHODS.map((m) => (
                      <MetricRange key={m.id} method={m} activeId={activeId} metric={metric} />
                    ))}
                  </div>

                  <p className="mt-5 flex items-start gap-2 rounded-md border p-4 text-xs leading-relaxed" style={{ borderColor: C.rule, color: C.faint }}>
                    <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.amber }} />
                    These two evaluations were not run identically — DeOldify was
                    scored against the full-colour reference, the colormap
                    against grayscale versions of both images. Read the gap as
                    directional, not as a like-for-like benchmark. Single-run
                    values, not a controlled experiment.
                  </p>
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
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: C.orange }}>
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
              <h3 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.orange }}>
                Stack
              </h3>
              <dl className="mt-6 space-y-5">
                {STACK.map((s) => (
                  <div key={s.group} className="sm:flex sm:gap-8">
                    <dt className="w-28 shrink-0 text-sm font-bold">{s.group}</dt>
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
                <FlaskConical size={13} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: C.amber }} />
                Honest limitations: the autoencoder trained on 17 images, which
                is one batch per epoch — it is a learning exercise, not a
                production model. The dashboard's metric methodology measures
                structure more than colour. Per-image latency and aggregate
                autoencoder scores were never measured.
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
      <section className="border-b" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <Eyebrow>The dashboard</Eyebrow>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Drop an image on the left, read the numbers on the right.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {[
              {
                src: "/screenshots/colorization-dashboard.png",
                w: 3024,
                h: 1964,
                wide: true,
                alt: "The Gradio image colorization dashboard showing the four model choices, an upload target for a grayscale image, and panels for the colorized result and its metrics.",
                caption:
                  "The local dashboard. Each model choice states its own requirements up front — two run offline, two need artifacts that aren't in the repository.",
              },
              {
                // TODO: capture a DeOldify result with its metrics readout
                src: "/screenshots/colorization-deoldify.png",
                w: 3024,
                h: 1964,
                alt: "TODO: a DeOldify colorization result alongside its PSNR, SSIM and MSE readout.",
                caption:
                  "A DeOldify result. The strongest output of the four, with its metrics printed beside it.",
              },
              {
                // TODO: capture the same input through the autoencoder for contrast
                src: "/screenshots/colorization-autoencoder.png",
                w: 3024,
                h: 1964,
                alt: "TODO: the same input colorized by the from-scratch LAB autoencoder.",
                caption:
                  "The same photo through the autoencoder. Noisier and prone to clipping in the conversion back to RGB — what 17 training images buys you.",
              },
              {
                // TODO: capture the autoencoder training curve from the notebook
                src: "/screenshots/colorization-training.png",
                w: 3024,
                h: 1964,
                alt: "TODO: the autoencoder training and validation loss curve over 100 epochs.",
                caption:
                  "Training the autoencoder. Loss 0.0173 against validation 0.0285 after 100 epochs — the gap a 17-image training set produces.",
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
      <footer style={{ backgroundColor: C.field }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  The interesting part is what gets measured.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: C.muted }}>
                  A LAB pipeline that only learns colour, two baselines built to
                  fail informatively, and a metric methodology this project can
                  tell you is wrong and how to fix it.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                {/* TODO: repository URL */}
                <a
                  href="https://github.com/zssain/Multi-Model-Image-Colorization-System-with-Interactive-Dashboard-and-Performance" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: C.orange, color: "#150800", outlineColor: C.orange }}
                >
                  <Github size={16} aria-hidden="true" />
                  View the source
                </a>
                <a
                  href="mailto:mohammedzuhairhussain28@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: C.rule, color: C.text, outlineColor: C.orange }}
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
                style={{ outlineColor: C.orange }}
              >
                LinkedIn
              </a>
              <a
                href="mailto:mohammedzuhairhussain28@gmail.com"
                className="rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2"
                style={{ outlineColor: C.orange }}
              >
                mohammedzuhairhussain28@gmail.com
              </a>
              {/* TODO: no LICENSE file exists in the repo — set one or delete this line */}
              <span className="inline-flex items-center gap-1.5">
                <Check size={12} aria-hidden="true" />
                Licence: TODO
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
