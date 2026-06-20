/**
 * Shared test helpers for E2E journey-map tests.
 * Import from all journey-*.spec.ts files instead of duplicating.
 */

import type { Page } from '@playwright/test';

/**
 * Adds a session cookie to bypass the auth middleware in tests.
 * Middleware expects `auth-session` with signed `payload.signature` format
 * (see src/lib/auth/session.ts). Full HMAC is verified server-side in getSession();
 * middleware only checks dot-separated shape.
 */
export async function mockSession(page: Page): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({ userId: 'test-user', userName: 'Test', createdAt: Date.now() }),
  ).toString('base64url');
  await page.context().addCookies([{
    name: 'auth-session',
    value: `${payload}.test-signature`,
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
