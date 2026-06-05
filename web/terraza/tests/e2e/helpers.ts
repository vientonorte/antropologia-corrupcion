/**
 * Shared test helpers for E2E journey-map tests.
 * Import from all journey-*.spec.ts files instead of duplicating.
 */

import type { Page } from '@playwright/test';

/**
 * Adds a session cookie to bypass the auth middleware in tests.
 * The middleware checks for a 'session' cookie; this simulates a logged-in state.
 * NOTE: The cookie is not HttpOnly so it can be set from client context in tests.
 */
export async function mockSession(page: Page): Promise<void> {
  await page.context().addCookies([{
    name: 'session',
    value: 'test-session-token',
    domain: 'localhost',
    path: '/',
    httpOnly: false,
  }]);
}

/**
 * Mocks all corpus API endpoints with empty-state responses.
 * Useful for navigation and layout tests that don't need real data.
 */
export async function mockEmptyCorpus(page: Page): Promise<void> {
  await page.route('**/api/corpus/list', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ uploads: [] }) });
  });
  await page.route('**/api/corpus/sync-status', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ pending: [], remoteStatus: { ahead: 0, behind: 0 } }),
    });
  });
  await page.route('**/api/corpus/by-estado', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ grouped: { open: [], axial: [], selective: [], verificado: [] } }),
    });
  });
  await page.route('**/api/corpus/graph-data', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ nodes: [], edges: [] }) });
  });
}
