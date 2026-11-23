import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/lib/api';

export interface Position {
  instrumentId: number;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface Portfolio {
  cashARS: number;
  positions: Position[];
  totalValueARS: number;
}

export function usePortfolio() {
  return useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await api.get('/portfolio');
      return res.data;
    },
  });
}
