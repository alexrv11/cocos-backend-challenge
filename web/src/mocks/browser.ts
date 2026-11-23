import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { instrumentHandlers } from './handlers/instruments';
import { portfolioHandlers } from './handlers/portfolio';
import { orderHandlers } from './handlers/orders';

export const worker = setupWorker(
  ...authHandlers,
  ...instrumentHandlers,
  ...portfolioHandlers,
  ...orderHandlers,
);
