"use client";
import { useMemo, useState } from "react";

type Role = "Retailer" | "Wholesaler" | "Distributor" | "Factory";

interface RoleState {
  onHand: number;
  backlog: number;
  pipeline: number[]; // incoming shipments til denne rollen
  leadTime: number;   // 2 for tre første; 3 for Factory
  policy: "BS";
  params: { S: number }; // base-stock nivå
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
  lastOrders: Record<Role, number>;
  history: WeekRow[];
}

const ROLES: Role[] = ["Retailer", "Wholesaler", "Distributor", "Factory"];

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
  };
}

function stepWeek(prev: GameState, externalDemand: number): GameState {
  const s = cloneState(prev);

  // 1) mottak
  const received: Record<Role, number> = { Retailer:0, Wholesaler:0, Distributor:0, Factory:0 };
  for (const r of ROLES) {
    const role = s.roles[r];
    const recv = role.pipeline.length > 0 ? role.pipeline[0] : 0;
    received[r] = recv;
    role.pipeline = role.pipeline.slice(1);
    while (role.pipeline.length < role.leadTime - 1) role.pipeline.push(0);
    role.onHand += recv;
  }

  // 2) demand
  const demand: Record<Role, number> = {
    Retailer: externalDemand,
    Wholesaler: s.lastOrders.Retailer || 0,
    Distributor: s.lastOrders.Wholesaler || 0,
    Factory: s.lastOrders.Distributor || 0,
  };

  // 3) ship og oppdater lager/backlog
  const shipped: Record<Role, number> = { Retailer:0, Wholesaler:0, Distributor:0, Factory:0 };
  for (const r of ROLES) {
    const role = s.roles[r];
    const need = demand[r] + role.backlog;
    const ship = Math.max(0, Math.min(role.onHand, need));
    shipped[r] = ship;
    role.onHand -= ship;
    role.backlog = Math.max(0, need - ship);
  }

  // 4) ordre (BS)
  const orders: Record<Role, number> = { Retailer:0, Wholesaler:0, Distributor:0, Factory:0 };
  for (const r of ROLES) {
    const role = s.roles[r];
    const pipelineSum = role.pipeline.reduce((a, b) => a + b, 0);
    const invPos = role.onHand + pipelineSum - role.backlog;
    const order = Math.max(0, role.params.S - invPos);
    orders[r] = Math.round(order);
    role.pipeline.push(orders[r]); // ankommer etter LT
  }

  // 5) logg
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

  // 6) for neste uke
  s.lastOrders = { ...orders };
  s.week = s.week + 1;
  return s;
}

export default function Home() {
  const [customerDemandStr, setCustomerDemandStr] = useState("8");
  const customerDemand = useMemo(
    () => parseInt(customerDemandStr || "0", 10) || 0,
    [customerDemandStr]
  );

  const initialState: GameState = useMemo(() => {
  const D = customerDemand; // steady-state basert på input-feltet
  return {
    week: 1,
    roles: {
      Retailer:   { onHand: 2*D, backlog: 0, pipeline: [D, D],       leadTime: 2, policy: "BS", params: { S: 2*D } },
      Wholesaler: { onHand: 2*D, backlog: 0, pipeline: [D, D],       leadTime: 2, policy: "BS", params: { S: 2*D } },
      Distributor:{ onHand: 2*D, backlog: 0, pipeline: [D, D],       leadTime: 2, policy: "BS", params: { S: 2*D } },
      Factory:    { onHand: 3*D, backlog: 0, pipeline: [D, D, D],    leadTime: 3, policy: "BS", params: { S: 3*D } },
    },
    lastOrders: { Retailer: 0, Wholesaler: 0, Distributor: 0, Factory: 0 },
    history: [],
  };
}, [customerDemand]);

  const [state, setState] = useState<GameState>(initialState);
  const [undo, setUndo] = useState<GameState[]>([]);

  const handleNextWeek = () => {
    setUndo((u) => [...u, cloneState(state)]);
    setState((prev) => stepWeek(prev, customerDemand));
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

  const sumPipeline = (r: Role) =>
    state.roles[r].pipeline.reduce((a, b) => a + b, 0);

  return (
    <main style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Beer Game — 1 menneske + 3 roboter</h1>
      <div style={{ marginTop: 4, opacity: 0.8 }}>Uke {state.week}</div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <label htmlFor="cust">Kunde-etterspørsel (Retailer) denne uken</label>
        <input
          id="cust"
          type="number"
          value={customerDemandStr}
          onChange={(e) => setCustomerDemandStr(e.target.value)}
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