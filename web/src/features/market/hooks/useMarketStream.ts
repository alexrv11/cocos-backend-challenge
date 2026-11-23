import { useEffect, useState } from 'react';
import { marketStream } from '../services/market-stream';

interface PriceState {
  price: number;
  change: number;
}

export function useMarketStream(
  instrumentId: number | null,
  basePrice: number | null,
) {
  const [state, setState] = useState<PriceState | null>(null);

  useEffect(() => {
    if (instrumentId === null || basePrice === null) return;

    setState({ price: basePrice, change: 0 });

    return marketStream.subscribe(instrumentId, basePrice, (tick) => {
      setState({ price: tick.price, change: tick.change });
    });
  }, [instrumentId, basePrice]);

  return state;
}
