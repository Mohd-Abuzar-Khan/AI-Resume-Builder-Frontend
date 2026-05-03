# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page >> should have correct title
- Location: tests\landing.spec.ts:9:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Resumade/i
"out of memory"

Call log:
  - Expect "toHaveTitle" with timeout 5000ms

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Landing Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Go to the starting url before each test.
  6  |     await page.goto('/');
  7  |   });
  8  | 
  9  |   test('should have correct title', async ({ page }) => {
  10 |     // Expect a title "to contain" a substring.
> 11 |     await expect(page).toHaveTitle(/Resumade/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  12 |   });
  13 | 
  14 |   test('should have a hero section with Get Started button', async ({ page }) => {
  15 |     const getStartedButton = page.locator('button', { hasText: 'Get Started' }).first();
  16 |     await expect(getStartedButton).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should navigate to login page when Get Started is clicked', async ({ page }) => {
  20 |     const getStartedButton = page.locator('button', { hasText: 'Get Started' }).first();
  21 |     await getStartedButton.click();
  22 |     
  23 |     // Check if the URL changes to /login or the login modal opens.
  24 |     // The implementation might differ depending on routing, so we check if the path contains 'login' or 'auth'
  25 |     await expect(page).toHaveURL(/.*(login|auth|dashboard)/);
  26 |   });
  27 | 
  28 |   test('should display features section', async ({ page }) => {
  29 |     // Look for common feature keywords or section headings
  30 |     const featuresHeading = page.locator('h2', { hasText: /(Features|Why Choose Us|How it Works)/i }).first();
  31 |     // It's possible the heading is different, so we loosely check for visibility of main content
  32 |     const mainElement = page.locator('main');
  33 |     await expect(mainElement).toBeVisible();
  34 |   });
  35 | });
  36 | 
```