import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Aperture from "../_landings/aperture-landing";
import Visentix from "../_landings/visentix-landing";
import Vantage from "../_landings/pricing-engine-landing";
import Forecasting from "../_landings/forecasting-landing";
import Wisp from "../_landings/wisp-landing";
import Colorization from "../_landings/colorization-landing";
import HireSense from "../_landings/hiresense-landing";

// slug -> { full landing component, tab title }. Slugs match Project.landing in
// app/lib/data.ts. Add a new project landing by dropping a component in
// ../_landings and registering it here.
const LANDINGS: Record<string, { Comp: () => React.JSX.Element; title: string }> = {
  aperture: { Comp: Aperture, title: "Aperture — Cash-Flow Credit Decisioning" },
  visentix: { Comp: Visentix, title: "Visentix — Privacy Intelligence Platform" },
  vantage: { Comp: Vantage, title: "Vantage — Dynamic Pricing Engine" },
  "time-series": { Comp: Forecasting, title: "Time-Series Forecasting of Stock Prices" },
  wisp: { Comp: Wisp, title: "WISP — Offline Mesh Messaging" },
  colorization: { Comp: Colorization, title: "Multi-Model Image Colorization" },
  hiresense: { Comp: HireSense, title: "HireSense — Explainable CV Screening" },
};

export function generateStaticParams() {
  return Object.keys(LANDINGS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = LANDINGS[slug];
  return entry ? { title: entry.title } : {};
}

export default async function ProjectLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = LANDINGS[slug];
  if (!entry) notFound();
  const Landing = entry.Comp;
  return <Landing />;
}
