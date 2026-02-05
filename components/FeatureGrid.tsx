import { SectionTitle } from "../ui/SectionTitle";

const features = [
  {
    title: "Multi-agent orchestration",
    description:
      "Mino agents collaborate across extraction, evidence discovery, counter evidence, and risk integrity assessment.",
  },
  {
    title: "Perplexity evidence lookup",
    description:
      "Discover supporting and contradicting sources with structured, citation-ready evidence trails.",
  },
  {
    title: "World relevance scoring",
    description:
      "Gauge contextual signals for global relevance and recency confidence.",
  },
  {
    title: "Evidence conflict detection",
    description:
      "Detect contradictions, temporal drift, and overlapping sources across claims.",
  },
];

export function FeatureGrid() {
  return (
    <section className="relative px-6 py-20 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <SectionTitle
          eyebrow="Core capabilities"
          title="Research-grade verification built for trust."
          description="Each claim flows through a multi-stage pipeline, yielding evidence trails, integrity signals, and human-readable risk labels."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="neumorphic-card rounded-3xl border border-white/5 p-6 text-white transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
