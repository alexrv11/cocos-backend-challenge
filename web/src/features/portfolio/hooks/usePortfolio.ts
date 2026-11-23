import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/lib/api';

export interface Position {
  instrumentId: number;
  ticker: string;
  name: string;
  quantity: number;
  lastPrice: number;
  totalValue: number;
  returnPercentage: number;
}

export interface Portfolio {
  totalAccountValue: number;
  availableCash: number;
  positions: Position[];
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
