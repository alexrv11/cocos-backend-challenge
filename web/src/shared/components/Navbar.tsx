import { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
            className="hidden md:block text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Salir
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-text-secondary"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border px-6 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${
                  location.pathname === item.to
                    ? 'bg-tab-bg text-text'
                    : 'text-text-secondary hover:text-text hover:bg-tab-bg/50'
                }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="px-4 py-3 text-left rounded-lg text-sm font-medium text-text-secondary hover:text-text hover:bg-tab-bg/50 transition-colors"
          >
            Salir
          </button>
        </nav>
      )}
    </header>
  );
}
