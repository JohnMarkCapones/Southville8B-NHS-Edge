# SEO Audit (Baseline)

Date: 2025-10-12

## Scope
- App Router (Next.js) under `frontend-nextjs/app`
- Public areas: `/`, `/guess/*`
- Private areas (noindex): `/admin`, `/superadmin`, `/teacher`

## KPI Setup
- Core Web Vitals: LCP, CLS, INP (field + lab)
- Search: Impressions, Clicks, Avg Position, CTR
- Index Coverage: Valid, Excluded, Errors
- Conversions: (define if applicable)

See also: `docs/CWV-MONITORING.md` for where to view real-user Web Vitals (Vercel Analytics, GSC) and when to act.

## How to capture baseline
1. Run Lighthouse (mobile): `/`, `/guess/event`, an event detail, a news page.
2. Record scores (Performance, Accessibility, Best Practices, SEO) and CWV.
3. PageSpeed Insights for the same URLs.
4. Set up GSC (domain property), submit sitemap: `https://southville8bnhs.com/sitemap.xml`.
5. Export current Coverage and Enhancements.

Field metrics (after deploy):
- Vercel Analytics → Web Vitals (project dashboard)
- GSC → Experience → Core Web Vitals (mobile/desktop)

## Route inventory (fill in titles/descriptions/indexability)
- `/` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/about` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/academics` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/gallery` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/student-life` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/event` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/event/[slug]` — title: — desc: — indexable: yes — H1: — Links: — Notes:
- `/guess/news` — title: — desc: — indexable: yes — H1: — Links: — Notes:
 - `/guess/announcements` — title: — desc: — indexable: yes — H1: — Links: — Notes:
 - `/guess/announcements/[slug]` — title: — desc: — indexable: yes — H1: — Links: — Notes:
 - `/guess/enrollment` — title: — desc: — indexable: yes — H1: — Links: — Notes:
 - `/guess/portal` — title: — desc: — indexable: yes — H1: — Links: — Notes:

## Implemented (highlights)
- Global Metadata + per-page metadata on key public routes
- Robots and Sitemap (public routes + event and announcement slugs)
- Structured Data: Organization, WebSite (SearchAction), BreadcrumbList, Event, Article, HowTo
- Dynamic Open Graph image endpoint
- next/image conversions on prominent assets; dynamic imports for heavy widgets
- Accessibility: skip link, main landmark; font display swap
- ISR (revalidate) on homepage/events/news article
- Sitelinks search box eligibility and working `/search` endpoint
- Local SEO: Organization JSON-LD address set to Rodriguez, Rizal; About/Contact metadata updated

## Open actions / opportunities
- Expand visible Breadcrumbs UI across all public sections
- Add a visible address block (and optionally footer address) including barangay if desired
- EducationalOrganization schema with `geo` coordinates for stronger local signals
- FAQPage JSON-LD for Admissions/Financial Aid; more Article pages as news grows
- Continue dynamic imports for any client-heavy pages; review hero image priority for LCP
- Add eslint a11y rules; fix any flagged issues

## Validation checklist
- Rich Results Test: Homepage (Organization, WebSite), Event details (Event), News article (Article), Enrollment (HowTo)
- GSC Enhancements: Breadcrumbs, Sitelinks Search Box
- Page discovery: sitemap lists homepage, events, announcements, enrollment, portal

