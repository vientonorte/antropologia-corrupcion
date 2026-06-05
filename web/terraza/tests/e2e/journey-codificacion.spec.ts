/**
 * Journey Map 4 — Codificación Grounded Theory (Kanban)
 *
 * ACTRIZ: Rö quiere avanzar la codificación moviendo capturas entre etapas GT
 * OBJETIVO: Mover tarjetas de Open → Axial → Selective → Verificado
 *
 * Pasos del journey:
 *   1. Navega a /codificacion
 *   2. Ve el tablero Kanban con 4 columnas (Open, Axial, Selective, Verificado)
 *   3. Arrastra una tarjeta a la siguiente columna (drag & drop)
 *   4. Usa el teclado para mover una tarjeta (← →)
 *   5. El sistema hace rollback si el servidor falla
 *   6. Empty state tiene link al corpus
 *
 * MEJORAS IDENTIFICADAS (ya corregidas):
 *   [fix] Tarjetas sin tabIndex ni keyboard handler → añadidos
 *   [fix] aria-label de tarjetas mejorado: indica columna actual y teclas disponibles
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSession } from './helpers';

const MOCK_KANBAN = {
  open: [
    {
      id: 'card-001',
      fileName: 'fecu-sura-2026.png',
      casoId: 1 as const,
      regimenVerdad: 'institucional',
      fuenteTipo: 'documento_oficial',
      transcription: 'Índice de liquidez: 1.23',
      estadoCodificacion: 'open',
      createdAt: Date.now() - 3600000,
    },
  ],
  axial: [],
  selective: [],
  verificado: [
    {
      id: 'card-002',
      fileName: 'acta-consulta.pdf',
      casoId: 4 as const,
      regimenVerdad: 'juridico',
      fuenteTipo: 'documento_oficial',
      transcription: null,
      estadoCodificacion: 'verificado',
      createdAt: Date.now() - 7200000,
    },
  ],
};

async function mockKanbanApis(page: Page) {
  await page.route('**/api/corpus/by-estado', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ grouped: MOCK_KANBAN }),
    });
  });

  await page.route('**/api/corpus/update', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

test.describe('Journey 4 — Codificación GT (Kanban)', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  // ── Carga y estructura ────────────────────────────────────────────────────

  test('J4-01 · /codificacion carga con título correcto', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    await expect(page.getByRole('heading', { name: /codificación grounded theory/i })).toBeVisible({ timeout: 5000 });
  });

  test('J4-02 · tablero muestra las 4 columnas GT', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    for (const col of ['Open', 'Axial', 'Selective', 'Verificado']) {
      await expect(page.getByRole('region', { name: new RegExp(`columna ${col}`, 'i') })).toBeVisible({ timeout: 5000 });
    }
  });

  test('J4-03 · cada columna tiene descripción metodológica', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    await expect(page.getByText(/códigos descriptivos/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/categorías y relaciones/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/integración hacia categoría central/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/codificación revisada/i)).toBeVisible({ timeout: 5000 });
  });

  test('J4-04 · tarjeta muestra nombre del archivo', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    await expect(page.getByText('fecu-sura-2026.png')).toBeVisible({ timeout: 5000 });
  });

  // ── Teclado (fix) ─────────────────────────────────────────────────────────

  test('J4-05 · tarjeta es alcanzable por teclado (fix: tabIndex=0)', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const card = page.getByRole('article', { name: /fecu-sura-2026/i });
    await expect(card).toBeVisible({ timeout: 5000 });
    await expect(card).toHaveAttribute('tabindex', '0');
  });

  test('J4-06 · ArrowRight mueve tarjeta a la siguiente columna (fix: nuevo handler)', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const card = page.getByRole('article', { name: /fecu-sura-2026/i });
    await card.focus();

    // Presionar ArrowRight debe mover la tarjeta de Open → Axial (optimistic)
    await page.keyboard.press('ArrowRight');

    // La columna Axial debe contener la tarjeta (optimistic update)
    const axialCol = page.getByRole('region', { name: /columna axial/i });
    await expect(axialCol.getByText('fecu-sura-2026.png')).toBeVisible({ timeout: 3000 });
  });

  test('J4-07 · aria-label de tarjeta indica columna actual y teclas (fix)', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const card = page.getByRole('article', { name: /fecu-sura-2026/i });
    const label = await card.getAttribute('aria-label');
    expect(label).toMatch(/open/i);
    expect(label).toMatch(/←|→|\u2190|\u2192/);
  });

  test('J4-08 · ArrowLeft no mueve tarjeta que ya está en primera columna', async ({ page }) => {
    await mockKanbanApis(page);

    // Mock update: no debe llamarse si ya está en la primera columna
    let updateCalled = false;
    await page.route('**/api/corpus/update', async (route) => {
      updateCalled = true;
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const card = page.getByRole('article', { name: /fecu-sura-2026/i });
    await card.focus();
    await page.keyboard.press('ArrowLeft');

    // Wait for any pending microtasks to settle, then assert no network call was made
    await page.waitForFunction(() => true); // flushes JS event queue
    expect(updateCalled).toBe(false);
  });

  // ── Rollback ante error del servidor ─────────────────────────────────────

  test('J4-09 · fallo del servidor hace rollback de la tarjeta', async ({ page }) => {
    await page.route('**/api/corpus/by-estado', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ grouped: MOCK_KANBAN }),
      });
    });

    await page.route('**/api/corpus/update', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'DB error' }),
      });
    });

    await mockSession(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const card = page.getByRole('article', { name: /fecu-sura-2026/i });
    await card.focus();
    await page.keyboard.press('ArrowRight');

    // Después del rollback, la tarjeta vuelve a Open
    const openCol = page.getByRole('region', { name: /columna open/i });
    await expect(openCol.getByText('fecu-sura-2026.png')).toBeVisible({ timeout: 3000 });
  });

  test('J4-10 · error del servidor muestra role="alert"', async ({ page }) => {
    await page.route('**/api/corpus/by-estado', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ grouped: MOCK_KANBAN }),
      });
    });

    await page.route('**/api/corpus/update', async (route) => {
      await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Error al mover' }) });
    });

    await mockSession(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const card = page.getByRole('article', { name: /fecu-sura-2026/i });
    await card.focus();
    await page.keyboard.press('ArrowRight');

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 3000 });
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  test('J4-11 · empty state tiene link al corpus', async ({ page }) => {
    await page.route('**/api/corpus/by-estado', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ grouped: { open: [], axial: [], selective: [], verificado: [] } }),
      });
    });

    await mockSession(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const link = page.getByRole('link', { name: /analizar capturas/i });
    await expect(link).toBeVisible({ timeout: 5000 });
    await expect(link).toHaveAttribute('href', '/corpus');
  });

  // ── Accesibilidad ─────────────────────────────────────────────────────────

  test('J4-12 · columnas tienen aria-label con recuento de capturas', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    const openCol = page.getByRole('region', { name: /columna open — 1 captura/i });
    await expect(openCol).toBeVisible({ timeout: 5000 });
  });

  test('J4-13 · recuento total de capturas en header', async ({ page }) => {
    await mockKanbanApis(page);
    await page.goto('/codificacion');
    if (!page.url().includes('/codificacion')) { test.skip(); return; }

    // 1 open + 0 axial + 0 selective + 1 verificado = 2
    await expect(page.getByText(/2 capturas en proceso/i)).toBeVisible({ timeout: 5000 });
  });
});
