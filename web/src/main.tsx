import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import Providers from './app/providers';
import { useAuthStore } from './shared/hooks/useAuth';

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API !== 'false') {
    const { worker } = await import('./mocks/browser');
    await worker.start();
  }

  useAuthStore.getState().hydrate();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  );
}

bootstrap();
