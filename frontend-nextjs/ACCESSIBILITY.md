# Accessibility Guide - Southville 8B NHS

## Overview

This project is committed to WCAG 2.1 Level AAA compliance, ensuring the best possible accessibility for all users, including students and teachers with disabilities.

## 🎯 Current Status

**Target Standard:** WCAG 2.1 Level AAA
**Testing Status:** In Progress
**Last Updated:** October 2025

### Completed Improvements

✅ ESLint accessibility plugin configured
✅ Enhanced keyboard navigation with visible focus indicators
✅ Skip links for main content and navigation
✅ Improved color contrast (7:1 ratio for AAA)
✅ Touch targets sized at minimum 44×44px
✅ Reduced motion support via `prefers-reduced-motion`
✅ Enhanced text readability and spacing
✅ Screen reader optimizations with ARIA labels
✅ Language attributes (lang="en-PH")

### In Progress

⏳ ARIA attributes validation on Radix UI tabs
⏳ Heading hierarchy audit across all pages
⏳ Comprehensive screen reader testing

---

## 🛠️ Tools & Setup

### 1. ESLint Accessibility Plugin

**Installation:**
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

**Configuration:** `.eslintrc.json`
```json
{
  "extends": ["next/core-web-vitals", "plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"]
}
```

**Usage:**
```bash
npm run lint
```

### 2. Browser Extensions (Recommended)

- **axe DevTools** (Chrome/Edge): https://www.deque.com/axe/devtools/
- **WAVE** (All browsers): https://wave.webaim.org/extension/
- **Lighthouse** (Chrome): Built-in DevTools

### 3. Screen Readers

- **Windows:** NVDA (free) - https://www.nvaccess.org/
- **macOS:** VoiceOver (built-in) - Cmd+F5
- **Mobile:** TalkBack (Android), VoiceOver (iOS)

---

## 📚 Helper Components & Utilities

### VisuallyHidden Component

Hides content visually but keeps it accessible to screen readers.

```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden"

<button>
  <SearchIcon />
  <VisuallyHidden>Search</VisuallyHidden>
</button>
```

### LiveRegion Component

Announces dynamic content changes to screen readers.

```tsx
import { LiveRegion } from "@/components/ui/live-region"

// Loading state
<LiveRegion
  message={isLoading ? "Loading content..." : "Content loaded"}
/>

// Error (urgent)
<LiveRegion
  message={error}
  priority="assertive"
  visible
/>
```

### SkipLink Component

Provides keyboard navigation shortcuts.

```tsx
import { SkipLink } from "@/components/ui/skip-link"

<SkipLink targetId="main-content">Skip to main content</SkipLink>
<SkipLink targetId="navigation">Skip to navigation</SkipLink>
```

### Touch Target Class

Ensures interactive elements meet minimum size requirements.

```tsx
<button className="touch-target">
  {/* Minimum 44×44px touch target */}
</button>
```

---

## 🎨 Styling Guidelines

### Color Contrast

**WCAG 2.1 AAA Requirements:**
- Normal text: **7:1** contrast ratio
- Large text (18pt+): **4.5:1** contrast ratio
- UI components: **3:1** contrast ratio

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**Example (Good Contrast):**
```tsx
// ✅ GOOD - High contrast
<span className="border-emerald-600 text-emerald-900 bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-100">
  Status: Active
</span>

// ❌ BAD - Insufficient contrast
<span className="border-emerald-300 text-emerald-700 bg-emerald-50">
  Status: Active
</span>
```

### Focus Indicators

All interactive elements automatically receive enhanced focus indicators:

```css
*:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 2px;
}
```

**High Contrast Mode:**
```css
@media (prefers-contrast: high) {
  *:focus-visible {
    outline-width: 4px;
    outline-color: currentColor;
  }
}
```

### Reduced Motion

All animations respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Text Readability

- **Base font size:** 16px minimum
- **Line height:** 1.6 for body text, 1.3 for headings
- **Line length:** Max 70 characters (70ch)

---

## ♿ Component Patterns

### Buttons

**Icon-only buttons MUST have accessible names:**

```tsx
// ✅ GOOD
<button aria-label="Open search">
  <SearchIcon />
</button>

// ❌ BAD
<button>
  <SearchIcon />
</button>
```

### Images

**All images MUST have meaningful alt text:**

```tsx
// ✅ GOOD - Descriptive
<Image
  src="/campus.jpg"
  alt="Students collaborating in modern science lab with microscopes at Southville 8B NHS"
/>

// ✅ GOOD - Decorative
<Image
  src="/decoration.svg"
  alt=""
  role="presentation"
  aria-hidden="true"
/>

// ❌ BAD - Generic
<Image src="/campus.jpg" alt="Campus" />
```

### Forms

**All form inputs MUST have labels and error messages:**

```tsx
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-hint email-error"
    aria-required="true"
    aria-invalid={errors.email ? "true" : "false"}
  />
  <p id="email-hint" className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
  {errors.email && (
    <p id="email-error" className="text-sm text-red-600" role="alert">
      {errors.email.message}
    </p>
  )}
</div>
```

### Carousels

**All carousel controls MUST be accessible:**

```tsx
// Navigation buttons
<Button aria-label="Previous image">
  <ChevronLeft />
</Button>
<Button aria-label="Next image">
  <ChevronRight />
</Button>

// Indicator dots
<div role="group" aria-label="Image gallery navigation">
  {images.map((_, index) => (
    <button
      key={index}
      className="touch-target"
      aria-label={`Go to image ${index + 1} of ${images.length}`}
      aria-current={index === currentIndex ? "true" : "false"}
    >
      <VisuallyHidden>
        {index === currentIndex ? `Image ${index + 1} (current)` : `Image ${index + 1}`}
      </VisuallyHidden>
    </button>
  ))}
</div>
```

### Tables

**Complex tables MUST have proper structure:**

```tsx
<Table>
  <caption>Student Rankings for 2025</caption>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Rank</TableHead>
      <TableHead scope="col">Name</TableHead>
      <TableHead scope="col">GWA</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell scope="row">1</TableCell>
      <TableCell>Ava Martinez</TableCell>
      <TableCell>98.6</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Headings

**Maintain proper heading hierarchy:**

```tsx
// ✅ GOOD
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// ❌ BAD - Skipped level
<h1>Page Title</h1>
<h3>Section Title</h3> {/* Skipped h2! */}
```

**Rules:**
- Use only ONE `<h1>` per page
- Don't skip levels
- Use semantic levels, not for styling

---

## 🧪 Testing Procedures

### 1. Automated Testing

**ESLint (Pre-commit):**
```bash
npm run lint
```

**Lighthouse (Chrome DevTools):**
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Run audit
5. **Target:** 100/100 score

**axe DevTools:**
1. Install extension
2. Open DevTools
3. Go to "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Fix all violations

### 2. Keyboard Navigation Testing

**Process:**
1. Unplug/disable mouse
2. Use only keyboard:
   - **Tab:** Next element
   - **Shift+Tab:** Previous element
   - **Enter/Space:** Activate button/link
   - **Escape:** Close modal/dropdown
   - **Arrow keys:** Navigate menus/lists

**Checklist:**
- [ ] All interactive elements are reachable
- [ ] Focus is always visible
- [ ] Tab order is logical
- [ ] No keyboard traps
- [ ] Skip links work correctly
- [ ] Dropdowns/modals can be closed with Escape

### 3. Screen Reader Testing

**NVDA (Windows):**
```bash
# Download and install NVDA
# Start: Ctrl+Alt+N
# Stop: Insert+Q
```

**Checklist:**
- [ ] All images have meaningful alt text
- [ ] All buttons announce their purpose
- [ ] Forms are fully navigable
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Tables are properly structured

**Common NVDA Commands:**
- **H:** Next heading
- **B:** Next button
- **K:** Next link
- **T:** Next table
- **F:** Next form field

### 4. Mobile Touch Testing

**Requirements:**
- All interactive elements ≥ 44×44px
- Adequate spacing between targets (8px min)

**Test Devices:**
- iOS Safari
- Android Chrome
- Various screen sizes

### 5. Zoom Testing

**Process:**
1. Zoom browser to 200% (Ctrl/Cmd + Plus)
2. Verify:
   - [ ] No horizontal scrolling
   - [ ] All content still accessible
   - [ ] Text reflows properly
   - [ ] No overlapping elements

---

## 📝 Development Checklist

Use this checklist when creating new components:

### Basic Accessibility
- [ ] All interactive elements have accessible names
- [ ] Color contrast meets 7:1 ratio (AAA)
- [ ] Touch targets are minimum 44×44px
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works

### Semantic HTML
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Semantic elements used (`<nav>`, `<main>`, `<article>`, etc.)
- [ ] Forms have labels and error messages
- [ ] Tables have proper structure

### ARIA
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA live regions for dynamic content
- [ ] ARIA current for active states
- [ ] ARIA hidden for decorative elements
- [ ] ARIA describedby for additional context

### Images & Media
- [ ] All images have alt text
- [ ] Decorative images have `alt=""` and `aria-hidden="true"`
- [ ] Videos have captions (when applicable)

### Interactions
- [ ] Modals trap focus and close on Escape
- [ ] Dropdowns are keyboard accessible
- [ ] Carousels have accessible controls
- [ ] Drag-and-drop has keyboard alternative

---

## 🐛 Common Issues & Fixes

### Issue: Button Without Accessible Name

```tsx
// ❌ PROBLEM
<button><SearchIcon /></button>

// ✅ SOLUTION 1: Add aria-label
<button aria-label="Search">
  <SearchIcon />
</button>

// ✅ SOLUTION 2: Add visible text
<button>
  <SearchIcon />
  <span>Search</span>
</button>

// ✅ SOLUTION 3: Use VisuallyHidden
<button>
  <SearchIcon />
  <VisuallyHidden>Search</VisuallyHidden>
</button>
```

### Issue: Low Color Contrast

```tsx
// ❌ PROBLEM (Contrast ratio: 3:1)
<span className="text-gray-400 bg-white">Status</span>

// ✅ SOLUTION (Contrast ratio: 7:1+)
<span className="text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900">
  Status
</span>
```

### Issue: Small Touch Targets

```tsx
// ❌ PROBLEM (12×12px)
<button className="w-3 h-3">•</button>

// ✅ SOLUTION (44×44px)
<button className="touch-target">
  <span className="sr-only">Slide 1</span>
</button>
```

### Issue: Missing Form Labels

```tsx
// ❌ PROBLEM
<input type="email" placeholder="Email" />

// ✅ SOLUTION
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

## 📖 Resources

### Official Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/) - Official specification
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - ARIA patterns

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluator
- [NVDA](https://www.nvaccess.org/) - Free screen reader

### Learning Resources
- [WebAIM](https://webaim.org/) - Excellent tutorials
- [A11ycasts](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g) - Video series
- [The A11y Project](https://www.a11yproject.com/) - Community resources
- [Inclusive Components](https://inclusive-components.design/) - Component patterns

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Check color contrast
- [Accessible Color Palette Builder](https://toolness.github.io/accessible-color-matrix/) - Build palettes

---

## 🎓 Training

### For Developers

**Required Knowledge:**
1. WCAG 2.1 basics
2. Semantic HTML
3. ARIA attributes and when to use them
4. Keyboard navigation patterns
5. Screen reader basics

**Required Tools:**
- ESLint with jsx-a11y plugin
- Browser DevTools (Lighthouse)
- Screen reader (NVDA or VoiceOver)
- axe DevTools extension

### For Designers

**Guidelines:**
- Always check color contrast (7:1 minimum)
- Design visible focus states
- Ensure touch targets are ≥ 44×44px
- Consider keyboard navigation in workflows
- Provide text alternatives for icons

---

## 🚀 Continuous Improvement

### Weekly
- Run `npm run lint` before commits
- Test new features with keyboard navigation
- Check Lighthouse scores

### Monthly
- Full keyboard navigation test
- Screen reader audit of new features
- Review user feedback

### Quarterly
- Comprehensive accessibility audit
- Update documentation
- Team training session

---

## 📞 Support

For accessibility questions or to report issues:
- **Internal:** Contact the development team
- **External:** Accessibility feedback form (coming soon)

---

## 📅 Changelog

### October 2025
- ✅ Initial accessibility improvements
- ✅ ESLint plugin configured
- ✅ Enhanced keyboard navigation
- ✅ Improved color contrast
- ✅ Touch target sizing
- ✅ Reduced motion support
- ✅ Screen reader optimizations

---

**Last Updated:** October 14, 2025
**Maintained by:** Development Team
**Contact:** accessibility@southville8bnhs.edu.ph
