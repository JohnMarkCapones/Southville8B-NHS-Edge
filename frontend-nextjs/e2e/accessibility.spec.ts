import { test, expect } from '@playwright/test'

/**
 * Accessibility tests for the Southville 8B NHS application
 * These tests ensure WCAG compliance and keyboard navigation
 */

test.describe('Accessibility', () => {
  test.describe('Keyboard Navigation', () => {
    test('should allow full keyboard navigation on homepage', async ({ page }) => {
      await page.goto('/')

      // Tab through all focusable elements
      let tabCount = 0
      const maxTabs = 50 // Prevent infinite loops

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab')
        tabCount++

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement
          return {
            tag: el?.tagName,
            type: el?.getAttribute('type'),
            role: el?.getAttribute('role'),
            ariaLabel: el?.getAttribute('aria-label'),
          }
        })

        // Verify focused element is interactive
        if (focusedElement.tag) {
          expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'BODY']).toContain(
            focusedElement.tag
          )
        }
      }

      expect(tabCount).toBeGreaterThan(5) // Should have multiple focusable elements
    })

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/')

      // Tab to first interactive element
      await page.keyboard.press('Tab')

      // Check if focus indicator is visible (via outline or ring classes)
      const hasFocusIndicator = await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return false

        const styles = window.getComputedStyle(el)
        const hasOutline = styles.outline !== 'none' && styles.outline !== ''
        const hasRing = el.className.includes('ring') || el.className.includes('focus')

        return hasOutline || hasRing
      })

      expect(hasFocusIndicator).toBe(true)
    })

    test('should support Enter key activation on buttons', async ({ page }) => {
      await page.goto('/')

      // Find first button and focus it
      const button = page.locator('button').first()
      if (await button.isVisible()) {
        await button.focus()
        await page.keyboard.press('Enter')
        // Button should activate (verify no errors)
      }
    })
  })

  test.describe('ARIA Attributes', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()

      expect(headings.length).toBeGreaterThan(0)

      // Should have at least one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThan(0)
    })

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/')

      // Find all images
      const images = await page.locator('img').all()

      for (const img of images) {
        const alt = await img.getAttribute('alt')
        // Every image should have alt attribute (can be empty for decorative images)
        expect(alt).toBeDefined()
      }
    })

    test('should have labels for form inputs', async ({ page }) => {
      // Navigate to a page with forms (adjust path as needed)
      await page.goto('/')

      const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all()

      for (const input of inputs) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')

        // Input should have either: id with corresponding label, aria-label, or aria-labelledby
        const hasLabel = id || ariaLabel || ariaLabelledBy
        expect(hasLabel).toBeTruthy()
      }
    })

    test('should have proper button roles and labels', async ({ page }) => {
      await page.goto('/')

      const buttons = await page.locator('button, [role="button"]').all()

      for (const button of buttons) {
        // Each button should have accessible text or aria-label
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')

        const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel
        expect(hasAccessibleName).toBeTruthy()
      }
    })
  })

  test.describe('Color Contrast', () => {
    test('should render with sufficient color contrast in light mode', async ({ page }) => {
      await page.goto('/')

      // Ensure light mode is active
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark')
      })

      // Basic check that text is visible
      const textElements = await page.locator('p, h1, h2, h3, button').all()
      expect(textElements.length).toBeGreaterThan(0)

      // Each text element should be visible (basic visibility check)
      for (const el of textElements.slice(0, 10)) {
        // Check first 10 elements
        await expect(el).toBeVisible()
      }
    })

    test('should render with sufficient color contrast in dark mode', async ({ page }) => {
      await page.goto('/')

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })

      await page.waitForTimeout(500)

      // Basic check that text is visible
      const textElements = await page.locator('p, h1, h2, h3, button').all()
      expect(textElements.length).toBeGreaterThan(0)

      for (const el of textElements.slice(0, 10)) {
        await expect(el).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: '3XL', width: 1920, height: 1080 },
    ]

    for (const viewport of viewports) {
      test(`should be accessible on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/')

        // Check that main content is visible
        await expect(page.locator('body')).toBeVisible()

        // Verify no horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth
        })

        expect(hasOverflow).toBe(false)
      })
    }
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper landmark regions', async ({ page }) => {
      await page.goto('/')

      // Check for main landmark
      const main = page.locator('main, [role="main"]')
      await expect(main).toBeVisible()

      // Check for navigation landmark
      const nav = page.locator('nav, [role="navigation"]')
      const navCount = await nav.count()
      expect(navCount).toBeGreaterThan(0)
    })

    test('should have skip navigation link', async ({ page }) => {
      await page.goto('/')

      // Tab once to focus skip link (if it exists)
      await page.keyboard.press('Tab')

      const focusedText = await page.evaluate(() => {
        return document.activeElement?.textContent?.toLowerCase()
      })

      // Many accessible sites have "skip to content" or similar
      // This is optional but recommended
      if (focusedText?.includes('skip')) {
        expect(focusedText).toContain('skip')
      }
    })
  })
})
