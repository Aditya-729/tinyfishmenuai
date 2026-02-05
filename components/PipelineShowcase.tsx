"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { motionPresets } from "../lib/motion";

const stages = [
  "Claim Extractor",
  "Evidence Finder",
  "Counter Evidence",
  "Evidence Judge",
  "Risk & Integrity",
];

export function PipelineShowcase() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="relative px-6 py-20 md:px-12">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr]">
        <SectionTitle
          eyebrow="Pipeline intelligence"
          title="Real-time, multi-stage verification."
          description="Every claim is processed independently, with streaming updates and structured outputs for each stage."
        />
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <motion.div
              key={stage}
              className="glass-panel rounded-2xl border border-white/10 px-5 py-4 text-sm text-white"
              initial={prefersReducedMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true }}
              variants={motionPresets.fadeUp}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{stage}</span>
                <span className="text-xs text-cyan-200">streaming</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
