import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/lib/api';

interface InstrumentMarketData {
  close: number;
  previousClose: number | null;
}

export interface InstrumentWithMarket {
  id: number;
  ticker: string;
  name: string;
  type: string;
  marketData: InstrumentMarketData | null;
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
