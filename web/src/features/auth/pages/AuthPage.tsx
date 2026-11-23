import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Logo from '../../../shared/components/Logo';
import AuthTabs from '../components/AuthTabs';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import HeroPanel from '../components/HeroPanel';
import { useAuthStore } from '../../../shared/hooks/useAuth';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const token = useAuthStore((s) => s.token);

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-wrap font-sans text-text bg-white">
      <section className="flex-1 basis-[520px] min-w-0 flex flex-col p-8 md:px-12 gap-8 box-border">
        <header className="flex items-center justify-between">
          <Logo />
          <span className="text-sm text-text-secondary">
            Necesitas ayuda?{' '}
            <a href="#" className="text-primary">
              Centro de ayuda
            </a>
          </span>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[420px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {mode === 'login' ? (
                <>
                  <h1 className="m-0 text-4xl leading-tight font-bold tracking-tight">
                    Bienvenido de nuevo
                  </h1>
                  <p className="m-0 text-base text-text-secondary">
                    Ingresa para operar acciones, bonos y CEDEARs.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="m-0 text-4xl leading-tight font-bold tracking-tight">
                    Crea tu cuenta
                  </h1>
                  <p className="m-0 text-base text-text-secondary">
                    Abri tu cuenta comitente en minutos, 100% online.
                  </p>
                </>
              )}
            </div>

            <AuthTabs mode={mode} onChange={setMode} />

            {mode === 'login' ? (
              <LoginForm onSwitch={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitch={() => setMode('login')} />
            )}
          </div>
        </div>

        <footer className="flex gap-4 flex-wrap text-[13px] text-text-secondary">
          <span>&copy; 2026 Cocos Challenge</span>
          <a href="#" className="text-text-secondary">
            Terminos
          </a>
          <a href="#" className="text-text-secondary">
            Privacidad
          </a>
          <span>Agente de CNV</span>
        </footer>
      </section>

      <HeroPanel />
    </div>
  );
}
