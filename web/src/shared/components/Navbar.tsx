import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuthStore } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Portfolio' },
  { to: '/instruments', label: 'Mercado' },
  { to: '/orders', label: 'Operar' },
];

export default function Navbar() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    location.pathname === item.to
                      ? 'bg-tab-bg text-text'
                      : 'text-text-secondary hover:text-text hover:bg-tab-bg/50'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-sm text-text-secondary">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
