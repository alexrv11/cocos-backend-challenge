import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/lib/api';

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useCandles(instrumentId: number | null) {
  return useQuery<CandleData[]>({
    queryKey: ['candles', instrumentId],
    queryFn: async () => {
      const res = await api.get(`/instruments/${instrumentId}/candles`);
      return res.data;
    },
    enabled: instrumentId !== null,
  });
}
