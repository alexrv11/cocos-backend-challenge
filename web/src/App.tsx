import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './features/auth/pages/AuthPage';
import Layout from './shared/components/Layout';
import ProtectedRoute from './app/ProtectedRoute';
import DashboardPage from './features/portfolio/pages/DashboardPage';
import InstrumentsPage from './features/market/pages/InstrumentsPage';
import OrderPage from './features/orders/pages/OrderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/instruments" element={<InstrumentsPage />} />
          <Route path="/orders" element={<OrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
