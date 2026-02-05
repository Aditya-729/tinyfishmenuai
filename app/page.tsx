"use client";

import dynamic from "next/dynamic";
import { LandingHero } from "../components/LandingHero";
import { useGsapReveal } from "../hooks/useGsapReveal";

const FeatureGrid = dynamic(
  () => import("../components/FeatureGrid").then((mod) => mod.FeatureGrid),
  {
  loading: () => <div className="h-40 rounded-3xl bg-white/5" />,
  },
);
const PipelineShowcase = dynamic(
  () => import("../components/PipelineShowcase").then((mod) => mod.PipelineShowcase),
  { loading: () => <div className="h-40 rounded-3xl bg-white/5" /> },
);
const ClaimCarousel = dynamic(
  () => import("../components/ClaimCarousel").then((mod) => mod.ClaimCarousel),
  { loading: () => <div className="h-40 rounded-3xl bg-white/5" /> },
);

export default function Home() {
  useGsapReveal(".reveal-section");

  return (
    <div className="min-h-screen bg-midnight-900 text-white">
      <div className="scroll-snap-y">
        <div className="scroll-snap-start reveal-section">
          <LandingHero />
        </div>
        <div className="scroll-snap-start reveal-section">
          <FeatureGrid />
        </div>
        <div className="scroll-snap-start reveal-section">
          <PipelineShowcase />
        </div>
        <div className="scroll-snap-start reveal-section">
          <ClaimCarousel />
        </div>
      </div>
    </div>
  );
}
