"use client";
import { useMemo, useState } from "react";

/** ---------- Typer ---------- */
type Role = "Retailer" | "Wholesaler" | "Distributor" | "Factory";

interface RoleState {
  onHand: number;
  backlog: number;
  pipeline: number[];  // innkommende forsendelser til denne rollen
  leadTime: number;    // 2 for tre første; 3 for Factory (prod + forsendelse)
  policy: "HUMAN" | "BS" | "RANDOM";
  params: { S: number }; // brukes av BS (ligger her for fremtidig bruk)
}

interface WeekRow {
  week: number;
  role: Role;
  received: number;
  demand: number;
  ship: number;
  onHand: number;
  backlog: number;
  order: number;
  pipelineSum: number;
}

interface GameState {
  week: number;
  roles: Record<Role, RoleState>;
  lastOrders: Record<Role, number>;     // ordrene lagt forrige uke
  history: WeekRow[];                   // 4 rader per uke
  random: { mode: "uniform"; a: number; b: number; seed: number }; // robot-tilfeldighet
}

const ROLES: Role[] = ["Retailer", "Wholesaler", "Distributor", "Factory"];

/** ---------- Hjelpere ---------- */
// Dyp kopi (for undo)
function cloneState(s: GameState): GameState {
  return {
    week: s.week,
    roles: {
      Retailer:   { ...s.roles.Retailer,   pipeline: [...s.roles.Retailer.pipeline] },
      Wholesaler: { ...s.roles.Wholesaler, pipeline: [...s.roles.Wholesaler.pipeline] },
      Distributor:{ ...s.roles.Distributor,pipeline: [...s.roles.Distributor.pipeline] },
      Factory:    { ...s.roles.Factory,    pipeline: [...s.roles.Factory.pipeline] },
    },
    lastOrders: { ...s.lastOrders },
    history: [...s.history],
    random: { ...s.random },
  };
}

// Deterministisk PRNG (LCG)
function lcgNext(seed: number): { u: number; seed: number } {
  const a = 1664525, c = 1013904223, m = 2 ** 32;
  const next = (a * seed + c) % m;
  return { u: next / m, seed: next };
}
function randIntUniform(u: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, Math.floor(a + u * (b - a + 1))));
}

/** ---------- Spillmotor: ett ukesteg ---------- */
function stepWeek(prev: GameState, externalDemand: number, retailerOrder: number): GameState {
  const s = cloneState(prev);

  // 1) Mottak (pipeline -> lager)
  const received: Record<Role, number> = { Retailer:0, Wholesaler:0, Distributor:0, Factory:0 };
  for (const r of ROLES) {
    const role = s.roles[r];
    const recv = role.pipeline.length > 0 ? role.pipeline[0] : 0;
    received[r] = recv;
    role.pipeline = role.pipeline.slice(1);
    while (role.pipeline.length < role.leadTime - 1) role.pipeline.push(0);
    role.onHand += recv;
  }

  // 2) Demand denne uken
  const demand: Record<Role, number> = {
    Retailer: externalDemand,
    Wholesaler: s.lastOrders.Retailer || 0,
    Distributor: s.lastOrders.Wholesaler || 0,
    Factory: s.lastOrders.Distributor || 0,
  };

  // 3) Skip og oppdater onHand / backlog
  const shipped: Record<Role, number> = { Retailer:0, Wholesaler:0, Distributor:0, Factory:0 };
  for (const r of ROLES) {
    const role = s.roles[r];
    const need = demand[r] + role.backlog;
    const ship = Math.max(0, Math.min(role.onHand, need));
    shipped[r] = ship;
    role.onHand -= ship;
    role.backlog = Math.max(0, need - ship);
  }

  // 4) Ordre (HUMAN for Retailer, RANDOM for roboter, ellers BS)
  const orders: Record<Role, number> = { Retailer:0, Wholesaler:0, Distributor:0, Factory:0 };
  let seed = s.random.seed;

  for (const r of ROLES) {
    const role = s.roles[r];
    let order = 0;

    if (r === "Retailer" && role.policy === "HUMAN") {
      order = Math.max(0, Math.round(retailerOrder));
    } else if (role.policy === "RANDOM" && r !== "Retailer") {
      const { u, seed: nextSeed } = lcgNext(seed);
      seed = nextSeed;
      order = randIntUniform(u, s.random.a, s.random.b);
    } else {
      // Base-Stock fallback (ikke brukt for roboter i krav, men nyttig å ha)
      const pipelineSum = role.pipeline.reduce((a, b) => a + b, 0);
      const invPos = role.onHand + pipelineSum - role.backlog;
      order = Math.max(0, role.params.S - invPos);
      order = Math.round(order);
    }

    orders[r] = order;
    role.pipeline.push(order); // ankommer etter role.leadTime
  }

  // 5) Logg 4 rader
  const rows: WeekRow[] = ROLES.map((r) => ({
    week: s.week,
    role: r,
    received: received[r],
    demand: demand[r],
    ship: shipped[r],
    onHand: s.roles[r].onHand,
    backlog: s.roles[r].backlog,
    order: orders[r],
    pipelineSum: s.roles[r].pipeline.reduce((a, b) => a + b, 0),
  }));
  s.history = [...s.history, ...rows];

  // 6) For neste uke
  s.lastOrders = { ...orders };
  s.random.seed = seed;
  s.week = s.week + 1;
  return s;
}

/** ---------- React-komponent ---------- */
export default function Home() {
  // Scenario-inndata
  const [customerDemandStr, setCustomerDemandStr] = useState("8");   // Kunde-etterspørsel til Retailer (D)
  const [retailerOrderStr, setRetailerOrderStr] = useState("0");     // Menneskets ordre hver uke
  const customerDemand = useMemo(
    () => parseInt(customerDemandStr || "0", 10) || 0,
    [customerDemandStr]
  );

  // Initial tilstand (steady state for valgt D)
  const initialState: GameState = useMemo(() => {
    const D = customerDemand;
    return {
      week: 1,
      roles: {
        Retailer:   { onHand: 2*D, backlog: 0, pipeline: [D, D],       leadTime: 2, policy: "HUMAN",  params: { S: 2*D } },
        Wholesaler: { onHand: 2*D, backlog: 0, pipeline: [D, D],       leadTime: 2, policy: "RANDOM", params: { S: 2*D } },
        Distributor:{ onHand: 2*D, backlog: 0, pipeline: [D, D],       leadTime: 2, policy: "RANDOM", params: { S: 2*D } },
        Factory:    { onHand: 3*D, backlog: 0, pipeline: [D, D, D],    leadTime: 3, policy: "RANDOM", params: { S: 3*D } },
      },
      lastOrders: { Retailer: 0, Wholesaler: 0, Distributor: 0, Factory: 0 },
      history: [],
      random: { mode: "uniform", a: 6, b: 10, seed: 42 },
    };
  }, [customerDemand]);

  const [state, setState] = useState<GameState>(initialState);
  const [undo, setUndo] = useState<GameState[]>([]);

  // Handlinger
  const handleNextWeek = () => {
    const retOrder = parseInt(retailerOrderStr || "0", 10) || 0;
    setUndo((u) => [...u, cloneState(state)]);
    setState((prev) => stepWeek(prev, customerDemand, retOrder));
    setRetailerOrderStr("0"); // nullstill for neste uke
  };

  const handleUndo = () => {
    setUndo((u) => {
      if (u.length === 0) return u;
      const prev = u[u.length - 1];
      setState(prev);
      return u.slice(0, -1);
    });
  };

  const handleReset = () => {
    setState(cloneState(initialState));
    setUndo([]);
  };

  const sumPipeline = (r: Role) => state.roles[r].pipeline.reduce((a, b) => a + b, 0);

  // UI
  return (
    <main style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Beer Game — 1 menneske + 3 roboter</h1>
      <div style={{ marginTop: 4, opacity: 0.8 }}>Uke {state.week}</div>

      {/* Kontrollpanel */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <label htmlFor="cust">Kunde-etterspørsel (Retailer, D)</label>
        <input
          id="cust"
          type="number"
          value={customerDemandStr}
          onChange={(e) => setCustomerDemandStr(e.target.value)}
          style={{ padding: 6, width: 120 }}
          disabled={state.week > 1} // lås etter start for reproduserbarhet
        />

        <label htmlFor="retOrder">Retailer-ordre (manuell)</label>
        <input
          id="retOrder"
          type="number"
          value={retailerOrderStr}
          onChange={(e) => setRetailerOrderStr(e.target.value)}
          style={{ padding: 6, width: 120 }}
        />

        <button onClick={handleNextWeek} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
          Neste uke
        </button>
        <button onClick={handleUndo} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
          Angre siste uke
        </button>
        <button onClick={handleReset} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
          Reset
        </button>
      </div>

      {/* Random-innstillinger for roboter (låses etter uke 1) */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600 }}>Roboter: Uniform [a,b], seed</span>
        <label>a</label>
        <input
          type="number"
          value={state.random.a}
          onChange={(e) => setState({ ...state, random: { ...state.random, a: parseInt(e.target.value || "0", 10) } })}
          style={{ padding: 6, width: 80 }}
          disabled={state.week > 1}
        />
        <label>b</label>
        <input
          type="number"
          value={state.random.b}
          onChange={(e) => setState({ ...state, random: { ...state.random, b: parseInt(e.target.value || "0", 10) } })}
          style={{ padding: 6, width: 80 }}
          disabled={state.week > 1}
        />
        <label>seed</label>
        <input
          type="number"
          value={state.random.seed}
          onChange={(e) => setState({ ...state, random: { ...state.random, seed: parseInt(e.target.value || "0", 10) } })}
          style={{ padding: 6, width: 100 }}
          disabled={state.week > 1}
        />
      </div>

      {/* Rolle-kort */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 10, marginTop: 16 }}>
        {ROLES.map((r) => (
          <div key={r} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{r}</div>
            <div>Lager: <b>{state.roles[r].onHand}</b></div>
            <div>Backlog: <b>{state.roles[r].backlog}</b></div>
            <div>I pipeline: <b>{sumPipeline(r)}</b></div>
            <div>BS S: <b>{state.roles[r].params.S}</b></div>
          </div>
        ))}
      </div>

      {/* Historikk-tabell */}
      <table style={{ marginTop: 16, borderCollapse: "collapse", minWidth: 920 }}>
        <thead>
          <tr>
            {["Uke","Rolle","Mottak","Etterspørsel","Skip","Lager","Backlog","Bestilling","I pipeline"].map((h) => (
              <th key={h} style={{ border: "1px solid #333", padding: "6px 10px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.history.map((row, idx) => (
            <tr key={`${row.week}-${row.role}-${idx}`}>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.week}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.role}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.received}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.demand}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.ship}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.onHand}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.backlog}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.order}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.pipelineSum}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Merk: Oppstrøms etterspørsel er forrige ukes ordre fra nedstrøms ledd. Fabrikken har total ledetid 3 (produksjon+forsendelse).
      </p>
    </main>
  );
}