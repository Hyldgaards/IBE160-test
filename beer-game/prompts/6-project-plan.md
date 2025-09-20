# Prosjektplan – Beer Game (Next.js, lokal simulering)

## Sprint 1 – Grunnlag (fullført ✅)
- Sette opp Next.js-app med TypeScript.
- Implementere grunnleggende UI: uke, knapper (Neste uke, Angre, Reset), tabell.
- Legge til 4 roller: Retailer, Wholesaler, Distributor, Factory.
- Implementere Base-Stock (BS) policy som standard.
- Undo/Reset fungerer.
- Steady-state init med D = 8 (lager/pipeline balansert).

## Sprint 2 – Robot-policy (pågår 🚧)
- Legge til **RANDOM-policy** for roboter (Uniform[a,b], seed).
- Kontrollpanel for a, b og seed (låst etter uke 1).
- Sikre deterministisk forløp via LCG.
- Teste scenarioer: constant demand med random roboter.

## Sprint 3 – Scenarier (planlagt)
- Input for etterspørselstype:
  - Konstant D
  - Step (D endrer seg etter gitt uke)
  - Random (seedbar)
- Vise gjeldende D_t i UI.
- Låse innstillinger etter uke 1.

## Sprint 4 – Rydding og refaktorering
- Trekke ut `engine.ts` (stepWeek) og `policies.ts`.
- Flytte UI-deler til egne komponenter (`RoleCard`, `HistoryTable`).
- Enkle enhetstester (vitest) på spillmotoren.

## Sprint 5 – Analyse og kostnader (valgfritt)
- Legge til kostnadsfunksjon: `cost_t = h·onHand + b·backlog`.
- Vise ukevis kostnader + kumulativ.
- Enkle grafer for lager og backlog.

## Milepæler
- **MVP-demo:** uke 39 → kjørbart spill med 4 roller, random roboter, historikk.
- **Refaktorering:** uke 40 → motor i `lib/`, policies skilt ut.
- **Scenario-testing:** uke 41 → step-shock og random demand.
- **Rapport/innlevering:** uke 42 → alle prompts ferdige, repo komplett.

## Risikoer
- Tid brukt på debugging av state/undo.
- Mulige feil ved kopiering av GameState (dyp kopi nødvendig).
- Studentene må forstå forskjellen mellom kunde-etterspørsel og Retailer-ordre (kan forveksles).

## Neste steg
- Fullfør robot-policy (RANDOM).
- Implementer scenarioer (constant, step, random).
- Fyll ut alle prompt-dokumenter (nå komplett ✅).
- Refaktorering før innlevering.