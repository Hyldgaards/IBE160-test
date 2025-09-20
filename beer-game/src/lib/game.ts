export type Row = {
  week: number;
  recv: number;
  demand: number;
  inv: number;
  backlog: number;
  order: number;
};

export type State = {
  week: number;
  inv: number;
  backlog: number;
  pipeline: number; // lead time = 1 uke
  history: Row[];
};

export const initState = (): State => ({
  week: 1,
  inv: 10,
  backlog: 0,
  pipeline: 0,
  history: [],
});

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function step(prev: State, order: number): State {
  const recv = prev.pipeline; // varer som ankommer denne uken
  let inv = prev.inv + recv;

  const demand = randInt(4, 8); // enkel etterspørsel v1
  const need = demand + prev.backlog;

  const shipped = Math.min(inv, need);
  inv -= shipped;
  const backlog = need - shipped;

  const row: Row = { week: prev.week, recv, demand, inv, backlog, order };

  return {
    week: prev.week + 1,
    inv,
    backlog,
    pipeline: Math.max(0, Math.trunc(order)), // kommer neste uke
    history: [...prev.history, row],
  };
}