/**
 * Simple API Test
 * Direct test of apiClient without complex imports
 */

import { apiClient } from './client';

export async function simpleApiTest() {
  try {
    console.log('🧪 Simple API test starting...');
    console.log('apiClient:', apiClient);
    console.log('apiClient.get:', apiClient.get);
    console.log('typeof apiClient.get:', typeof apiClient.get);
    
    // Try a simple GET request
    const result = await apiClient.get('/events/upcoming', { requiresAuth: false });
    console.log('✅ Simple API test successful:', result);
    
    return {
      success: true,
      message: 'Simple API test successful',
      data: result
    };
  } catch (error) {
    console.error('❌ Simple API test failed:', error);
    return {
      success: false,
      message: 'Simple API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
