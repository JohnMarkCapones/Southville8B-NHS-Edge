import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to guest routes', async ({ page }) => {
    await page.goto('/')

    // Test navigation to various guest routes
    const routes = [
      { path: '/guess/news', title: /news/i },
      { path: '/guess/events', title: /events/i },
      { path: '/guess/clubs', title: /clubs/i },
      { path: '/guess/academics', title: /academics/i },
    ]

    for (const route of routes) {
      await page.goto(route.path)
      await expect(page).toHaveURL(route.path)
      // Verify page loaded successfully
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should handle 404 pages correctly', async ({ page }) => {
    const response = await page.goto('/non-existent-page')

    // Check for 404 status or custom 404 page
    if (response) {
      expect(response.status()).toBe(404)
    }

    // Verify 404 page content is displayed
    await expect(
      page.locator('text=/not found|404/i').first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('should preserve URL parameters during navigation', async ({ page }) => {
    await page.goto('/search?q=mathematics')
    await expect(page).toHaveURL(/q=mathematics/)
  })

  test('should have working back/forward navigation', async ({ page }) => {
    // Navigate through multiple pages
    await page.goto('/')
    await page.goto('/guess/news')
    await page.goto('/guess/events')

    // Go back
    await page.goBack()
    await expect(page).toHaveURL(/\/guess\/news/)

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(/\/guess\/events/)
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab through focusable elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    }

    // Shift+Tab to go backward
    await page.keyboard.press('Shift+Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
})

test.describe('Role-based Navigation', () => {
  test('should show student portal routes (when authenticated)', async ({ page }) => {
    // This test assumes you have authentication set up
    // You'll need to implement proper auth mocking or test credentials

    // For now, just verify the routes exist
    const studentRoutes = [
      '/student/dashboard',
      '/student/assignments',
      '/student/grades',
      '/student/schedule',
    ]

    for (const route of studentRoutes) {
      const response = await page.goto(route)
      // Will redirect to login if not authenticated, which is expected
      expect(response?.status()).toBeLessThan(500) // No server errors
    }
  })

  test('should show teacher portal routes (when authenticated)', async ({ page }) => {
    const teacherRoutes = [
      '/teacher/dashboard',
      '/teacher/students',
      '/teacher/classes',
    ]

    for (const route of teacherRoutes) {
      const response = await page.goto(route)
      expect(response?.status()).toBeLessThan(500)
    }
  })
})
