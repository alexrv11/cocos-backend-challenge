import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/lib/api';
import { useAuthStore } from '../../../shared/hooks/useAuth';
import type { RegisterFormData } from '../schemas/auth.schema';

interface AuthResponse {
  accessToken: string;
  user: { id: number; email: string; accountNumber: string };
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const res = await api.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      navigate('/dashboard');
    },
  });
}
