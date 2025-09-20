This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---

## Beer Game v1 (IBE160) — prosjektlogg

**Status (20.09.2025)**
- [x] Sprint 1: Next.js satt opp (TS, Tailwind, App Router)
- [x] Sprint 2: `/prompts` opprettet + `1-rules.md` fylt
- [ ] Sprint 3: Minimal UI + state (pågår)
- [ ] Sprint 4: 3 botter
- [ ] Sprint 5: Statistikkvisning
- [ ] Sprint 6: Agentic prompts i Gemini CLI

**Hvordan kjøre**
**Mappestruktur**
- `src/app/page.tsx` — UI
- `src/lib/game.ts` — spillstate + uke-step
- `prompts/` — markdown (regler, krav, osv.)

**Beslutninger (v1)**
- Kun klientside (ingen server)
- Lead time = 1 uke
- Etterspørsel: tilfeldig heltall 4–8 til Retailer

**Neste steg**
- Fullfør Sprint 3: koble UI til `game.ts` og logg første uke
## Sprint 3 — Minimal UI + state (v1)

### Hva skal lages
- Spillstate i `src/lib/game.ts`: `initState()` og `step(state, order)`
- Minimal UI i `src/app/page.tsx`: input for bestilling, knapp **Neste uke**, tabell med historikk

### Hvorfor
- Vise ukesyklus (mottak → etterspørsel → lager/backlog → bestilling) og logg for læring; gir grunnlag for botter/statistikk.

### Hvordan (kommandoer som skal kjøres)
1. Opprett mappe og fil: