# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should allow user to type in email and password fields
- Location: tests\auth.spec.ts:21:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"], input[name="email"]')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - navigation [ref=e8]:
    - link "Resumade" [ref=e9] [cursor=pointer]:
      - /url: /
      - generic [ref=e10]: Resumade
    - generic [ref=e11]:
      - link "Explore" [ref=e12] [cursor=pointer]:
        - /url: /explore
      - link "Pricing" [ref=e13] [cursor=pointer]:
        - /url: /pricing
      - link "Community" [ref=e14] [cursor=pointer]:
        - /url: /community
    - link "Sign in" [ref=e16] [cursor=pointer]:
      - /url: /auth/login
  - generic [ref=e18]:
    - generic [ref=e19]: Error 404
    - heading "Page missing" [level=1] [ref=e20]:
      - text: Page
      - emphasis [ref=e21]: missing
    - paragraph [ref=e22]: We couldn't find what you were looking for. Let's get you back to building something great.
    - link "Back to home" [ref=e23] [cursor=pointer]:
      - /url: /
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   
  5  |   test('should navigate to login page', async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     await expect(page.locator('h1', { hasText: /(Sign In|Login)/i }).first()).toBeVisible();
  8  |   });
  9  | 
  10 |   test('should show validation errors on empty login submission', async ({ page }) => {
  11 |     await page.goto('/login');
  12 |     const submitBtn = page.locator('button[type="submit"]');
  13 |     await submitBtn.click();
  14 |     
  15 |     // Expect form validation error
  16 |     // Some forms use native HTML5 validation, others show span elements
  17 |     // We'll just verify we're still on the login page and it didn't submit
  18 |     await expect(page).toHaveURL(/.*login/);
  19 |   });
  20 | 
  21 |   test('should allow user to type in email and password fields', async ({ page }) => {
  22 |     await page.goto('/login');
  23 |     
  24 |     const emailInput = page.locator('input[type="email"], input[name="email"]');
  25 |     const passwordInput = page.locator('input[type="password"], input[name="password"]');
  26 |     
> 27 |     await emailInput.fill('test@example.com');
     |                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  28 |     await passwordInput.fill('password123');
  29 |     
  30 |     await expect(emailInput).toHaveValue('test@example.com');
  31 |     await expect(passwordInput).toHaveValue('password123');
  32 |   });
  33 | 
  34 |   test('should have a link to registration', async ({ page }) => {
  35 |     await page.goto('/login');
  36 |     const registerLink = page.locator('a', { hasText: /(Sign up|Register|Create an account)/i });
  37 |     await expect(registerLink).toBeVisible();
  38 |     
  39 |     await registerLink.click();
  40 |     await expect(page).toHaveURL(/.*(register|signup)/);
  41 |   });
  42 | });
  43 | 
```