import { test, expect } from '@playwright/test';

test('load /login without 500 error', async ({ page }) => {
  const response = await page.goto('/login');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Contra-archivo/);
});
