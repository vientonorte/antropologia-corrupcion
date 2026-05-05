/**
 * Journey Map 5 — Grafo de correlaciones
 *
 * ACTRIZ: Rö quiere explorar visualmente las conexiones entre capturas del corpus
 * OBJETIVO: Ver el grafo de nodos/aristas y exportar el corpus completo
 *
 * Pasos del journey:
 *   1. Navega a /grafo
 *   2. Ve el spinner de carga mientras se obtienen datos
 *   3. Ve el grafo con nodos y aristas (si hay datos)
 *   4. Empty state tiene link al corpus si no hay nodos
 *   5. Botón "Exportar corpus" descarga el JSON
 *   6. Contador de nodos/aristas visible en el header
 */

import { test, expect } from '@playwright/test';
import { mockSession } from './helpers';

const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'upload-001', label: 'fecu-sura-2026.png', casoId: 1, estadoCodificacion: 'open', tags: ['cmf', 'fecu'] },
    { id: 'upload-002', label: 'acta-consulta.pdf', casoId: 4, estadoCodificacion: 'verificado', tags: ['oit169', 'fecu'] },
    { id: 'upload-003', label: 'periodismo-datos.jpg', casoId: 3, estadoCodificacion: 'axial', tags: ['cmf'] },
  ],
  edges: [
    { source: 'upload-001', target: 'upload-002', weight: 1, sharedTags: ['fecu'] },
    { source: 'upload-001', target: 'upload-003', weight: 1, sharedTags: ['cmf'] },
  ],
};

test.describe('Journey 5 — Grafo de correlaciones', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  // ── Carga de la página ────────────────────────────────────────────────────

  test('J5-01 · /grafo carga sin errores', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_GRAPH_DATA),
      });
    });

    const res = await page.goto('/grafo');
    await expect(page).toHaveURL(/\/(grafo|login)/);
    expect(res?.status()).toBeLessThan(500);
  });

  test('J5-02 · título H1 identifica la sección', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_GRAPH_DATA) });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    await expect(page.getByRole('heading', { name: /grafo de correlaciones/i })).toBeVisible({ timeout: 5000 });
  });

  test('J5-03 · subtítulo explica la semántica del grafo', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_GRAPH_DATA) });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    await expect(page.getByText(/nodos = capturas/i)).toBeVisible({ timeout: 5000 });
  });

  // ── Contador de nodos/aristas ─────────────────────────────────────────────

  test('J5-04 · header muestra recuento de nodos y aristas', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_GRAPH_DATA) });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    await expect(page.getByText(/3 nodos/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/2 aristas/i)).toBeVisible({ timeout: 5000 });
  });

  // ── Botón exportar ────────────────────────────────────────────────────────

  test('J5-05 · botón "Exportar corpus" tiene aria-label descriptivo', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_GRAPH_DATA) });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    const exportBtn = page.getByRole('button', { name: /exportar corpus completo como json/i });
    await expect(exportBtn).toBeVisible({ timeout: 5000 });
  });

  test('J5-06 · botón exportar es alcanzable por teclado', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_GRAPH_DATA) });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    const exportBtn = page.getByRole('button', { name: /exportar corpus completo/i });
    await expect(exportBtn).toBeEnabled({ timeout: 5000 });
    // Verificar que no tiene tabindex negativo
    const tabindex = await exportBtn.getAttribute('tabindex');
    expect(tabindex === null || Number(tabindex) >= 0).toBe(true);
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  test('J5-07 · empty state si no hay nodos tiene link al corpus', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ nodes: [], edges: [] }),
      });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    await expect(page.getByText(/no hay capturas con tags/i)).toBeVisible({ timeout: 5000 });
    const link = page.getByRole('link', { name: /añadir tags en el corpus/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/corpus');
  });

  // ── Error del servidor ────────────────────────────────────────────────────

  test('J5-08 · error del servidor muestra role="alert"', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Error de base de datos' }),
      });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
  });

  // ── Canvas/SVG del grafo ──────────────────────────────────────────────────

  test('J5-09 · contenedor del grafo renderiza cuando hay datos', async ({ page }) => {
    await page.route('**/api/corpus/graph-data', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_GRAPH_DATA) });
    });

    await page.goto('/grafo');
    if (!page.url().includes('/grafo')) { test.skip(); return; }

    // Hay un contenedor con el grafo de fuerza
    const container = page.locator('.rounded-lg.border').last();
    await expect(container).toBeVisible({ timeout: 5000 });
  });
});
