# VoltIQ — Phase 0: Foundation

Frontend-only scaffold for VoltIQ (Next.js App Router + TypeScript + Tailwind + shadcn-style primitives).
No backend, auth, or AI calls are implemented yet — mock data only.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see a "design system check" placeholder page
confirming colors, typography, and components render correctly, including dark mode
(toggle your OS theme or wire up a theme switcher in Phase 2).

## What's included in this phase

- `tailwind.config.ts` / `app/globals.css` — full design token system (emerald primary,
  blue secondary, light + dark HSL variables, custom shadows/radii)
- `app/layout.tsx` — fonts (Manrope display / Inter body / JetBrains Mono data) + theme provider
- `components/ui/` — Button, Card, Badge, Dialog, Skeleton primitives
- `components/states.tsx` — EmptyState, ErrorState, CardSkeleton, ChartSkeleton, TableSkeleton
- `components/chart-card.tsx` — shared chart wrapper + color palette (all charts route through this)
- `types/index.ts` — TypeScript types matching the planned schema (User, Bill, Forecast, etc.)
- `lib/mock-data.ts` — seeded, deterministic mock data fixtures for every entity

## Roadmap (subsequent phases build inside this foundation)

1. ~~Foundation & design system~~ ✅ this delivery
2. Marketing shell (landing page + auth screens)
3. Core app shell (nav + sidebar + routing, Profile/Settings)
4. Dashboard
5. Upload Bill flow
6. Analytics page
7. AI Assistant chat UI
8. Reports & Notifications
9. Polish pass (responsive/dark-mode/a11y QA)

Ask for the next phase by number/name and it'll be generated inside this same structure.

## Note on scope

Real energy calculations, forecasting logic, and AI responses are intentionally **not**
implemented — every number you see is realistic mock data standing in for a future
FastAPI + OpenAI backend, per the original brief.
