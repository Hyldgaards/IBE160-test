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

export default function Home() {
  const [week, setWeek] = useState(1);
  const [order, setOrder] = useState("0");     // bestilling denne uken (input)
  const [lager, setLager] = useState(10);      // gjeldende lager
  const [backlog, setBacklog] = useState(0);   // gjeldende etterslep
  const [rows, setRows] = useState<Row[]>([]);
  const [pipeline, setPipeline] = useState<number[]>([]); // ledetid-kø

  const LEADTIME = 2; // uker

  const nextWeek = () => {
    const ettersp = parseInt(order || "0", 10);

    // 1) Mottak denne uken = det som ligger først i pipeline
    const mottak = pipeline.length > 0 ? pipeline[0] : 0;
    const pipelineEtterMottak = pipeline.slice(1);

    // 2) Dekk etterspørsel + backlog fra lager + mottak
    const net = lager + mottak - (ettersp + backlog);
    const newBacklog = net >= 0 ? 0 : -net;
    const newLager = net >= 0 ? net : 0;

    // 3) Dagens bestilling legges inn bakerst med ledetid (2 plasser frem)
    //    Vi “buffer” nuller slik at bestillingen havner på indeks = LEADTIME - 1
    const nyPipeline = [...pipelineEtterMottak];
    while (nyPipeline.length < LEADTIME - 1) nyPipeline.push(0);
    nyPipeline.push(ettersp); // v1: bestill = etterspørsel

    // 4) Loggrad
    const row: Row = {
      uke: week,
      mottak,
      ettersp,
      lager: newLager,
      backlog: newBacklog,
      bestilling: ettersp,
      iPipeline: nyPipeline.reduce((a, b) => a + b, 0),
    };

    // 5) Oppdater state
    setRows((r) => [...r, row]);
    setLager(newLager);
    setBacklog(newBacklog);
    setPipeline(nyPipeline);
    setWeek((w) => w + 1);
    setOrder("0");
  };

  return (
    <main style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Beer Game v1 — Uke {week}</h1>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="order" style={{ marginRight: 8 }}>Bestilling denne uken</label>
        <input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{ padding: 6, width: 100 }}
        />
        <button
          onClick={nextWeek}
          style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
        >
          Neste uke
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 14 }}>
        Lager: <b>{lager}</b>  |  Backlog: <b>{backlog}</b>  |  I pipeline: <b>{pipeline.reduce((a,b)=>a+b,0)}</b>
      </div>

      <table style={{ marginTop: 16, borderCollapse: "collapse", minWidth: 700 }}>
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