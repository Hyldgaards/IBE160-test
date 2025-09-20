# Design og UI – Beer Game (Next.js)

## Prinsipper
- Fokus på **enkelhet** og **oversiktlighet** framfor grafikk.
- Bruk systemfont (sans-serif) for ren og lesbar tekst.
- Rollekort i grid gir rask oversikt over nøkkeltall for hver rolle.
- Historikk vises i tabell, ikke skjult, slik at endringer kan følges uke for uke.
- Kontroller (knapper + input) skal være store, tydelige og plassert øverst.

## Layout
- Tittel øverst: *Beer Game – 1 menneske + 3 roboter*.
- Under tittel: uke-indikator (Uke t).
- Kontrollpanel:
  - Input for kunde-etterspørsel (D).
  - Input for robotparametre (Uniform a, b, seed).
  - Knapper: **Neste uke**, **Angre siste uke**, **Reset**.
- Rollekort (grid 2x2):
  - Viser Lager, Backlog, PipelineSum, S.
- Historikktabell:
  - Kolonner: Uke, Rolle, Mottak, Etterspørsel, Skip, Lager, Backlog, Bestilling, I pipeline.
  - Rad = en rolle i en bestemt uke.
- Fotnote (lite, grå tekst): forklarer lead times og at oppstrøms etterspørsel = nedstrøms forrige ukes ordre.

## Interaksjon
- Etterspørsel og robotparametre kan justeres **før uke 1**.
- Når uke > 1: feltene låses (bruk Reset for å endre scenario).
- Undo trekker én uke tilbake (inkl. historikk).
- Reset nullstiller hele spillet.

## Tilgjengelighet
- Inputfelter og knapper skal ha `<label>` og være fokusbare.
- Tabell med `<thead>` og `<th>` for overskrifter.
- Kontrast: mørk tekst på lys bakgrunn, tydelige grenser i tabellen.

## Fremtidige forbedringer (ikke i MVP)
- Grafer over lager og backlog.
- Mobiltilpasning (responsiv layout).
- Tema-valg (lys/mørk).