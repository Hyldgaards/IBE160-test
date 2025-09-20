"use client";
import { useState } from "react";

export default function Home() {
  const [week, setWeek] = useState(1);
  return (
    <main style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Beer Game v1 — Uke {week}</h1>

      <div style={{ marginTop: 12 }}>
        <label style={{ marginRight: 8 }}>Bestilling denne uken</label>
        <input type="number" defaultValue={0} style={{ padding: 6, width: 80 }} />
        <button
          onClick={() => setWeek((w) => w + 1)}
          style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
        >
          Neste uke
        </button>
      </div>
    </main>
  );
}
