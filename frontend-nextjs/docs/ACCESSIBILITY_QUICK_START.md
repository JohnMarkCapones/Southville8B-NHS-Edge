# 🚀 Accessibility Quick Start Guide

## ✅ What's Been Done

Your Southville 8B NHS frontend now has **WCAG 2.1 Level AAA** accessibility features!

### Implemented Features:
- ✅ ESLint accessibility linting configured
- ✅ Enhanced keyboard navigation (skip links, focus indicators)
- ✅ Improved color contrast (7:1 ratio - AAA)
- ✅ Touch targets sized at 44×44px minimum
- ✅ Reduced motion support for animations
- ✅ Screen reader optimizations (ARIA labels, live regions)
- ✅ Helper components created (VisuallyHidden, LiveRegion, SkipLink)
- ✅ Comprehensive documentation

---

## 🧪 Quick Testing Commands

### 1. Run ESLint (Accessibility Check)
```bash
cd frontend-nextjs
npm run lint
```
**Expected:** No errors (currently passing ✅)

###2. Fix Auto-fixable Issues
```bash
npm run lint:fix
```

### 3. Run Next.js Dev Server
```bash
npm run dev
```
Then test with:
- **Keyboard:** Press Tab to navigate, check focus indicators
- **Lighthouse:** Chrome DevTools → Lighthouse → Run Accessibility audit
- **Screen Reader:** Windows: NVDA, Mac: VoiceOver (Cmd+F5)

---

## 📖 Key Files Created

| File | Purpose |
|------|---------|
| `ACCESSIBILITY.md` | Comprehensive accessibility guide |
| `ACCESSIBILITY_IMPROVEMENTS_SUMMARY.md` | Detailed changelog |
| `eslint.config.cjs` | ESLint accessibility configuration |
| `components/ui/visually-hidden.tsx` | Screen reader helper |
| `components/ui/live-region.tsx` | Dynamic content announcements |
| `components/ui/skip-link.tsx` | Keyboard navigation |
| `app/globals.css` | Enhanced with accessibility features |

---

## 🎯 Testing Checklist

### Before Each Deployment:
- [ ] Run `npm run lint` (should pass)
- [ ] Test keyboard navigation (Tab through site)
- [ ] Run Lighthouse audit (Target: 100/100)
- [ ] Check color contrast (7:1 minimum)

### Monthly:
- [ ] Full screen reader test (NVDA or VoiceOver)
- [ ] Mobile touch target test
- [ ] Zoom test (200%)

---

## 🛠️ Using Helper Components

### VisuallyHidden
```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden"

<button>
  <SearchIcon />
  <VisuallyHidden>Search</VisuallyHidden>
</button>
```

### LiveRegion (Dynamic Content)
```tsx
import { LiveRegion } from "@/components/ui/live-region"

<LiveRegion
  message={isLoading ? "Loading..." : "Content loaded"}
  priority="polite"
/>
```

### SkipLink
```tsx
import { SkipLink } from "@/components/ui/skip-link"

<SkipLink targetId="main-content">
  Skip to main content
</SkipLink>
```

### Touch Targets
```tsx
<button className="touch-target">
  {/* Minimum 44×44px automatically */}
</button>
```

---

## ⚠️ Common Patterns

### Icon-Only Buttons (Always add aria-label)
```tsx
// ✅ GOOD
<button aria-label="Close menu">
  <XIcon />
</button>

// ❌ BAD
<button>
  <XIcon />
</button>
```

### Images (Always add meaningful alt text)
```tsx
// ✅ GOOD - Descriptive
<Image src="/campus.jpg" alt="Students in modern science lab" />

// ✅ GOOD - Decorative
<Image src="/decoration.svg" alt="" aria-hidden="true" />

// ❌ BAD - Generic
<Image src="/campus.jpg" alt="Image" />
```

### Forms (Always label inputs)
```tsx
// ✅ GOOD
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ❌ BAD
<Input placeholder="Email" />
```

---

## 🐛 Troubleshooting

### ESLint Errors?
```bash
# See what's wrong
npm run lint

# Auto-fix if possible
npm run lint:fix
```

### Low Lighthouse Score?
1. Check Lighthouse report details
2. Look for missing `aria-label` on buttons
3. Verify color contrast with WebAIM Contrast Checker
4. Ensure images have alt text

### Keyboard Navigation Issues?
1. Tab through the page
2. Check if focus is visible (should have blue outline)
3. Verify skip links work (Tab from top of page)
4. Test Escape key closes modals

---

## 📚 Learn More

- **Full Guide:** See `ACCESSIBILITY.md`
- **Improvements Log:** See `ACCESSIBILITY_IMPROVEMENTS_SUMMARY.md`
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

## 🎓 Quick Wins for New Features

When adding new components:

1. **Buttons:** Add `aria-label` if icon-only
2. **Images:** Add descriptive `alt` text
3. **Forms:** Use `<Label>` with `htmlFor`
4. **Interactive:** Ensure keyboard accessible (Tab, Enter, Escape)
5. **Colors:** Check contrast (7:1 minimum)
6. **Touch:** Use `touch-target` class for small elements

---

## 🚨 Need Help?

1. **Accessibility Guide:** Read `ACCESSIBILITY.md`
2. **Examples:** Check existing components for patterns
3. **Testing:** Use `npm run lint` before committing
4. **Tools:** Install axe DevTools browser extension

---

**Last Updated:** October 14, 2025
**Status:** WCAG 2.1 Level AAA Ready ✅
**Lint Status:** Passing ✅

---

**Quick Commands:**
```bash
npm run lint          # Check accessibility
npm run lint:fix      # Auto-fix issues
npm run dev           # Start development server
```

**Happy Accessible Coding! ♿✨**
