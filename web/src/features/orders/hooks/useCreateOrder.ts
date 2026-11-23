import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/lib/api';
import type { OrderFormData } from '../schemas/order.schema';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderFormData) => {
      const res = await api.post('/orders', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
