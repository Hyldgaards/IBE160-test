"use client";

import { useState } from "react";
import { initState, step, type State } from "@/lib/game";

export default function Home() {
  const [state, setState] = useState<State>(initState());
  const [orderInput, setOrderInput] = useState("0");

  const nextWeek = () => {
    const order = Math.max(0, parseInt(orderInput || "0", 10));
    setState(prev => step(prev, order));
    setOrderInput("0");
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Beer Game v1 — Uke {state.week}</h1>

      <div className="flex items-end gap-2">
        <label className="block">
          <span className="text-sm">Bestilling denne uken</span>
          <input
            className="border rounded px-2 py-1 w-32"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            inputMode="numeric"
          />
        </label>
        <button
          onClick={nextWeek}
          className="px-3 py-2 rounded bg-black text-white"
        >
          Neste uke
        </button>
      </div>

      <div className="text-sm">
        Lager: <strong>{state.inv}</strong> &nbsp;|&nbsp; Backlog: <strong>{state.backlog}</strong> &nbsp;|&nbsp; I pipeline: <strong>{state.pipeline}</strong>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Uke</th>
            <th className="text-left p-2">Mottak</th>
            <th className="text-left p-2">Etterspørsel</th>
            <th className="text-left p-2">Lager</th>
            <th className="text-left p-2">Backlog</th>
            <th className="text-left p-2">Bestilling</th>
          </tr>
        </thead>
        <tbody>
          {state.history.map((r) => (
            <tr key={r.week} className="border-b">
              <td className="p-2">{r.week}</td>
              <td className="p-2">{r.recv}</td>
              <td className="p-2">{r.demand}</td>
              <td className="p-2">{r.inv}</td>
              <td className="p-2">{r.backlog}</td>
              <td className="p-2">{r.order}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
