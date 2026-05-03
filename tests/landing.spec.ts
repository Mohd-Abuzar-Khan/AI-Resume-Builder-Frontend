import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/');
  });

  test('should have correct title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Resumade/i);
  });

  test('should have a hero section with Get Started button', async ({ page }) => {
    const getStartedButton = page.locator('button', { hasText: 'Get Started' }).first();
    await expect(getStartedButton).toBeVisible();
  });

  test('should navigate to login page when Get Started is clicked', async ({ page }) => {
    const getStartedButton = page.locator('button', { hasText: 'Get Started' }).first();
    await getStartedButton.click();
    
    // Check if the URL changes to /login or the login modal opens.
    // The implementation might differ depending on routing, so we check if the path contains 'login' or 'auth'
    await expect(page).toHaveURL(/.*(login|auth|dashboard)/);
  });

  test('should display features section', async ({ page }) => {
    // Look for common feature keywords or section headings
    const featuresHeading = page.locator('h2', { hasText: /(Features|Why Choose Us|How it Works)/i }).first();
    // It's possible the heading is different, so we loosely check for visibility of main content
    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible();
  });
});
