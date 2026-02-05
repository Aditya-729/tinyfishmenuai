# Research Claim Checker by TinyFish Mino AI

Research Claim Checker by TinyFish Mino AI is a production-ready, multi-agent research verification system that breaks documents into atomic claims, streams evidence discovery, and labels risk with transparent integrity signals.

## Features

- Mino-powered multi-stage pipeline (extract, evidence, counter-evidence, judge, risk)
- Perplexity evidence discovery and source lookup
- Real-time NDJSON streaming pipeline updates
- Claim cards with evidence strength, freshness, and world relevance
- Advanced signals: clustering, duplicates, temporal drift, evidence conflict
- Neumorphic + glassmorphic + claymorphic UI with animation-driven UX

## Tech Stack

- Next.js App Router + API routes
- Node.js streaming NDJSON
- TailwindCSS + Framer Motion + GSAP + Three.js
- Perplexity API for evidence and counter-evidence lookup

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page. Visit `/app` for the claim checker.

## Environment Variables

Create a `.env.local` file (see `.env.example`):

```bash
MINO_API_KEY=your_mino_key
PERPLEXITY_API_KEY=your_perplexity_key
```

If no keys are supplied, the pipeline runs in fallback heuristic mode for local demos.

## Project Structure

- `agents/` Mino agents for each pipeline stage
- `pipeline/` streaming orchestrator
- `lib/` API clients, analysis logic, utilities
- `components/` page and product UI blocks
- `ui/` reusable UI primitives
- `hooks/` streaming + animation hooks

## Notes

- Logo search uses a free DuckDuckGo image query with fallback to `public/logo.svg`.
- The API routes stream NDJSON responses for real-time UI updates.
