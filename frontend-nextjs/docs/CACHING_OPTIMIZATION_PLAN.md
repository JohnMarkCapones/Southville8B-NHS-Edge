# Caching Optimization Plan
## Southville 8B NHS - Next.js 15 Frontend

**Objective**: Minimize server requests and Vercel function executions to reduce costs while maintaining excellent user experience.

**Current Stack**: Next.js 15.5.4 (App Router) + Vercel + REST API (pending)

---

## 1. RENDERING STRATEGY BY ROUTE TYPE

### A. Public/Guest Routes (`/guess/*`)
**Strategy**: Static Site Generation (SSG) + Incremental Static Regeneration (ISR)

**Routes**: Homepage, About, Academics, Athletics, Contact, Terms, Privacy, News, Events, Clubs, Announcements

**Implementation**:
```typescript
// app/guess/news/page.tsx
export const revalidate = 3600; // Revalidate every 1 hour

export default async function NewsPage() {
  const news = await fetch('https://api.example.com/news', {
    next: { revalidate: 3600 }
  });

  return <NewsContent data={news} />;
}
```

**Cache Duration**:
- Static content (About, Terms, Privacy): `revalidate: false` (never revalidate)
- Semi-static content (Academics, Athletics): `revalidate: 86400` (24 hours)
- Dynamic content (News, Events, Announcements): `revalidate: 3600` (1 hour)
- Clubs directory: `revalidate: 21600` (6 hours)

**Benefits**:
- Pages served from CDN edge (no function execution)
- First visitor triggers revalidation, subsequent visitors get cached version
- 99% of requests = 0 server cost

---

### B. Authenticated Routes (`/student/*`, `/teacher/*`, `/admin/*`)
**Strategy**: Server-Side Rendering (SSR) with aggressive caching + Client-side caching

**Implementation Layers**:

#### Layer 1: Route Segment Config
```typescript
// app/student/dashboard/page.tsx
export const dynamic = 'force-static'; // For pages that can be static
// OR
export const revalidate = 300; // 5 minutes for dynamic pages

// For personalized dashboards
export const fetchCache = 'force-cache';
export const revalidate = 60; // 1 minute
```

#### Layer 2: Fetch Cache Configuration
```typescript
// lib/api/client.ts
export async function fetchAPI(endpoint: string, options = {}) {
  return fetch(`${process.env.API_URL}${endpoint}`, {
    next: {
      revalidate: 300, // Default 5 minutes
      tags: ['api-data'] // For on-demand revalidation
    },
    ...options
  });
}
```

#### Layer 3: React Server Component Caching
```typescript
// app/student/dashboard/page.tsx
import { cache } from 'react';

const getStudentData = cache(async (studentId: string) => {
  return await fetchAPI(`/students/${studentId}`);
});

export default async function StudentDashboard() {
  const data = await getStudentData(studentId);
  // This data is cached for the duration of the request
  return <Dashboard data={data} />;
}
```

**Cache Duration by Content Type**:
- **User profile**: `revalidate: 300` (5 minutes)
- **Course listings**: `revalidate: 3600` (1 hour)
- **Grades**: `revalidate: 1800` (30 minutes)
- **Assignments list**: `revalidate: 600` (10 minutes)
- **Calendar events**: `revalidate: 900` (15 minutes)
- **Announcements**: `revalidate: 300` (5 minutes)

---

### C. Real-time/Interactive Features
**Strategy**: Client-side rendering with SWR/TanStack Query + optimistic updates

**Routes**: Quiz system, Live chat, Pomodoro timer, Real-time notifications

**Implementation**:
```typescript
// lib/hooks/useOptimizedFetch.ts
import useSWR from 'swr';

export function useStudentGrades(studentId: string) {
  return useSWR(
    `/api/students/${studentId}/grades`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute deduping
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );
}
```

**Benefits**:
- No server rendering cost
- Instant UI updates with optimistic rendering
- Background revalidation

---

## 2. API RESPONSE CACHING

### A. Next.js Route Handler Caching
```typescript
// app/api/courses/route.ts
export async function GET() {
  const courses = await db.courses.findMany();

  return Response.json(courses, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### B. Cache Control Headers Strategy

```typescript
// lib/cache-control.ts
export const CACHE_HEADERS = {
  // Never changes (static assets, legal pages)
  IMMUTABLE: 'public, max-age=31536000, immutable',

  // Rarely changes (academic curriculum, staff directory)
  LONG: 'public, s-maxage=86400, stale-while-revalidate=604800',

  // Changes daily (news, events, announcements)
  MEDIUM: 'public, s-maxage=3600, stale-while-revalidate=86400',

  // Changes hourly (dashboards, recent activities)
  SHORT: 'public, s-maxage=300, stale-while-revalidate=3600',

  // User-specific (private data)
  PRIVATE: 'private, max-age=60, stale-while-revalidate=300',

  // Real-time (no cache)
  NONE: 'no-store, must-revalidate',
};
```

**Apply to routes**:
```typescript
// app/api/news/route.ts
import { CACHE_HEADERS } from '@/lib/cache-control';

export async function GET() {
  const news = await fetchNews();

  return Response.json(news, {
    headers: { 'Cache-Control': CACHE_HEADERS.MEDIUM },
  });
}
```

---

## 3. CLIENT-SIDE CACHING LAYERS

### A. Browser Cache (Service Worker)
```typescript
// app/sw.ts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache static assets aggressively
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }

  // Cache API responses with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open('api-cache').then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### B. React Query / SWR Configuration
```typescript
// app/providers.tsx (add to existing Providers component)
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 300000, // 5 minutes
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // 1 minute
        shouldRetryOnError: false,
        fetcher: (url) => fetch(url).then((res) => res.json()),
      }}
    >
      {/* Existing providers */}
      {children}
    </SWRConfig>
  );
}
```

### C. In-Memory Cache for Static Data
```typescript
// lib/cache/memory-cache.ts
const cache = new Map<string, { data: any; expiry: number }>();

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

// Usage in API routes
export async function GET() {
  const cached = getCached('courses');
  if (cached) return Response.json(cached);

  const courses = await db.courses.findMany();
  setCache('courses', courses, 3600);

  return Response.json(courses);
}
```

---

## 4. IMAGE OPTIMIZATION

### Current Config (next.config.mjs)
✅ Already optimized with WebP/AVIF formats
✅ Device sizes configured
✅ Image sizes configured

### Additional Recommendations
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      quality={85} // Balance quality vs size
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..." // Low-quality placeholder
      {...props}
    />
  );
}
```

**Image Caching Strategy**:
- Store images in Vercel Blob Storage or external CDN (Cloudinary, ImageKit)
- Set long cache headers: `Cache-Control: public, max-age=31536000, immutable`
- Use responsive images with srcset

---

## 5. STATIC GENERATION OPTIMIZATION

### A. Partial Prerendering (Next.js 15 Feature)
```typescript
// next.config.mjs
export default {
  experimental: {
    ppr: true, // Enable Partial Prerendering
  },
};
```

```typescript
// app/student/dashboard/page.tsx
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <>
      {/* Static shell renders immediately */}
      <DashboardHeader />
      <Sidebar />

      {/* Dynamic content streams in */}
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
```

### B. Selective Static Generation
```typescript
// app/guess/clubs/[slug]/page.tsx
export async function generateStaticParams() {
  // Only generate top 10 most popular clubs at build time
  const clubs = await getTopClubs(10);

  return clubs.map((club) => ({
    slug: club.slug,
  }));
}

export const dynamicParams = true; // Generate others on-demand
export const revalidate = 3600; // Revalidate after 1 hour
```

---

## 6. VERCEL-SPECIFIC OPTIMIZATIONS

### A. Edge Functions for Global Performance
```typescript
// app/api/public-data/route.ts
export const runtime = 'edge'; // Run on Vercel Edge Network

export async function GET(request: Request) {
  const data = await fetchPublicData();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=86400',
      'Vercel-CDN-Cache-Control': 'public, max-age=86400',
    },
  });
}
```

### B. Edge Middleware for Authentication
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*', '/admin/:path*'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token) {
    return NextResponse.redirect(new URL('/guess/login', request.url));
  }

  // Cache authenticated responses per user
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, max-age=60');
  return response;
}

export const runtime = 'edge'; // Fast global authentication
```

### C. Vercel KV for Session Caching
```typescript
// lib/cache/kv-cache.ts
import { kv } from '@vercel/kv';

export async function getUserSession(userId: string) {
  const cached = await kv.get(`session:${userId}`);
  if (cached) return cached;

  const session = await fetchUserSession(userId);
  await kv.setex(`session:${userId}`, 300, session); // 5 minute cache

  return session;
}
```

---

## 7. DATA FETCHING PATTERNS

### A. Parallel Data Fetching
```typescript
// app/student/dashboard/page.tsx
export default async function Dashboard() {
  // Fetch in parallel, not sequential
  const [user, courses, grades, events] = await Promise.all([
    getUser(),
    getCourses(),
    getGrades(),
    getEvents(),
  ]);

  return <DashboardContent data={{ user, courses, grades, events }} />;
}
```

### B. Streaming with Suspense
```typescript
// app/student/grades/page.tsx
import { Suspense } from 'react';

export default function GradesPage() {
  return (
    <div>
      <h1>Your Grades</h1>

      {/* Show instant skeleton, stream in data */}
      <Suspense fallback={<GradesSkeleton />}>
        <GradesTable />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <PerformanceChart />
      </Suspense>
    </div>
  );
}
```

### C. Deduplication with React Cache
```typescript
// lib/data/courses.ts
import { cache } from 'react';

export const getCourses = cache(async () => {
  // Even if called multiple times in same request, only fetches once
  return await fetchAPI('/courses');
});
```

---

## 8. PREFETCHING & PRELOADING

### A. Link Prefetching
```typescript
// components/NavLink.tsx
import Link from 'next/link';

export function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      prefetch={true} // Prefetch on hover/viewport
    >
      {children}
    </Link>
  );
}
```

### B. Route Preloading
```typescript
// app/student/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Preload common routes on idle
    const preloadRoutes = [
      '/student/courses',
      '/student/assignments',
      '/student/grades',
    ];

    const timeouts = preloadRoutes.map((route, i) =>
      setTimeout(() => router.prefetch(route), i * 1000)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [router]);

  return children;
}
```

---

## 9. CACHE INVALIDATION STRATEGY

### A. Tag-Based Revalidation
```typescript
// app/actions/revalidate.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function updateNews(newsId: string) {
  // Update database
  await db.news.update({ id: newsId, ... });

  // Invalidate cache
  revalidateTag('news');
  revalidateTag(`news-${newsId}`);
}
```

```typescript
// Fetch with tags
export async function getNews() {
  return fetch('/api/news', {
    next: {
      revalidate: 3600,
      tags: ['news'],
    },
  });
}
```

### B. On-Demand Revalidation API
```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path, secret } = await request.json();

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }

  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

---

## 10. MONITORING & METRICS

### A. Vercel Analytics Integration
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### B. Custom Cache Hit Metrics
```typescript
// lib/metrics.ts
export function trackCacheHit(route: string, hit: boolean) {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'cache_hit', {
      route,
      hit: hit ? 'yes' : 'no',
    });
  }
}
```

---

## 11. IMPLEMENTATION PRIORITY

### Phase 1 (Week 1): Foundation
- [ ] Configure route segment cache settings
- [ ] Set up API response cache headers
- [ ] Implement memory cache for static data
- [ ] Configure SWR/React Query

### Phase 2 (Week 2): Static Generation
- [ ] Enable ISR for public routes
- [ ] Generate static params for dynamic routes
- [ ] Implement partial prerendering
- [ ] Set up edge functions

### Phase 3 (Week 3): Advanced Caching
- [ ] Implement Vercel KV for session cache
- [ ] Add tag-based revalidation
- [ ] Set up on-demand revalidation API
- [ ] Configure service worker

### Phase 4 (Week 4): Optimization & Monitoring
- [ ] Optimize images and assets
- [ ] Implement prefetching strategies
- [ ] Set up cache metrics
- [ ] Load testing and tuning

---

## 12. EXPECTED PERFORMANCE GAINS

### Before Optimization (Estimated)
- 100% requests hit server functions
- Average response time: 500-1000ms
- Vercel function executions: ~10,000/day
- Bandwidth: High (no CDN caching)

### After Optimization (Target)
- **95% requests served from CDN** (0 function execution)
- **5% requests hit server** (authenticated/real-time only)
- **Average response time**: 50-100ms (CDN edge)
- **Vercel function executions**: ~500/day (95% reduction)
- **Bandwidth**: Low (aggressive CDN caching)

### Cost Impact
- **Function executions**: 95% reduction
- **Bandwidth**: 80% reduction
- **Build time**: Optimized with selective static generation
- **Overall Vercel cost**: 85-90% reduction

---

## 13. CACHE CONFIGURATION SUMMARY

| Content Type | Rendering Strategy | Revalidate | Cache-Control |
|-------------|-------------------|-----------|---------------|
| Static pages (Terms, Privacy) | SSG | Never | `public, immutable` |
| About, Academics | SSG + ISR | 24 hours | `s-maxage=86400` |
| News, Events, Announcements | SSG + ISR | 1 hour | `s-maxage=3600, swr=86400` |
| Clubs directory | SSG + ISR | 6 hours | `s-maxage=21600, swr=86400` |
| Student dashboard | SSR | 5 minutes | `private, max-age=300` |
| Course listings | SSR | 1 hour | `private, max-age=3600` |
| Grades | SSR | 30 minutes | `private, max-age=1800` |
| Assignments | SSR | 10 minutes | `private, max-age=600` |
| Real-time features (Quiz) | CSR | Client-side | `no-store` |

---

## 14. NEXT STEPS

1. **Review this plan** - Ask any questions about implementation
2. **Choose starting phase** - Recommend starting with Phase 1
3. **API integration prep** - When REST API is ready, we'll integrate with caching
4. **Iterative implementation** - Implement, test, measure, optimize
5. **Monitor metrics** - Track cache hit rates and performance gains

---

## 15. QUESTIONS TO DISCUSS

Before implementation, let's clarify:

1. **API Endpoint Structure**: What will your REST API endpoints look like?
2. **Authentication Method**: JWT, session cookies, or other?
3. **Real-time Requirements**: Which features need instant updates vs can tolerate stale data?
4. **Content Update Frequency**: How often will teachers/admins update content?
5. **User Session Duration**: How long should authenticated cache last?

---

**Ready to implement?** Let me know which phase you'd like to start with, and I'll begin implementing the caching optimizations!
