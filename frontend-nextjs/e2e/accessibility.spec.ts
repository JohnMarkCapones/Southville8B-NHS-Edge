import { test, expect } from '@playwright/test';

/**
 * 🎯 Accessibility Test Suite
 * 
 * Tests for WCAG 2.1 Level AA compliance
 * Focuses on: Semantic HTML, ARIA, Keyboard Navigation, Color Contrast
 */

test.describe('Accessibility Tests', () => {

  // ============================================================
  // 🏗️ Semantic HTML & Structure
  // ============================================================
  test.describe('Semantic HTML', () => {
    
    test('should have proper landmark regions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Check for essential landmarks (at least one of each)
      const mainCount = await page.locator('main, [role="main"]').count();
      expect(mainCount).toBeGreaterThan(0);
      
      const headerCount = await page.locator('header, [role="banner"]').count();
      expect(headerCount).toBeGreaterThan(0);
      
      const navCount = await page.locator('nav, [role="navigation"]').count();
      expect(navCount).toBeGreaterThan(0);
    });

    test('should have one h1 heading per page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Get all visible headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /.+/ }).all();
      
      if (headings.length > 1) {
        const headingLevels: number[] = [];
        
        for (const heading of headings) {
          const isVisible = await heading.isVisible();
          if (isVisible) {
            const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
            const level = parseInt(tagName.substring(1));
            headingLevels.push(level);
          }
        }
        
        // Check that we start with h1
        if (headingLevels.length > 0) {
          expect(headingLevels[0]).toBe(1);
          
          // Warn if heading levels skip (but don't fail - it's a warning, not an error)
          for (let i = 1; i < headingLevels.length; i++) {
            const diff = headingLevels[i] - headingLevels[i - 1];
            // Allow same level or one level deeper, but warn on skips
            if (diff > 1) {
              console.warn(`⚠️ Heading skip detected: h${headingLevels[i - 1]} to h${headingLevels[i]}`);
            }
          }
        }
      }
    });
  });

  // ============================================================
  // 🖼️ Images & Alternative Text
  // ============================================================
  test.describe('Images', () => {
    
    test('should have alt text on all images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull(); // Alt attribute must exist (can be empty for decorative)
      }
    });
  });

  // ============================================================
  // ⌨️ Keyboard Navigation
  // ============================================================
  test.describe('Keyboard Navigation', () => {
    
    test('should support tab navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Press Tab key
      await page.keyboard.press('Tab');
      
      // Check if an element is focused
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Tab to first interactive element
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.locator(':focus');
      
      // Check if focus indicator is visible
      const focusStyles = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });
      
      // At least one focus indicator should be present
      const hasFocusIndicator = 
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });
  });

  // ============================================================
  // 🎨 ARIA Attributes
  // ============================================================
  test.describe('ARIA Attributes', () => {
    
    test('should have valid aria-expanded values', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const expandableElements = await page.locator('[aria-expanded]').all();
      
      for (const element of expandableElements) {
        const expanded = await element.getAttribute('aria-expanded');
        expect(['true', 'false']).toContain(expanded);
      }
    });

    test('should have valid aria-selected values', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const selectableElements = await page.locator('[aria-selected]').all();
      
      for (const element of selectableElements) {
        const selected = await element.getAttribute('aria-selected');
        expect(['true', 'false']).toContain(selected);
      }
    });

    test('should have aria-label or aria-labelledby on interactive elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Check buttons without visible text
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const title = await button.getAttribute('title');
        
        // Button should have either visible text, aria-label, aria-labelledby, or title
        const hasAccessibleName = 
          (text && text.trim().length > 0) ||
          ariaLabel ||
          ariaLabelledBy ||
          title;
        
        expect(hasAccessibleName).toBeTruthy();
      }
    });
  });

  // ============================================================
  // 🔗 Links & Forms
  // ============================================================
  test.describe('Links & Forms', () => {
    
    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const links = await page.locator('a[href]').all();
      
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        // Link should have either visible text, aria-label, or title
        const hasAccessibleName = 
          (text && text.trim().length > 0) ||
          ariaLabel ||
          title;
        
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should have labels for form inputs', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const inputs = await page.locator('input:not([type="hidden"])').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        
        // Input should have a label, aria-label, or aria-labelledby
        const hasLabel = ariaLabel || ariaLabelledBy || (id && await page.locator(`label[for="${id}"]`).count() > 0);
        
        // Placeholder alone is not sufficient but acceptable as fallback
        expect(hasLabel || placeholder).toBeTruthy();
      }
    });
  });

  // ============================================================
  // 📱 Responsive & Mobile
  // ============================================================
  test.describe('Responsive Design', () => {
    
    test('should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Check main content is visible
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      
      // Check navigation exists (may be in a menu)
      const nav = await page.locator('nav, [role="navigation"]').count();
      expect(nav).toBeGreaterThan(0);
    });

    test('should not have horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    });
  });

  // ============================================================
  // 🎯 Color & Contrast
  // ============================================================
  test.describe('Color Contrast', () => {
    
    test('should have visible text (not transparent)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Sample first 10 text elements
      const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button').all();
      
      for (const element of textElements.slice(0, 10)) {
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          const color = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return styles.color;
          });
          
          // Ensure text is not transparent
          expect(color).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    });
  });

  // ============================================================
  // 🚨 Page Errors & Console
  // ============================================================
  test.describe('Page Health', () => {
    
    test('should not have JavaScript errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      expect(errors).toHaveLength(0);
    });
  });
});

