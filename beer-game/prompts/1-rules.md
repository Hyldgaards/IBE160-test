# Spillerregler – Beer Game (lokal, 1 menneske + 3 roboter)

**Roller:** Retailer (menneske), Wholesaler, Distributor, Factory (roboter).

**Tidssteg:** Ukevis. Hver uke skjer i denne rekkefølgen:
1. Mottak: Varer i pipeline som ankommer, legges til lager.
2. Etterspørsel: 
   - Retailer får ekstern kunde-etterspørsel D_t.
   - Øvrige roller får etterspørsel lik forrige ukes ordre fra nedstrøms ledd.
3. Levering: `ship_t = min(onHand_t, demand_t + backlog_t)`.
4. Oppdatering: 
   - `onHand_{t+1} = onHand_t + mottak_t − ship_t`
   - `backlog_{t+1} = max(0, demand_t + backlog_t − ship_t)`
5. Bestilling:
   - Menneske: skriver inn ordre (heltall ≥ 0).
   - Roboter: velger ordre via **statistisk fordeling** (uniform/normal, klippet til ≥ 0), eller alternativt Base-Stock i eksperimenter.
6. Ordren skyves inn i egen pipeline og ankommer etter **lead time** (LT).

**Mål:** Hold backlog lav og stabil leveringsflyt.

**Standard parametre (MVP):**
- LT: 2 uker mellom ledd; Factory total LT = 3 (produksjon+forsendelse).
- Etterspørsel: konstant D (f.eks. 8), step eller tilfeldig (seedet).
- Robot-policy: tilfeldig trekk pr. uke, f.eks. `Uniform[a,b]` eller `Normal(μ,σ)` klippet til [0, ∞).

**Begrensninger:**
- Ingen serverside. All logikk kjører i browser (Next.js client).