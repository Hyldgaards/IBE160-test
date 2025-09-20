"use client";
import { useState } from "react";

type Row = {
  uke: number;
  mottak: number;
  ettersp: number;
  lager: number;
  backlog: number;
  bestilling: number;
  iPipeline: number;
};

type Snapshot = {
  week: number;
  order: string;
  lager: number;
  backlog: number;
  rows: Row[];
  pipeline: number[];
};

export default function Home() {
  const LEADTIME = 2;

  const [week, setWeek] = useState(1);
  const [order, setOrder] = useState("0");
  const [lager, setLager] = useState(10);
  const [backlog, setBacklog] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [pipeline, setPipeline] = useState<number[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]); // for «Angre»

  const snapshot = (): Snapshot => ({ week, order, lager, backlog, rows, pipeline });

  const nextWeek = () => {
    const ettersp = parseInt(order || "0", 10);

    // 1) lagre øyeblikksbilde for «Angre»
    setHistory((h) => [...h, snapshot()]);

    // 2) mottak denne uken
    const mottak = pipeline.length > 0 ? pipeline[0] : 0;
    const pipelineEtterMottak = pipeline.slice(1);

    // 3) dekk etterspørsel + backlog
    const net = lager + mottak - (ettersp + backlog);
    const newBacklog = net >= 0 ? 0 : -net;
    const newLager = net >= 0 ? net : 0;

    // 4) legg dagens bestilling bakerst med ledetid
    const nyPipeline = [...pipelineEtterMottak];
    while (nyPipeline.length < LEADTIME - 1) nyPipeline.push(0);
    nyPipeline.push(ettersp); // v1: bestiller lik etterspørsel

    // 5) loggrad
    const row: Row = {
      uke: week,
      mottak,
      ettersp,
      lager: newLager,
      backlog: newBacklog,
      bestilling: ettersp,
      iPipeline: nyPipeline.reduce((a, b) => a + b, 0),
    };

    // 6) oppdater state
    setRows((r) => [...r, row]);
    setLager(newLager);
    setBacklog(newBacklog);
    setPipeline(nyPipeline);
    setWeek((w) => w + 1);
    setOrder("0");
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h; // ingenting å angre
      const prev = h[h.length - 1];
      setWeek(prev.week);
      setOrder(prev.order);
      setLager(prev.lager);
      setBacklog(prev.backlog);
      setRows(prev.rows);
      setPipeline(prev.pipeline);
      return h.slice(0, -1);
    });
  };

  const reset = () => {
    setWeek(1);
    setOrder("0");
    setLager(10);
    setBacklog(0);
    setRows([]);
    setPipeline([]);
    setHistory([]);
  };

  return (
    <main style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Beer Game v1 — Uke {week}</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <label htmlFor="order">Bestilling denne uken</label>
        <input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{ padding: 6, width: 100 }}
        />
        <button onClick={nextWeek} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
          Neste uke
        </button>
        <button onClick={undo} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
          Angre siste uke
        </button>
        <button onClick={reset} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
          Reset
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 14 }}>
        Lager: <b>{lager}</b>  |  Backlog: <b>{backlog}</b>  |  I pipeline: <b>{pipeline.reduce((a,b)=>a+b,0)}</b>
      </div>

      <table style={{ marginTop: 16, borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            {["Uke","Mottak","Etterspørsel","Lager","Backlog","Bestilling","I pipeline"].map((h) => (
              <th key={h} style={{ border: "1px solid #333", padding: "6px 10px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.uke}>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.uke}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.mottak}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.ettersp}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.lager}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.backlog}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.bestilling}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{row.iPipeline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}