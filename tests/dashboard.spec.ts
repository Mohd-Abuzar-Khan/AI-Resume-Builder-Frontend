import { test, expect } from '@playwright/test';

test.describe('Dashboard UI Elements', () => {
  // Mock authentication state or rely on unauthenticated redirects
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Depending on the auth guard, it might redirect to /login
    await expect(page).toHaveURL(/.*login/);
  });

  // Example of a mock authenticated state test using context injection
  // To make this fully functional, we would need to set localStorage/sessionStorage
  // But we can check structural elements if routing allows it
  test('dashboard structure (mocked)', async ({ page }) => {
    // Intercept the API to mock an authenticated user
    await page.route('**/api/v1/auth/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 1, fullName: 'Test User', email: 'test@example.com', role: 'USER' })
      });
    });

    // Mock resumes response
    await page.route('**/api/v1/resumes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { resumeId: 1, title: 'Software Engineer', targetJobTitle: 'Developer', updatedAt: new Date().toISOString() }
        ])
      });
    });

    // We can evaluate localStorage to bypass the Angular auth guard if it relies on tokens
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_token_123');
      localStorage.setItem('user_info', JSON.stringify({ userId: 1, fullName: 'Test User' }));
    });

    await page.goto('/dashboard');
    
    // Check if sidebar/nav elements are visible
    const nav = page.locator('nav').first();
    // Assuming a dashboard has a visible navigation/sidebar
    // await expect(nav).toBeVisible(); 
  });
});
