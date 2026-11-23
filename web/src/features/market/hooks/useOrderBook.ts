import { useEffect, useState } from 'react';
import { orderBookService, type OrderBookSnapshot } from '../services/order-book';

export function useOrderBook(instrumentId: number | null, basePrice: number | null) {
  const [snapshot, setSnapshot] = useState<OrderBookSnapshot | null>(null);

  useEffect(() => {
    if (instrumentId === null || basePrice === null) return;
    return orderBookService.subscribe(instrumentId, basePrice, setSnapshot);
  }, [instrumentId, basePrice]);

  return snapshot;
}
