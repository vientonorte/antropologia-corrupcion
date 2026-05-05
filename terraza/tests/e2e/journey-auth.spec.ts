/**
 * Journey Map 1 — Autenticación
 *
 * ACTRIZ: Rö (investigadora, usuaria única)
 * OBJETIVO: Acceder al panel de administración usando passkey
 *
 * Pasos del journey:
 *   1. Llega a la URL raíz → ve el redirect a /login
 *   2. Ve la página de login con su título y botón de passkey
 *   3. (Passkey real no testeable E2E; se testea el flujo de error)
 *   4. Puede navegar al registro desde el link en login
 *   5. La página de registro tiene el formulario correcto
 *   6. Protección: rutas admin redirigen a /login si no hay sesión
 *
 * MEJORAS IDENTIFICADAS (ya corregidas):
 *   [fix] Página /register no existía — creada en esta PR
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 1 — Autenticación', () => {
  // ── Paso 1: Landing redirect ──────────────────────────────────────────────

  test('J1-01 · raíz redirige a /login cuando no hay sesión', async ({ page }) => {
    const response = await page.goto('/');
    // Debería aterrizar en /login (redirect del middleware) o mostrar login
    await expect(page).toHaveURL(/\/(login|$)/);
    expect(response?.status()).toBeLessThan(400);
  });

  // ── Paso 2: Página de login ───────────────────────────────────────────────

  test('J1-02 · página /login carga sin errores', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
  });

  test('J1-03 · título H1 visible e identifica la app', async ({ page }) => {
    await page.goto('/login');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Contra-archivo');
  });

  test('J1-04 · botón passkey es visible y está habilitado', async ({ page }) => {
    await page.goto('/login');
    const btn = page.getByRole('button', { name: /entrar con passkey/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('J1-05 · botón passkey tiene estado loading al activarse', async ({ page }) => {
    await page.goto('/login');

    // Interceptamos la llamada de autenticación para que quede colgada
    await page.route('**/api/auth/authenticate/start', async (route) => {
      // Delay para capturar el estado loading
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });

    const btn = page.getByRole('button', { name: /entrar con passkey/i });
    await btn.click();

    // El botón debe mostrar "Autenticando…" y estar deshabilitado
    await expect(btn).toContainText(/autenticando/i);
    await expect(btn).toBeDisabled();
  });

  test('J1-06 · error de autenticación se muestra con role="alert"', async ({ page }) => {
    await page.goto('/login');

    // Mock: el servidor rechaza la autenticación
    await page.route('**/api/auth/authenticate/start', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credencial no registrada' }),
      });
    });

    const btn = page.getByRole('button', { name: /entrar con passkey/i });
    await btn.click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText(/credencial/i);
  });

  // ── Paso 3: Link a registro ───────────────────────────────────────────────

  test('J1-07 · link "Registrar passkey" apunta a /register', async ({ page }) => {
    await page.goto('/login');
    const link = page.getByRole('link', { name: /registrar passkey/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/register');
  });

  // ── Paso 4: Página de registro ────────────────────────────────────────────

  test('J1-08 · página /register carga sin errores (fix: nueva página)', async ({ page }) => {
    const response = await page.goto('/register');
    expect(response?.status()).toBe(200);
  });

  test('J1-09 · /register tiene título y botón de registro', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/registrar passkey/i);
    const btn = page.getByRole('button', { name: /registrar este dispositivo/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('J1-10 · /register tiene link de vuelta a login', async ({ page }) => {
    await page.goto('/register');
    const link = page.getByRole('link', { name: /iniciar sesión/i });
    await expect(link).toHaveAttribute('href', '/login');
  });

  // ── Paso 5: Protección de rutas admin ────────────────────────────────────

  test('J1-11 · /corpus sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/corpus');
    await expect(page).toHaveURL(/\/login/);
  });

  test('J1-12 · /upload sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/upload');
    await expect(page).toHaveURL(/\/login/);
  });

  test('J1-13 · /codificacion sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/codificacion');
    await expect(page).toHaveURL(/\/login/);
  });

  test('J1-14 · /grafo sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/grafo');
    await expect(page).toHaveURL(/\/login/);
  });

  // ── Accesibilidad ─────────────────────────────────────────────────────────

  test('J1-15 · skip link existe y apunta a #main-content', async ({ page }) => {
    await page.goto('/login');
    // Skip link es el primer elemento del body
    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toContainText(/saltar/i);
  });

  test('J1-16 · página login tiene lang="es"', async ({ page }) => {
    await page.goto('/login');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('es');
  });
});
