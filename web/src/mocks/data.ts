export interface Instrument {
  id: number;
  ticker: string;
  name: string;
  type: string;
}

export interface MarketDataPoint {
  instrumentId: number;
  close: number;
  previousClose: number | null;
  high: number | null;
  low: number | null;
  open: number | null;
  date: string;
}

export const instruments: Instrument[] = [
  { id: 1, ticker: 'GGAL', name: 'Grupo Financiero Galicia', type: 'Acciones' },
  { id: 2, ticker: 'YPFD', name: 'YPF S.A.', type: 'Acciones' },
  { id: 3, ticker: 'PAMP', name: 'Pampa Energia', type: 'Acciones' },
  { id: 4, ticker: 'AL30', name: 'BONOS ARGENTINA USD 2030 L.A', type: 'Bonos' },
  { id: 5, ticker: 'GD30', name: 'BONOS GLOBALES ARGENTINA USD 2030', type: 'Bonos' },
  { id: 6, ticker: 'AAPL', name: 'Apple Inc. (CEDEAR)', type: 'CEDEAR' },
  { id: 7, ticker: 'MELI', name: 'MercadoLibre Inc. (CEDEAR)', type: 'CEDEAR' },
  { id: 8, ticker: 'BBAR', name: 'Banco BBVA Argentina', type: 'Acciones' },
  { id: 9, ticker: 'CRES', name: 'Cresud S.A.', type: 'Acciones' },
  { id: 10, ticker: 'TXAR', name: 'Ternium Argentina', type: 'Acciones' },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateCandles(instrumentId: number, days = 90) {
  const rand = seededRandom(instrumentId * 7919);
  const basePrices: Record<number, number> = {
    1: 6500, 2: 38000, 3: 3200, 4: 71000, 5: 68000,
    6: 12500, 7: 95000, 8: 4800, 9: 2100, 10: 9500,
  };
  let price = basePrices[instrumentId] ?? 5000;
  const candles = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const change = (rand() - 0.48) * price * 0.04;
    const open = price;
    price = Math.max(price + change, price * 0.5);
    const close = price;
    const high = Math.max(open, close) * (1 + rand() * 0.015);
    const low = Math.min(open, close) * (1 - rand() * 0.015);

    candles.push({
      time: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
  }
  return candles;
}

export function generateMarketData(): MarketDataPoint[] {
  return instruments.map((inst) => {
    const candles = generateCandles(inst.id, 2);
    const latest = candles[candles.length - 1];
    const prev = candles.length > 1 ? candles[candles.length - 2] : null;
    return {
      instrumentId: inst.id,
      close: latest.close,
      previousClose: prev?.close ?? null,
      high: latest.high,
      low: latest.low,
      open: latest.open,
      date: latest.time,
    };
  });
}
