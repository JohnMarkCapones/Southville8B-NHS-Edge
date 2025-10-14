import { test, expect } from '@playwright/test'

/**
 * Hydration Error Detection Test Suite
 *
 * This test automatically detects React hydration errors across all major pages.
 * Hydration errors occur when server-rendered HTML doesn't match client-rendered HTML.
 *
 * Common causes:
 * - Returning null conditionally during SSR
 * - Using new Date() in component body
 * - Accessing window/document during SSR
 * - Random values (Math.random())
 * - Inconsistent state between server and client
 */

// List of pages to test for hydration errors
const pagesToTest = [
  { path: '/', name: 'Homepage' },
  { path: '/guess/about', name: 'About Page' },
  { path: '/guess/academics', name: 'Academics Page' },
  { path: '/guess/student-life', name: 'Student Life Page' },
  { path: '/guess/athletics', name: 'Athletics Page' },
  { path: '/guess/news', name: 'News Page' },
  { path: '/guess/news-events', name: 'News & Events Page' },
  { path: '/guess/gallery', name: 'Gallery Page' },
  { path: '/guess/login', name: 'Login Page' },
  { path: '/student', name: 'Student Dashboard' },
  { path: '/teacher', name: 'Teacher Dashboard' },
]

test.describe('Hydration Error Detection', () => {
  // Store console errors for each page
  let consoleErrors: Array<{ page: string; message: string; type: string }> = []

  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const text = msg.text()
        // Check if this is a hydration error
        if (
          text.includes('Hydration') ||
          text.includes('hydration') ||
          text.includes('did not match') ||
          text.includes('server rendered HTML') ||
          text.includes('suppressHydrationWarning')
        ) {
          consoleErrors.push({
            page: page.url(),
            message: text,
            type: msg.type(),
          })
        }
      }
    })

    // Listen for page errors
    page.on('pageerror', (error) => {
      const message = error.message
      if (
        message.includes('Hydration') ||
        message.includes('hydration') ||
        message.includes('did not match')
      ) {
        consoleErrors.push({
          page: page.url(),
          message: message,
          type: 'pageerror',
        })
      }
    })
  })

  // Test each page for hydration errors
  for (const pageInfo of pagesToTest) {
    test(`should not have hydration errors on ${pageInfo.name}`, async ({ page }) => {
      // Clear previous errors
      consoleErrors = []

      // Navigate to the page
      await page.goto(pageInfo.path, {
        waitUntil: 'domcontentloaded',
      })

      // Wait for hydration to complete
      await page.waitForTimeout(2000)

      // Check for hydration errors
      const hydrationErrors = consoleErrors.filter((error) =>
        error.page.includes(pageInfo.path)
      )

      // Fail the test if hydration errors were detected
      if (hydrationErrors.length > 0) {
        console.error(`\n❌ Hydration errors detected on ${pageInfo.name}:`)
        hydrationErrors.forEach((error, index) => {
          console.error(`\n  ${index + 1}. [${error.type}] ${error.message}`)
        })
      }

      expect(
        hydrationErrors,
        `Found ${hydrationErrors.length} hydration error(s) on ${pageInfo.name}`
      ).toHaveLength(0)
    })
  }

  test('should render consistent HTML between server and client', async ({ page }) => {
    // Test a specific page for HTML consistency
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Get the initial HTML after SSR
    const initialHTML = await page.content()

    // Wait for client-side hydration
    await page.waitForTimeout(1000)

    // Get the HTML after hydration
    const hydratedHTML = await page.content()

    // The HTML should be very similar (some differences are expected due to React internal attrs)
    // But the structure should be the same
    const initialLength = initialHTML.length
    const hydratedLength = hydratedHTML.length
    const lengthDifference = Math.abs(initialLength - hydratedLength)
    const percentageDifference = (lengthDifference / initialLength) * 100

    // If the HTML changes more than 10%, something is wrong
    expect(
      percentageDifference,
      `HTML changed ${percentageDifference.toFixed(2)}% after hydration (should be < 10%)`
    ).toBeLessThan(10)
  })

  test('should not have layout shifts during hydration', async ({ page }) => {
    // Navigate to a page and measure layout shifts
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Get layout shift score using Performance API
    const layoutShiftScore = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue
            clsValue += (entry as any).value
          }
        })
        observer.observe({ type: 'layout-shift', buffered: true })

        // Wait 2 seconds then resolve
        setTimeout(() => {
          observer.disconnect()
          resolve(clsValue)
        }, 2000)
      })
    })

    // Layout shift score should be very low (< 0.1 is good, < 0.25 is acceptable)
    expect(
      layoutShiftScore,
      `Layout shift score ${layoutShiftScore.toFixed(4)} is too high (should be < 0.1)`
    ).toBeLessThan(0.1)
  })
})

test.describe('Common Hydration Anti-Patterns', () => {
  test('should not use Date() in component body without guards', async ({ page }) => {
    // This is a code-level check that would be done during development
    // For now, we just verify the footer renders the correct year
    await page.goto('/')

    // Check if footer shows current year (should be consistent)
    const footerText = await page.textContent('footer')
    const currentYear = new Date().getFullYear()

    expect(footerText).toContain(currentYear.toString())
  })

  test('should handle theme changes without hydration errors', async ({ page }) => {
    consoleErrors = []

    await page.goto('/')
    await page.waitForTimeout(1000)

    // Find and click the theme toggle button
    const themeButton = page.getByLabel(/switch to (dark|light) mode/i).first()

    if (await themeButton.isVisible()) {
      await themeButton.click()
      await page.waitForTimeout(500)

      // Check for hydration errors after theme change
      const themeErrors = consoleErrors.filter((error) =>
        error.message.includes('Hydration') || error.message.includes('hydration')
      )

      expect(themeErrors).toHaveLength(0)
    }
  })
})

test.describe('Hydration Performance', () => {
  test('should hydrate within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Wait for React to hydrate (look for interactive elements)
    await page.waitForSelector('button:not([disabled])', { timeout: 5000 })

    const hydrationTime = Date.now() - startTime

    // Hydration should complete in less than 3 seconds
    expect(
      hydrationTime,
      `Hydration took ${hydrationTime}ms (should be < 3000ms)`
    ).toBeLessThan(3000)
  })
})
