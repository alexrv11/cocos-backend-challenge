type PriceTick = {
  instrumentId: number;
  price: number;
  change: number;
  timestamp: number;
};

type Listener = (tick: PriceTick) => void;

class MarketStreamService {
  private listeners = new Map<number, Set<Listener>>();
  private prices = new Map<number, number>();
  private intervals = new Map<number, ReturnType<typeof setInterval>>();

  private seededRandom(seed: number) {
    let s = seed + Date.now();
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  subscribe(instrumentId: number, basePrice: number, listener: Listener) {
    if (!this.listeners.has(instrumentId)) {
      this.listeners.set(instrumentId, new Set());
    }
    this.listeners.get(instrumentId)!.add(listener);

    if (!this.prices.has(instrumentId)) {
      this.prices.set(instrumentId, basePrice);
    }

    if (!this.intervals.has(instrumentId)) {
      const rand = this.seededRandom(instrumentId);
      const interval = setInterval(() => {
        const current = this.prices.get(instrumentId)!;
        const change = (rand() - 0.48) * current * 0.003;
        const next = +(current + change).toFixed(2);
        this.prices.set(instrumentId, next);

        const tick: PriceTick = {
          instrumentId,
          price: next,
          change: ((next - basePrice) / basePrice) * 100,
          timestamp: Date.now(),
        };

        for (const cb of this.listeners.get(instrumentId) ?? []) {
          cb(tick);
        }
      }, 1000);

      this.intervals.set(instrumentId, interval);
    }

    return () => {
      this.listeners.get(instrumentId)?.delete(listener);
      if (this.listeners.get(instrumentId)?.size === 0) {
        clearInterval(this.intervals.get(instrumentId));
        this.intervals.delete(instrumentId);
        this.listeners.delete(instrumentId);
        this.prices.delete(instrumentId);
      }
    };
  }
}

export const marketStream = new MarketStreamService();
