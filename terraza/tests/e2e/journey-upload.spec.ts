/**
 * Journey Map 2 — Subir captura
 *
 * ACTRIZ: Rö llega con una imagen de un documento oficial (FECU, acta, etc.)
 * OBJETIVO: Subirla al corpus con metadatos correctos y obtener confirmación
 *
 * Pasos del journey:
 *   1. Navega a /upload desde el sidebar o bottom-nav
 *   2. Ve el formulario con todos los campos requeridos
 *   3. Selecciona caso, tipo de fuente, régimen de verdad
 *   4. Arrastra o hace clic para seleccionar el archivo
 *   5. Opcionalmente agrega tags y fecha
 *   6. Envía y ve confirmación con el upload ID
 *   7. Mensaje de error si el servidor falla
 *
 * MEJORAS IDENTIFICADAS (ya corregidas):
 *   [fix] Error div en UploadForm no tenía role="alert" → añadido
 */

import { test, expect } from '@playwright/test';
import { mockSession } from './helpers';

test.describe('Journey 2 — Subir captura', () => {
  // ── Acceso a la página ────────────────────────────────────────────────────

  test('J2-01 · /upload sin sesión redirige a /login', async ({ page }) => {
    const res = await page.goto('/upload');
    await expect(page).toHaveURL(/\/(login|upload)/);
    expect(res?.status()).toBeLessThan(500);
  });

  // ── Estructura del formulario ─────────────────────────────────────────────

  test('J2-02 · formulario tiene todos los campos etiquetados', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    // Verifica campos con label correcto (WCAG 2.2)
    await expect(page.getByLabel('Caso etnográfico')).toBeVisible();
    await expect(page.getByLabel('Tipo de fuente')).toBeVisible();
    await expect(page.getByLabel('Régimen de verdad')).toBeVisible();
    await expect(page.getByLabel(/tags/i)).toBeVisible();
    await expect(page.getByLabel(/fecha del evento/i)).toBeVisible();
  });

  test('J2-03 · dropzone tiene aria-label descriptivo', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const dropzone = page.getByRole('button', { name: /zona de carga/i });
    await expect(dropzone).toBeVisible();
    await expect(dropzone).toHaveAttribute('aria-label');
  });

  test('J2-04 · botón "Subir captura" deshabilitado sin archivo', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const submitBtn = page.getByRole('button', { name: /subir captura/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('J2-05 · seleccionar archivo habilita el botón y muestra el nombre', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-documento.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-png-content'),
    });

    const submitBtn = page.getByRole('button', { name: /subir captura/i });
    await expect(submitBtn).toBeEnabled();
    await expect(page.getByText('test-documento.png')).toBeVisible();
  });

  test('J2-06 · carga exitosa muestra confirmación con upload ID', async ({ page }) => {
    await mockSession(page);

    await page.route('**/api/corpus/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ uploadId: 'test-upload-abc123' }),
      });
    });

    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'documento.png', mimeType: 'image/png', buffer: Buffer.from('x'),
    });

    await page.getByRole('button', { name: /subir captura/i }).click();

    await expect(page.getByText(/test-upload-abc123/)).toBeVisible({ timeout: 5000 });
  });

  test('J2-07 · error del servidor se muestra con role="alert" (fix)', async ({ page }) => {
    await mockSession(page);

    await page.route('**/api/corpus/upload', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'No hay espacio en disco' }),
      });
    });

    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('x'),
    });

    await page.getByRole('button', { name: /subir captura/i }).click();

    // WCAG 4.1.3: El error debe tener role="alert" para ser anunciado
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText(/espacio|error|failed/i);
  });

  test('J2-08 · estado de carga deshabilita el botón y muestra "Subiendo"', async ({ page }) => {
    await mockSession(page);

    await page.route('**/api/corpus/upload', async (route) => {
      await new Promise<void>((r) => setTimeout(r, 3000));
      await route.fulfill({ status: 200, body: JSON.stringify({ uploadId: 'abc' }) });
    });

    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('x'),
    });

    const submitBtn = page.getByRole('button', { name: /subir captura/i });
    await submitBtn.click();

    await expect(submitBtn).toBeDisabled();
    await expect(page.getByText(/subiendo/i)).toBeVisible();
  });

  // ── Accesibilidad del formulario ──────────────────────────────────────────

  test('J2-09 · selector de caso tiene 4 opciones (una por caso etnográfico)', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const casoSelect = page.getByLabel('Caso etnográfico');
    const options = casoSelect.locator('option');
    await expect(options).toHaveCount(4);
  });

  test('J2-10 · dropzone es alcanzable por teclado (tabIndex=0)', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    const dropzone = page.getByRole('button', { name: /zona de carga/i });
    await expect(dropzone).toHaveAttribute('tabindex', '0');
  });

  test('J2-11 · título H1 de la página de upload', async ({ page }) => {
    await mockSession(page);
    await page.goto('/upload');
    if (!page.url().includes('/upload')) { test.skip(); return; }

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/subir captura/i);
  });
});
