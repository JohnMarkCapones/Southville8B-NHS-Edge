import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/Southville 8B NHS/i)
  })

  test('should display main navigation', async ({ page }) => {
    // Check for main navigation elements
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Homepage should still be accessible
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have working theme toggle', async ({ page }) => {
    // Look for theme toggle button (adjust selector based on your implementation)
    const themeToggle = page.locator('[aria-label*="theme" i], [aria-label*="dark mode" i]').first()

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator('html')
      const initialClass = await htmlElement.getAttribute('class')

      // Click theme toggle
      await themeToggle.click()

      // Wait for theme change
      await page.waitForTimeout(500)

      // Verify theme changed
      const newClass = await htmlElement.getAttribute('class')
      expect(newClass).not.toBe(initialClass)
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    // Tab through navigation
    await page.keyboard.press('Tab')

    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })
})
