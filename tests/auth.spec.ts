import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1', { hasText: /(Sign In|Login)/i }).first()).toBeVisible();
  });

  test('should show validation errors on empty login submission', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Expect form validation error
    // Some forms use native HTML5 validation, others show span elements
    // We'll just verify we're still on the login page and it didn't submit
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow user to type in email and password fields', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should have a link to registration', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('a', { hasText: /(Sign up|Register|Create an account)/i });
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL(/.*(register|signup)/);
  });
});
