import { test, expect } from '@playwright/test';

/**
 * E2E smoke tests run against the full Docker Compose stack:
 *   docker compose -f api/docker-compose.yml up -d --build
 *
 * Seed user: user1@cocos.com / password123
 * Stack: web (localhost:5173) → api (localhost:3000) → postgres
 */

const SEED_USER = { email: 'user1@cocos.com', password: 'password123' };
const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// ── Helpers ──────────────────────────────────────────────────────────────

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('Email').fill(SEED_USER.email);
  await page.getByLabel('Contrasena').fill(SEED_USER.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.waitForURL('**/dashboard');
}

// ── API health check ─────────────────────────────────────────────────────

test.describe('API health', () => {
  test('API is reachable', async ({ request }) => {
    const res = await request.get(`${API_URL}/`);
    expect(res.ok()).toBe(true);
  });

  test('instrument search returns data', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/instruments/search?q=PAMP`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('ticker');
  });
});

// ── Auth flow ────────────────────────────────────────────────────────────

test.describe('Auth', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Ingresar' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Registrarse' })).toBeVisible();
  });

  test('login with seed user redirects to dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(SEED_USER.email)).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Contrasena').fill('wrongpass');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText(/Invalid credentials|Credenciales invalidas/)).toBeVisible({ timeout: 10000 });
  });
});

// ── Dashboard / Portfolio ────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows portfolio summary', async ({ page }) => {
    await expect(page.getByText('Valor total')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Disponible')).toBeVisible();
  });

  test('shows cash balance', async ({ page }) => {
    await expect(page.getByText('Disponible')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('$ 997.900,00')).toBeVisible();
  });
});

// ── Instruments / Market ─────────────────────────────────────────────────

test.describe('Instruments', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('instruments page loads and search shows tickers', async ({ page }) => {
    await page.getByRole('link', { name: 'Mercado' }).click();
    await page.waitForURL('**/instruments');
    await page.getByPlaceholder(/buscar|ticker/i).fill('PAMP');
    await expect(page.getByText('Pampa Energía S.A.')).toBeVisible({ timeout: 5000 });
  });

  test('search filters instruments', async ({ page }) => {
    await page.getByRole('link', { name: 'Mercado' }).click();
    await page.waitForURL('**/instruments');
    await page.getByPlaceholder(/buscar|ticker/i).fill('YPF');
    await expect(page.getByText('YPF S.A.')).toBeVisible({ timeout: 5000 });
  });
});

// ── Orders ───────────────────────────────────────────────────────────────

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('order page loads with form', async ({ page }) => {
    await page.getByRole('link', { name: 'Operar' }).click();
    await page.waitForURL('**/orders');
    await expect(page.getByText('Comprar').first()).toBeVisible({ timeout: 5000 });
  });
});

// ── Navigation ───────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('logout returns to login page', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Salir' }).click();
    await expect(page).toHaveURL('/');
  });
});
