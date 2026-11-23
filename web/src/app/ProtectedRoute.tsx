import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../shared/hooks/useAuth';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}
