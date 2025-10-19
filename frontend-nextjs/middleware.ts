/**
 * Next.js Middleware - Security Foundation
 * 
 * Handles CSRF protection, rate limiting, token validation,
 * and security headers for all requests.
 * 
 * Runs at the Edge Runtime for optimal performance.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Simple in-memory rate limiter
 * 
 * NOTE: In production, replace with Redis for distributed rate limiting
 * This implementation will not work across multiple server instances
 */
interface RateLimitEntry {
  requests: number[];  // Array of request timestamps
  lastCleanup: number; // Last cleanup timestamp
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup rate limit store every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastGlobalCleanup = Date.now();

/**
 * Clean up old rate limit entries to prevent memory leak
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 10 * 60 * 1000; // Remove entries older than 10 minutes

  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove if no requests in last 10 minutes
    if (now - entry.lastCleanup > CLEANUP_THRESHOLD) {
      rateLimitStore.delete(key);
    }
  }

  lastGlobalCleanup = now;
}

/**
 * Check if request should be rate limited
 * 
 * @param identifier - Unique identifier (IP + endpoint)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limit exceeded
 */
function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();

  // Get or create entry
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { requests: [], lastCleanup: now };
    rateLimitStore.set(identifier, entry);
  }

  // Remove requests outside the window
  entry.requests = entry.requests.filter(time => now - time < windowMs);
  entry.lastCleanup = now;

  // Check if limit exceeded
  if (entry.requests.length >= limit) {
    return false;
  }

  // Add current request
  entry.requests.push(now);
  return true;
}

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generate CSRF token
 * 
 * In production, use crypto.randomBytes for better security
 */
function generateCsrfToken(): string {
  // Simple random token generation
  // In production, use: crypto.randomBytes(32).toString('hex')
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;

  // Periodic cleanup of rate limit store
  if (Date.now() - lastGlobalCleanup > CLEANUP_INTERVAL) {
    cleanupRateLimitStore();
  }

  // ========================================
  // 1. CSRF PROTECTION
  // ========================================

  // Generate CSRF token for new sessions (all requests)
  const existingCsrfToken = request.cookies.get('csrf-token')?.value;
  
  if (!existingCsrfToken) {
    const newCsrfToken = generateCsrfToken();
    response.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: false, // Client needs to read this for API calls
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    console.log('[Middleware] ✅ Generated new CSRF token for session');
  }

  // Validate CSRF for mutations (POST, PUT, DELETE, PATCH)
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (isMutation) {
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    // Check if this is a Next.js Server Action
    // Server Actions have built-in CSRF protection via Next-Action header
    const isServerAction = request.headers.has('Next-Action') || 
                          request.headers.get('content-type')?.includes('multipart/form-data') ||
                          request.headers.get('next-action') !== null;

    // Skip CSRF validation for:
    // 1. Next.js internal routes (/_next)
    // 2. Next.js Server Actions (have built-in protection)
    // 3. Auth endpoints that handle their own CSRF
    const skipCSRF = pathname.startsWith('/_next') || 
                     isServerAction ||
                     pathname.startsWith('/api/auth/login') ||
                     pathname === '/api/auth/callback';

    if (!skipCSRF) {
      if (!csrfCookie || !csrfHeader) {
        console.log(`[Middleware] ❌ CSRF token missing for ${method} ${pathname}`);
        return NextResponse.json(
          { 
            error: 'CSRF token missing',
            message: 'Cross-Site Request Forgery token is required for this action'
          },
          { status: 403 }
        );
      }

      if (csrfCookie !== csrfHeader) {
        console.log(`[Middleware] ❌ CSRF token mismatch for ${method} ${pathname}`);
        return NextResponse.json(
          { 
            error: 'Invalid CSRF token',
            message: 'Cross-Site Request Forgery token validation failed'
          },
          { status: 403 }
        );
      }

      console.log(`[Middleware] ✅ CSRF validated for ${method} ${pathname}`);
    } else if (isServerAction) {
      console.log(`[Middleware] ✅ Server Action detected, skipping CSRF for ${method} ${pathname}`);
    }
  }

  // ========================================
  // 2. RATE LIMITING
  // ========================================

  // Get client identifier (IP address)
  const clientIp = request.ip || 
                   request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Global rate limit: 100 requests per minute
  const globalIdentifier = `${clientIp}:global`;
  const globalAllowed = checkRateLimit(globalIdentifier, 100, 60000);

  if (!globalAllowed) {
    console.log(`[Middleware] ❌ Global rate limit exceeded for ${clientIp}`);
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: 60 // seconds
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000),
        }
      }
    );
  }

  // Endpoint-specific rate limits
  const endpointLimits: Record<string, { limit: number; window: number }> = {
    '/api/modules': { limit: 10, window: 60000 }, // 10 uploads per minute
    '/api/quiz': { limit: 20, window: 60000 },    // 20 quiz operations per minute
    '/api/auth/login': { limit: 5, window: 60000 }, // 5 login attempts per minute
  };

  for (const [pathPrefix, { limit, window }] of Object.entries(endpointLimits)) {
    if (pathname.startsWith(pathPrefix)) {
      const endpointIdentifier = `${clientIp}:${pathPrefix}`;
      const allowed = checkRateLimit(endpointIdentifier, limit, window);

      if (!allowed) {
        console.log(`[Middleware] ❌ Rate limit exceeded for ${clientIp} on ${pathPrefix}`);
        return NextResponse.json(
          { 
            error: 'Too many requests',
            message: `You have exceeded the rate limit for ${pathPrefix}. Please try again later.`,
            retryAfter: Math.ceil(window / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(window / 1000)),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
            }
          }
        );
      }
    }
  }

  // ========================================
  // 3. TOKEN VALIDATION & REFRESH
  // ========================================

  // Define public routes that don't require authentication
  const publicPaths = [
    '/guess',           // Guest pages (login, announcements, events, etc.)
    '/_next',           // Next.js internals
    '/api/auth',        // Auth endpoints
    '/api/test',        // Test endpoint
    '/api/test-clubs',  // Clubs API test endpoint
    '/api/test-clubs-simple', // Simple clubs API test endpoint
    '/api/simple-clubs-test', // Simple clubs test endpoint
    '/api/debug-clubs', // Clubs debug endpoint
    '/favicon.ico',     // Favicon
    '/api/announcements', // Public announcements (if any)
    '/videos',          // Public video files
    '/images',          // Public image files
    '/.well-known',     // Well-known URIs (for various protocols)
  ];

  // Root path should redirect to /guess (homepage), not require auth
  const isRootPath = pathname === '/';
  
  // Check if current path is public
  const isPublicPath = isRootPath || publicPaths.some(path => pathname.startsWith(path));
  
  // Log path check for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${pathname}, Public: ${isPublicPath}, Root: ${isRootPath}`);
  }

  // If not public, check for authentication token
  if (!isPublicPath) {
    const token = request.cookies.get('sb-access-token')?.value;
    const tokenExpiresAt = request.cookies.get('sb-token-expires')?.value;

    if (!token) {
      console.log(`[Middleware] ❌ No auth token for protected route: ${pathname}`);
      
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            message: 'Authentication required'
          },
          { status: 401 }
        );
      }

      // For page routes, redirect to login
      const loginUrl = new URL('/guess/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check token expiry (if available)
    if (tokenExpiresAt) {
      const expiryTimestamp = parseInt(tokenExpiresAt);
      const now = Math.floor(Date.now() / 1000); // Current time in seconds

      if (expiryTimestamp <= now) {
        console.log(`[Middleware] ❌ Token expired for ${pathname}`);
        
        // Token expired - redirect to login
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { 
              error: 'Token expired',
              message: 'Your session has expired. Please log in again.'
            },
            { status: 401 }
          );
        }

        const loginUrl = new URL('/guess/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('session_expired', '1');
        return NextResponse.redirect(loginUrl);
      }

      // Token is valid but will expire soon (within 5 minutes)
      // Set a header to indicate client should refresh token
      const timeUntilExpiry = expiryTimestamp - now;
      if (timeUntilExpiry < 5 * 60) {
        response.headers.set('X-Token-Refresh-Required', 'true');
        console.log(`[Middleware] ⚠️ Token expiring soon for ${pathname} (${timeUntilExpiry}s remaining)`);
      }
    }

    console.log(`[Middleware] ✅ Auth token valid for ${pathname}`);
  }

  // ========================================
  // 4. SECURITY HEADERS
  // ========================================

  // Add security headers to response
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Strict-Transport-Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

/**
 * Configure which routes the middleware applies to
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (images, videos, fonts, etc.)
     * - .well-known paths
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|ogg|mp3|wav|pdf|woff|woff2|ttf|otf)$).*)',
  ],
};

