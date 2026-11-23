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
      const params: Record<string, string | number> = { limit: 20 };
      if (query) params.q = query;
      const res = await api.get('/instruments/search', { params });
      return res.data;
    },
  });
}
