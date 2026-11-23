import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/lib/api';
import { useAuthStore } from '../../../shared/hooks/useAuth';
import type { LoginFormData } from '../schemas/auth.schema';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.access_token, {
        id: data.userId,
        email: data.email,
        accountNumber: data.accountNumber,
      });
      navigate('/dashboard');
    },
  });
}
