import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/lib/api';

export interface InstrumentWithMarket {
  id: number;
  ticker: string;
  name: string;
  type: string;
  lastPrice: number | null;
  previousClose: number | null;
  dailyReturn: number | null;
}

interface SearchResponse {
  data: InstrumentWithMarket[];
  total: number;
}

export function useInstruments(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ['instruments', query],
    queryFn: async () => {
      const res = await api.get('/instruments/search', {
        params: { q: query, limit: 20 },
      });
      return res.data;
    },
  });
}
