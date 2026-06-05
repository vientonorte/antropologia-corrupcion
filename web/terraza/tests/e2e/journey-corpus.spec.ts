/**
 * Journey Map 3 — Corpus browser
 *
 * ACTRIZ: Rö quiere revisar las capturas subidas, ver su análisis y commitear una
 * OBJETIVO: Seleccionar una captura, leer su transcripción, cambiar estado y commitear
 *
 * Pasos del journey:
 *   1. Navega a /corpus → ve la lista de capturas (o empty state)
 *   2. Empty state tiene link útil a /upload
 *   3. Hace clic en una CaptureCard → panel de análisis aparece a la derecha
 *   4. Usa las tabs del AnalysisPanel (← →) para navegar secciones
 *   5. Edita la transcripción → guarda → ve confirmación
 *   6. Cambia el estado de codificación → guarda
 *   7. Hace clic en "Commitear al repo" → cola de commits se expande
 *   8. Cola de commits muestra el estado del commit
 *
 * MEJORAS IDENTIFICADAS (ya corregidas):
 *   [fix] CaptureCard tenía aria-selected en article → cambiado a aria-pressed en role="button"
 */

import { test, expect, type Page } from '@playwright/test';
import { mockSession } from './helpers';

const MOCK_UPLOADS = [
  {
    id: 'upload-001',
    fileName: 'fecu-sura-2026.png',
    fileType: 'image/png',
    fileSize: 1024 * 512,
    casoId: 1,
    fuenteTipo: 'documento_oficial',
    regimenVerdad: 'institucional',
    estadoCodificacion: 'pendiente',
    fechaEvento: '2026-03-31',
    tags: JSON.stringify(['cmf', 'fecu', 'sura']),
    transcription: null,
    analysis: null,
    codes: null,
    mistranslations: null,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'upload-002',
    fileName: 'acta-consulta-2025.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 200,
    casoId: 4,
    fuenteTipo: 'documento_oficial',
    regimenVerdad: 'juridico',
    estadoCodificacion: 'open',
    fechaEvento: '2025-11-15',
    tags: JSON.stringify(['oit169', 'consulta']),
    transcription: 'Acta de consulta previa realizada en comunidad La Negra.',
    analysis: null,
    codes: null,
    mistranslations: null,
    createdAt: Date.now() - 7200000,
  },
];

async function mockCorpusApis(page: Page, uploads = MOCK_UPLOADS) {
  await page.route('**/api/corpus/list', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ uploads }),
    });
  });

  await page.route('**/api/corpus/sync-status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ pending: [], remoteStatus: { ahead: 0, behind: 0 } }),
    });
  });
}

test.describe('Journey 3 — Corpus browser', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  test('J3-01 · empty state tiene link a /upload', async ({ page }) => {
    await mockCorpusApis(page, []);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const link = page.getByRole('link', { name: /subir captura/i });
    await expect(link).toBeVisible({ timeout: 5000 });
    await expect(link).toHaveAttribute('href', '/upload');
  });

  test('J3-02 · empty state muestra mensaje descriptivo', async ({ page }) => {
    await mockCorpusApis(page, []);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await expect(page.getByText(/aún no hay capturas/i)).toBeVisible({ timeout: 5000 });
  });

  // ── Lista con capturas ────────────────────────────────────────────────────

  test('J3-03 · muestra el recuento de capturas en el header', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await expect(page.getByText('2 capturas')).toBeVisible({ timeout: 5000 });
  });

  test('J3-04 · cada captura renderiza nombre de archivo', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await expect(page.getByText('fecu-sura-2026.png')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('acta-consulta-2025.pdf')).toBeVisible({ timeout: 5000 });
  });

  test('J3-05 · badge de estado de codificación es visible', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await expect(page.getByText('Pendiente').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Open').first()).toBeVisible({ timeout: 5000 });
  });

  // ── Selección de captura (fix: aria-pressed) ──────────────────────────────

  test('J3-06 · captura seleccionable vía teclado (fix: tabIndex + role="button")', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    // Las CaptureCards deben tener role="button" y ser alcanzables por teclado
    const cards = page.getByRole('button', { name: /fecu-sura-2026/i });
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    await expect(cards.first()).toHaveAttribute('tabindex', '0');
  });

  test('J3-07 · seleccionar captura muestra panel de análisis', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const card = page.getByRole('button', { name: /fecu-sura-2026/i }).first();
    await card.click();

    // El panel de análisis debe mostrar el nombre del archivo
    await expect(page.getByText('fecu-sura-2026.png').last()).toBeVisible({ timeout: 5000 });
  });

  test('J3-08 · captura seleccionada tiene aria-pressed="true" (fix: era aria-selected inválido)', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const card = page.getByRole('button', { name: /fecu-sura-2026/i }).first();
    await card.click();

    await expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  test('J3-09 · placeholder del panel cuando no hay captura seleccionada', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await expect(page.getByText(/selecciona una captura/i)).toBeVisible({ timeout: 5000 });
  });

  // ── AnalysisPanel: tabs ───────────────────────────────────────────────────

  test('J3-10 · AnalysisPanel tiene tablist con 4 tabs', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await page.getByRole('button', { name: /acta-consulta/i }).first().click();

    const tablist = page.getByRole('tablist', { name: /secciones del análisis/i });
    await expect(tablist).toBeVisible({ timeout: 5000 });

    const tabs = tablist.getByRole('tab');
    await expect(tabs).toHaveCount(4);
  });

  test('J3-11 · tabs del AnalysisPanel navegables con teclado', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    await page.getByRole('button', { name: /acta-consulta/i }).first().click();

    const tablist = page.getByRole('tablist', { name: /secciones del análisis/i });
    await expect(tablist).toBeVisible({ timeout: 5000 });

    const firstTab = tablist.getByRole('tab').first();
    await firstTab.focus();
    await firstTab.press('ArrowRight');

    // El foco debe moverse al tab siguiente
    const secondTab = tablist.getByRole('tab').nth(1);
    await expect(secondTab).toBeFocused();
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  });

  // ── Cola de commits ───────────────────────────────────────────────────────

  test('J3-12 · cola de commits se expande/colapsa', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const toggleBtn = page.getByRole('button', { name: /cola de commits/i });
    await expect(toggleBtn).toBeVisible({ timeout: 5000 });

    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#commit-queue-panel')).toBeVisible();
  });

  // ── Análisis desde CaptureCard ────────────────────────────────────────────

  test('J3-13 · captura pendiente muestra selector de tipo de análisis', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const analysisSelect = page.getByRole('combobox', { name: /tipo de análisis/i });
    await expect(analysisSelect).toBeVisible({ timeout: 5000 });
  });

  test('J3-14 · botón "Analizar" inicia análisis y muestra loading', async ({ page }) => {
    await mockCorpusApis(page);

    await page.route('**/api/corpus/analyze', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const analyzeBtn = page.getByRole('button', { name: /^analizar$/i }).first();
    await analyzeBtn.click();

    await expect(analyzeBtn).toBeDisabled();
  });

  // ── Accesibilidad ─────────────────────────────────────────────────────────

  test('J3-15 · lista de capturas tiene aria-label', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const list = page.getByRole('list', { name: /capturas del corpus/i });
    await expect(list).toBeVisible({ timeout: 5000 });
  });

  test('J3-16 · aside de capturas tiene aria-label', async ({ page }) => {
    await mockCorpusApis(page);
    await page.goto('/corpus');
    if (!page.url().includes('/corpus')) { test.skip(); return; }

    const aside = page.getByRole('complementary', { name: /lista de capturas/i });
    await expect(aside).toBeVisible({ timeout: 5000 });
  });
});
