type AuthMode = 'login' | 'register';

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

export default function AuthTabs({ mode, onChange }: AuthTabsProps) {
  const base =
    'h-11 border-0 rounded-full text-[15px] font-semibold cursor-pointer transition-all';
  const active = `${base} bg-white text-text shadow-sm`;
  const inactive = `${base} bg-transparent text-text-secondary`;

  return (
    <div
      role="tablist"
      aria-label="Modo de acceso"
      className="grid grid-cols-2 gap-1 p-1 bg-tab-bg rounded-full"
    >
      <button
        role="tab"
        aria-selected={mode === 'login'}
        onClick={() => onChange('login')}
        className={mode === 'login' ? active : inactive}
      >
        Ingresar
      </button>
      <button
        role="tab"
        aria-selected={mode === 'register'}
        onClick={() => onChange('register')}
        className={mode === 'register' ? active : inactive}
      >
        Registrarse
      </button>
    </div>
  );
}
