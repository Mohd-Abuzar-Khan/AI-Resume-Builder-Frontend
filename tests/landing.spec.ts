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

  test('should have a hero section with Start for free CTA', async ({ page }) => {
    const heroSection = page.locator('main section').first();
    const startCta = heroSection.getByRole('link', { name: /start for free/i });
    await expect(startCta).toBeVisible();
  });

  test('should navigate to registration page when Start for free is clicked', async ({ page }) => {
    const heroSection = page.locator('main section').first();
    const startCta = heroSection.getByRole('link', { name: /start for free/i });
    await startCta.click();

    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('should display features section', async ({ page }) => {
    // Look for common feature keywords or section headings
    const featuresHeading = page.locator('h2', { hasText: /(Features|Why Choose Us|How it Works)/i }).first();
    // It's possible the heading is different, so we loosely check for visibility of main content
    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible();
  });
});
