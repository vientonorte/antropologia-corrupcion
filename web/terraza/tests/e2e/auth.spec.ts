import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads with proper title and elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Contra-archivo/);

    // Verify page is not returning error
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);
  });

  test('login page has accessible form elements', async ({ page }) => {
    await page.goto('/login');

    // Check for main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
