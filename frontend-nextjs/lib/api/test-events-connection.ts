/**
 * Test Events API Connection
 * Simple test to verify the events API is working
 */

import { getUpcomingEvents, getEvents } from './endpoints/events';
import { EventStatus } from './types/events';

/**
 * Test basic events API connectivity
 * 
 * @returns Promise with test results
 */
export async function testEventsApiConnection(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    console.log('🧪 Testing Events API connection...');
    
    // Test 1: Get upcoming events (public endpoint)
    console.log('📡 Testing getUpcomingEvents()...');
    const upcomingEvents = await getUpcomingEvents();
    console.log('✅ getUpcomingEvents() successful:', upcomingEvents.length, 'events found');
    
    // Test 2: Get all events with basic pagination
    console.log('📡 Testing getEvents() with pagination...');
    const allEvents = await getEvents({ 
      page: 1, 
      limit: 5,
      status: EventStatus.PUBLISHED 
    });
    console.log('✅ getEvents() successful:', allEvents.data.length, 'events found');
    console.log('📊 Pagination info:', allEvents.pagination);
    
    return {
      success: true,
      message: 'Events API connection successful!',
      data: {
        upcomingEvents: upcomingEvents.length,
        totalEvents: allEvents.pagination.total,
        sampleEvents: allEvents.data.slice(0, 2) // First 2 events as sample
      }
    };
    
  } catch (error) {
    console.error('❌ Events API connection failed:', error);
    
    return {
      success: false,
      message: 'Events API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test events API with different filters
 * 
 * @returns Promise with test results
 */
export async function testEventsApiFilters(): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    console.log('🧪 Testing Events API filters...');
    
    const tests = [];
    
    // Test different filters
    const filterTests = [
      { name: 'Published events', params: { status: EventStatus.PUBLISHED } },
      { name: 'Public events', params: { visibility: 'public' } },
      { name: 'Limited results', params: { limit: 3 } },
      { name: 'Search query', params: { search: 'event' } }
    ];
    
    for (const test of filterTests) {
      try {
        console.log(`📡 Testing: ${test.name}...`);
        const result = await getEvents(test.params);
        tests.push({
          name: test.name,
          success: true,
          count: result.data.length,
          pagination: result.pagination
        });
        console.log(`✅ ${test.name}: ${result.data.length} events found`);
      } catch (error) {
        tests.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`❌ ${test.name}: Failed`);
      }
    }
    
    return {
      success: true,
      message: 'Events API filter tests completed',
      data: { tests }
    };
    
  } catch (error) {
    console.error('❌ Events API filter tests failed:', error);
    
    return {
      success: false,
      message: 'Events API filter tests failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run all events API tests
 * 
 * @returns Promise with comprehensive test results
 */
export async function runAllEventsApiTests(): Promise<{
  success: boolean;
  message: string;
  results: {
    connection: any;
    filters: any;
  };
}> {
  console.log('🚀 Starting comprehensive Events API tests...');
  
  const connectionTest = await testEventsApiConnection();
  const filterTest = await testEventsApiFilters();
  
  const allSuccess = connectionTest.success && filterTest.success;
  
  console.log(allSuccess ? '🎉 All Events API tests passed!' : '⚠️ Some Events API tests failed');
  
  return {
    success: allSuccess,
    message: allSuccess ? 'All Events API tests passed!' : 'Some Events API tests failed',
    results: {
      connection: connectionTest,
      filters: filterTest
    }
  };
}
