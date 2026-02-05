"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import dynamic from "next/dynamic";
import { useParallax } from "../hooks/useParallax";
import { motionPresets } from "../lib/motion";
import { useIsMobile } from "../hooks/useIsMobile";

const HeroScene = dynamic(() => import("./HeroScene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-white/5" />,
});

export function LandingHero() {
  const [logoUrl, setLogoUrl] = useState<string>("/logo.svg");
  const parallaxOffset = useParallax(0.08);
  const headline = "Verify every claim with a multi-agent evidence pipeline.";
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("/api/logo");
        if (!response.ok) return;
        const data = (await response.json()) as { url?: string };
        if (data.url) setLogoUrl(data.url);
      } catch {
        setLogoUrl("/logo.svg");
      }
    };
    fetchLogo();
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:px-12">
      <div
        className="absolute inset-0 bg-hero-gradient opacity-70"
        style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-stretch">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="TinyFish Mino AI"
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl object-contain"
            />
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-200">
              Research claim checker by TinyFish Mino AI
            </p>
          </div>
          <motion.h1
            className="text-glow text-3d text-gradient-animate font-[var(--font-space)] text-4xl font-semibold leading-tight md:text-6xl"
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={motionPresets.stagger}
          >
            {headline.split(" ").map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="mr-2 inline-block"
                variants={motionPresets.fadeUp}
                transition={{ duration: 0.6 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            className="max-w-xl text-base text-slate-300 md:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            TinyFish Mino AI orchestrates Mino agents with Perplexity source
            lookup to extract claims, hunt evidence, and score research
            integrity in real time.
          </motion.p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => (window.location.href = "/app")}>
              Launch the app
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
              }
            >
              Explore pipeline
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300">
            <span className="rounded-full bg-white/10 px-3 py-1">
              NDJSON streaming
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              World relevance scoring
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Perplexity source lookup
            </span>
          </div>
        </div>
        <GlassCard className="relative flex-1 overflow-hidden min-h-[420px]">
          {!isMobile ? (
            <div className="absolute inset-0 -z-10 opacity-60">
              <HeroScene />
            </div>
          ) : null}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Live pipeline
            </p>
            <div className="space-y-4">
              {[
                "Claim extraction",
                "Evidence discovery",
                "Counter evidence",
                "Evidence judge",
                "Risk integrity",
              ].map((stage) => (
                <div
                  key={stage}
                  className="clay-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/90"
                >
                  <span>{stage}</span>
                  <span className="text-xs text-cyan-200">streaming</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
