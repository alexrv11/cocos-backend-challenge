type OrderBookLevel = {
  price: number;
  size: number;
};

export type OrderBookSnapshot = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
};

type Listener = (snapshot: OrderBookSnapshot) => void;

class OrderBookService {
  private listeners = new Map<number, Set<Listener>>();
  private intervals = new Map<number, ReturnType<typeof setInterval>>();

  private seededRandom(seed: number) {
    let s = seed;
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

    if (!this.intervals.has(instrumentId)) {
      const rand = this.seededRandom(instrumentId * 3571 + Date.now());
      let midPrice = basePrice;

      const tick = () => {
        midPrice += (rand() - 0.48) * midPrice * 0.001;
        const halfSpread = midPrice * (0.001 + rand() * 0.002);

        const bids: OrderBookLevel[] = [];
        const asks: OrderBookLevel[] = [];

        for (let i = 0; i < 5; i++) {
          const bidPrice = midPrice - halfSpread - i * midPrice * 0.001 * (1 + rand() * 0.5);
          const askPrice = midPrice + halfSpread + i * midPrice * 0.001 * (1 + rand() * 0.5);
          bids.push({
            price: +bidPrice.toFixed(2),
            size: Math.floor(50 + rand() * 500 * (1 + i * 0.3)),
          });
          asks.push({
            price: +askPrice.toFixed(2),
            size: Math.floor(50 + rand() * 500 * (1 + i * 0.3)),
          });
        }

        const bestBid = bids[0].price;
        const bestAsk = asks[0].price;
        const spread = +(bestAsk - bestBid).toFixed(2);
        const spreadPercent = +((spread / midPrice) * 100).toFixed(3);

        const snapshot: OrderBookSnapshot = { bids, asks, spread, spreadPercent };
        for (const cb of this.listeners.get(instrumentId) ?? []) {
          cb(snapshot);
        }
      };

      tick();
      this.intervals.set(instrumentId, setInterval(tick, 1000));
    }

    return () => {
      this.listeners.get(instrumentId)?.delete(listener);
      if (this.listeners.get(instrumentId)?.size === 0) {
        clearInterval(this.intervals.get(instrumentId));
        this.intervals.delete(instrumentId);
        this.listeners.delete(instrumentId);
      }
    };
  }
}

export const orderBookService = new OrderBookService();
