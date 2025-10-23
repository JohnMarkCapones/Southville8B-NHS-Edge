/**
 * Test Events API Route
 * Simple API route to test the events backend connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllEventsApiTests } from '@/lib/api/test-events-connection';
import { testApiClient } from '@/lib/api/debug-client';
import { simpleApiTest } from '@/lib/api/simple-test';
import { getUpcomingEventsMinimal } from '@/lib/api/endpoints/events-minimal';
import { testClientFix } from '@/lib/api/test-client-fix';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Events API connection via API route...');
    
    // First test the apiClient itself
    const clientTest = testApiClient();
    console.log('🔍 API Client test result:', clientTest);
    
    // Test the client fix
    const clientFixTest = testClientFix();
    console.log('🔧 Client fix test result:', clientFixTest);
    
    // Try simple API test
    const simpleTest = await simpleApiTest();
    console.log('🔍 Simple API test result:', simpleTest);
    
    // Try minimal events API test
    const minimalTest = await getUpcomingEventsMinimal();
    console.log('🔍 Minimal events API test result:', minimalTest);
    
    const testResults = await runAllEventsApiTests();
    
    return NextResponse.json({
      success: testResults.success,
      message: testResults.message,
      timestamp: new Date().toISOString(),
      clientTest,
      clientFixTest,
      simpleTest,
      minimalTest,
      results: testResults.results
    });
    
  } catch (error) {
    console.error('❌ Events API test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Events API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
