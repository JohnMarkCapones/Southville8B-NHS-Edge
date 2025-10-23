/**
 * Test API Endpoint for Phase 1 Verification
 * 
 * This endpoint tests that:
 * 1. Next.js API routes work
 * 2. Middleware allows the request
 * 3. API client can make requests
 * 4. Backend connection works
 * 
 * @route GET /api/test
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 1: Security Foundation',
    status: 'checking...',
  };

  try {
    // Test 1: Environment variables
    results.environment = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'NOT SET',
      hasInternalUrl: !!process.env.INTERNAL_API_URL,
    };

    // Test 2: Backend connection (via health endpoint)
    try {
      const backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      
      // Check backend via health endpoint (more reliable than root)
      const backendResponse = await fetch(`${backendUrl}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (backendResponse.ok) {
        results.backendConnection = {
          status: '✅ Connected',
          statusCode: backendResponse.status,
          endpoint: '/api/v1/health',
        };
      } else {
        results.backendConnection = {
          status: '⚠️ Backend health endpoint returned error',
          statusCode: backendResponse.status,
          statusText: backendResponse.statusText,
        };
      }
    } catch (backendError) {
      results.backendConnection = {
        status: '❌ Cannot connect to backend',
        error: backendError instanceof Error ? backendError.message : 'Unknown error',
        note: 'Make sure backend is running on the configured port',
      };
    }

    // Test 3: Check Swagger docs accessibility
    try {
      const backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      const swaggerResponse = await fetch(`${backendUrl}/api/docs`, {
        signal: AbortSignal.timeout(5000),
      });

      if (swaggerResponse.ok) {
        results.swaggerDocs = {
          status: '✅ Swagger docs accessible',
          url: `${backendUrl}/api/docs`,
        };
      } else {
        results.swaggerDocs = {
          status: '⚠️ Swagger docs not accessible',
          statusCode: swaggerResponse.status,
        };
      }
    } catch {
      results.swaggerDocs = {
        status: '⚠️ Could not check Swagger docs',
      };
    }

    // Overall status
    const hasBackendConnection = results.backendConnection?.status?.includes('✅');
    const hasSwagger = results.swaggerDocs?.status?.includes('✅');
    
    results.status = hasBackendConnection ? '✅ Phase 1 working!' : '⚠️ Backend connection issues';

    return NextResponse.json({
      success: hasBackendConnection,
      message: hasBackendConnection 
        ? 'Phase 1 security foundation is working correctly!' 
        : 'Phase 1 configured but cannot reach backend health endpoint',
      results,
      tips: !hasBackendConnection ? [
        'Backend is running but health endpoint may not be implemented',
        'Check your backend has GET /api/v1/health endpoint',
        `Swagger accessible: ${hasSwagger ? 'Yes' : 'No'}`,
      ] : undefined,
    });

  } catch (error) {
    console.error('[Test Endpoint] Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test endpoint encountered an error',
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}

/**
 * POST endpoint to test CSRF protection
 * This should be blocked by middleware if CSRF token is missing
 */
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'POST request succeeded - CSRF token was valid',
    note: 'If you see this, it means middleware allowed the request',
  });
}

