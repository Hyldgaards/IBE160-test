# Product Requirements Document (PRD) – Beer Game (Next.js, lokal simulering)

## Problem
Studenter skal trene på Beer Game-mekanismene (lager, backlog, pipeline, bullwhip-effekten) uten å måtte spille online med flere deltakere.  
Det trengs en enkel, lokal webapp med 1 menneskelig spiller og 3 robotmotstandere.

## Mål
- Lage en Next.js-app som kjører helt i nettleser (client only).
- Støtte 4 roller: Retailer (menneske) + Wholesaler, Distributor, Factory (roboter).
- Vise tydelig ukevis oppdatering av: lager, backlog, pipeline, skip, ordre.
- Implementere både **Base-Stock (BS)** og **Random (Uniform/Normal)** som robot-policy.
- Gi spilleren kontroll over kunde-etterspørsel, robotparametre og seed (låst etter start).
- Ha funksjoner for **Neste uke**, **Angre siste uke**, **Reset**.
- Logge all historikk i tabellform.

## Ikke-mål
- Ingen serverside, database eller online-multiplayer.
- Ingen avansert grafikk eller komplekse analyser utover tabeller (grafer kan komme senere).

## Brukerhistorier
- Som student vil jeg starte simuleringen med et gitt scenario (f.eks. konstant D=8).
- Som student vil jeg klikke *Neste uke* og se hvordan lager og backlog endrer seg.
- Som student vil jeg kunne angre siste trekk eller resette helt.
- Som student vil jeg kunne teste ulike robotstrategier (random, BS) og se effekten.
- Som student vil jeg kunne variere kunde-etterspørsel (konstant, step, random).

## Akseptansekriterier (MVP)
- Historikktabell logger alle variabler uke for uke.
- Undo og Reset fungerer.
- Roboter kan generere ordre deterministisk via seedet random-fordeling.
- Etterspørsel kan settes til konstant, step eller random (før uke 1).
- Lead time håndteres korrekt: 2 uker for mellomledd, 3 for Factory.

## Risikoer og avhengigheter
- Må være helt klientbasert (ingen serverkall).
- Robotenes random-policy må være deterministisk (samme seed gir samme resultat).
- Viktig at undo/redo faktisk ruller tilbake hele tilstanden (lager, backlog, pipeline, historikk).