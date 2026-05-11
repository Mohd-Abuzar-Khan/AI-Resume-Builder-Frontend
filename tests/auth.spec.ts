import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const loginPath = '/auth/login';

  test('should navigate to login page', async ({ page }) => {
    await page.goto(loginPath);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('should show validation errors on empty login submission', async ({ page }) => {
    await page.goto(loginPath);
    const submitBtn = page.getByRole('button', { name: /log in/i });
    await submitBtn.click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should allow user to type in email and password fields', async ({ page }) => {
    await page.goto(loginPath);

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should have a link to registration', async ({ page }) => {
    await page.goto(loginPath);
    const registerLink = page.getByRole('link', { name: /create an account/i });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
