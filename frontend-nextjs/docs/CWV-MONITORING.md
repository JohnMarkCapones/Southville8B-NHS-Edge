# Core Web Vitals monitoring

This guide shows where to monitor real-user (field) and lab metrics for the site.

## Field metrics (real users)

- Vercel Analytics (already enabled)
  - After deploy, open your project in Vercel → Analytics → Web Vitals.
  - Watch LCP, INP (former FID), CLS. Filter by page and device.
  - Investigate regressions: click a metric → view affected routes.

- Google Search Console (GSC)
  - Add property (Domain preferred). Verify via DNS or file upload.
  - Open “Experience → Core Web Vitals” to see field data from Chrome UX Report.
  - Submit your sitemap: https://southville8bnhs.com/sitemap.xml under “Sitemaps”.
  - Use URL Inspection when you ship important changes.

## Lab metrics (synthetic)

- PageSpeed Insights (PSI)
  - Test key routes (/, /guess/event, /guess/announcements, /guess/enrollment).
  - Check both Mobile and Desktop. Record improvement trends.

## What to watch weekly

- LCP (aim < 2.5s mobile), INP (aim < 200ms), CLS (aim < 0.1)
- Largest/slowest pages (typical: homepage and media-heavy sections)
- Top Core Web Vitals issues in GSC
- Uptime and error rates (optional: add GA4 or Sentry)

## When to act

- If LCP worsens: audit hero media (use next/image priority), reduce JS, cache HTML (ISR).
- If INP worsens: delay non-critical scripts, reduce event listeners, avoid heavy JS on input.
- If CLS worsens: ensure images have dimensions/sizes; avoid late-loading fonts/layout shifts.

## Optional integrations

- GA4: add gtag.js to track engagement and funnels alongside Vercel Analytics.
- Sentry/LogRocket: observe JS errors and long tasks that hurt INP.
