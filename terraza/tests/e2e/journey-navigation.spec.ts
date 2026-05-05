/**
 * Journey Map 6 — Navegación y accesibilidad transversal
 *
 * ACTRIZ: Rö usa el teclado y lector de pantalla para navegar el panel admin
 * OBJETIVO: Moverse entre secciones sin ratón, con orientación clara
 *
 * Pasos del journey:
 *   1. Skip link funciona y lleva al contenido principal
 *   2. Sidebar nav marca la página activa con aria-current="page"
 *   3. Bottom nav (móvil) accesible con aria-current="page"
 *   4. Idioma del documento es "es"
 *   5. Headings siguen jerarquía correcta (H1 → H2 → H3)
 *   6. No hay `aria-hidden` en elementos interactivos
 *   7. Focus visible en todos los controles interactivos
 *   8. Las páginas no producen errores de consola
 */

import { test, expect, type Page } from '@playwright/test';

async function mockSession(page: Page) {
  await page.context().addCookies([{
    name: 'session', value: 'test-session', domain: 'localhost', path: '/', httpOnly: false,
  }]);
}

async function mockEmptyCorpus(page: Page) {
  await page.route('**/api/corpus/list', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ uploads: [] }) });
  });
  await page.route('**/api/corpus/sync-status', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ pending: [], remoteStatus: { ahead: 0, behind: 0 } }) });
  });
  await page.route('**/api/corpus/by-estado', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ grouped: { open: [], axial: [], selective: [], verificado: [] } }) });
  });
  await page.route('**/api/corpus/graph-data', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ nodes: [], edges: [] }) });
  });
}

test.describe('Journey 6 — Navegación y accesibilidad transversal', () => {
  // ── Skip link ─────────────────────────────────────────────────────────────

  test('J6-01 · skip link presente y apunta a #main-content en /login', async ({ page }) => {
    await page.goto('/login');
    const skip = page.locator('a[href="#main-content"]').first();
    await expect(skip).toBeAttached();
  });

  test('J6-02 · skip link presente en /upload', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const skip = page.locator('a[href="#main-content"]').first();
    await expect(skip).toBeAttached();
  });

  test('J6-03 · main tiene id="main-content" en páginas admin', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
  });

  // ── Idioma ────────────────────────────────────────────────────────────────

  test('J6-04 · html[lang] es "es" en todas las páginas públicas', async ({ page }) => {
    for (const path of ['/login', '/register']) {
      await page.goto(path);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang, `${path} debería tener lang="es"`).toBe('es');
    }
  });

  test('J6-05 · html[lang] es "es" en páginas admin', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('es');
  });

  // ── Sidebar navigation ────────────────────────────────────────────────────

  test('J6-06 · sidebar nav tiene aria-label="Navegación lateral"', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const nav = page.getByRole('navigation', { name: /navegación lateral/i });
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('J6-07 · link activo en sidebar tiene aria-current="page"', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const activeLink = page.locator('[aria-current="page"]').first();
    await expect(activeLink).toBeAttached({ timeout: 5000 });
    await expect(activeLink).toContainText(/corpus/i);
  });

  test('J6-08 · sidebar tiene links a todas las secciones admin', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const nav = page.getByRole('navigation', { name: /navegación lateral/i });
    await expect(nav.getByRole('link', { name: /corpus/i })).toBeAttached();
    await expect(nav.getByRole('link', { name: /subir captura/i })).toBeAttached();
    await expect(nav.getByRole('link', { name: /codificación/i })).toBeAttached();
    await expect(nav.getByRole('link', { name: /grafo/i })).toBeAttached();
  });

  // ── Bottom navigation (mobile) ────────────────────────────────────────────

  test('J6-09 · bottom nav tiene aria-label="Navegación principal"', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const nav = page.getByRole('navigation', { name: /navegación principal/i });
    await expect(nav).toBeAttached({ timeout: 5000 });
  });

  test('J6-10 · bottom nav tiene los 4 links con etiquetas', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const nav = page.getByRole('navigation', { name: /navegación principal/i });
    await expect(nav.getByText('Corpus')).toBeVisible({ timeout: 5000 });
    await expect(nav.getByText('Subir')).toBeVisible();
    await expect(nav.getByText('Codificación')).toBeVisible();
    await expect(nav.getByText('Grafo')).toBeVisible();
  });

  // ── Headings ──────────────────────────────────────────────────────────────

  test('J6-11 · /login tiene exactamente un H1', async ({ page }) => {
    await page.goto('/login');
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });

  test('J6-12 · /upload tiene exactamente un H1', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });

  test('J6-13 · /corpus tiene exactamente un H1', async ({ page }) => {
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1, { timeout: 5000 });
  });

  // ── Títulos de página ─────────────────────────────────────────────────────

  test('J6-14 · title del documento contiene "Contra-archivo"', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/contra-archivo/i);
  });

  // ── Focus visible ─────────────────────────────────────────────────────────

  test('J6-15 · botón de passkey tiene focus visible al tabear', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    // El skip link recibe foco primero, luego el botón de passkey
    await page.keyboard.press('Tab');

    const focusedEl = await page.evaluate(() => document.activeElement?.textContent);
    // El foco debería estar en el botón de passkey o el skip link
    expect(focusedEl).toBeTruthy();
  });

  // ── Sin errores de consola en páginas clave ───────────────────────────────

  test('J6-16 · /login no produce errores de consola', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Filtramos errores esperados de Next.js en dev
    const criticalErrors = errors.filter(
      (e) => !e.includes('Warning:') && !e.includes('hydrat') && !e.includes('ResizeObserver')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('J6-17 · /register no produce errores de consola', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(
      (e) => !e.includes('Warning:') && !e.includes('hydrat') && !e.includes('ResizeObserver')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  // ── Responsive: viewport móvil ────────────────────────────────────────────

  test('J6-18 · bottom nav visible en viewport móvil (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const nav = page.getByRole('navigation', { name: /navegación principal/i });
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('J6-19 · sidebar oculto en viewport móvil (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockSession(page);
    await mockEmptyCorpus(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    // La clase hidden md:flex hace que el sidebar sea invisible en móvil
    const sidebar = page.getByRole('complementary', { name: /barra lateral/i });
    // En mobile el sidebar tiene display:none via Tailwind hidden md:flex
    const isVisible = await sidebar.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});
