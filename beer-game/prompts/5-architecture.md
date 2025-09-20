# Arkitektur – Beer Game (Next.js, client only)

## Stack
- **Framework:** Next.js (App Router) med TypeScript.
- **UI:** React client components (ingen serverside rendering nødvendig).
- **Styling:** Inline styles / enkel CSS i MVP. Kan utvides til Tailwind senere.
- **Datahåndtering:** React state (useState + useMemo).  
- **Distribusjon:** Kjøring i nettleser, ingen backend eller database.

## State-modell
- `GameState` holder all spilltilstand:
  - `week` – uke nr.
  - `roles` – lagerstatus for hver rolle.
  - `lastOrders` – forrige ukes ordre pr. rolle (driver oppstrøms demand).
  - `history` – tabellrader per uke/rolle.
  - `random` – parametre og seed for robotpolicy.
- `RoleState` (per rolle):
  - `onHand`, `backlog`, `pipeline[]`, `leadTime`, `policy`, `params`.

## Spillmotor
- `stepWeek(prev: GameState, externalDemand: number): GameState`
  1. Flytt mottak fra pipeline til lager.
  2. Beregn demand (kunde eller nedstrøms ordre).
  3. Lever ut varer (`ship = min(onHand, demand+backlog)`).
  4. Oppdater backlog.
  5. Generer ny ordre (BS eller RANDOM).
  6. Skyv ordre inn i pipeline.
  7. Logg rader og øk uke.
- Undo: stack av `GameState` snapshots (dyp kopi).
- Reset: gjenoppretter `initialState`.

## Robot-policy
- **BS (Base-Stock):** `order = max(0, S − (onHand + pipeline − backlog))`.
- **RANDOM:** Uniform[a,b] eller Normal(μ,σ), deterministisk via seed (LCG).
- Retailer kan være **BS** (MVP) eller **Human** (manuell input i videreutvikling).

## Filstruktur (målbilde)
beer-game/
prompts/ # dokumentasjons-promptene (rules, scenario, prd, design, arch, plan)
src/
app/page.tsx # hovedkomponent (UI)
lib/
engine.ts # stepWeek og state-logikk
policies.ts # BS, RANDOM (Uniform/Normal)
components/
RoleCard.tsx # visning av lager/backlog/pipeline for én rolle
HistoryTable.tsx # ukevis tabell

markdown
Kopier kode

## Arkitekturvalg
- Hele appen er **deterministisk og lokal**.
- Ingen API-kall: alt kjører i nettleseren.
- Undo implementert via snapshots → lett å debugge og utvide.
- Robot-random styres av seed → mulig å gjenskape scenarioer.
- Modulær struktur: motoren kan testes isolert.

## Videre utvikling
- Skille mellom “kunde-etterspørsel” og “Retailer sin bestilling”.
- Integrere grafer for visuell analyse.
- Egen `store` (Zustand eller Redux) for mer avanserte features.