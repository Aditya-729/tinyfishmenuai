import { SectionTitle } from "../ui/SectionTitle";
import { Badge } from "../ui/Badge";

const claimCards = [
  {
    text: "India's renewable energy capacity crossed 180 GW in 2024.",
    risk: "Strong",
  },
  {
    text: "Consumer inflation fell below 4% for three consecutive quarters.",
    risk: "Medium",
  },
  {
    text: "Electric vehicle adoption surpassed 30% of all new sales in India.",
    risk: "Possibly misleading",
  },
];

export function ClaimCarousel() {
  return (
    <section className="relative px-6 py-20 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <SectionTitle
          eyebrow="Claim view"
          title="Navigate claims with horizontal flow."
          description="A scrollable claim deck visualizes evidence strength, freshness, and integrity badges."
        />
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {claimCards.map((card) => (
            <div
              key={card.text}
              className="min-w-[280px] snap-start rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                  Claim card
                </p>
                <Badge
                  label={card.risk}
                  tone={
                    card.risk === "Strong"
                      ? "strong"
                      : card.risk === "Medium"
                        ? "medium"
                        : "weak"
                  }
                />
              </div>
              <p className="mt-4 text-sm text-white">{card.text}</p>
              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <p>Freshness: 0.82</p>
                <p>India relevance: 0.74</p>
                <p>Evidence strength: 0.77</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
