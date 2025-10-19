/**
 * Debug API Client
 * Simple debug script to test apiClient import
 */

import { apiClient } from './client';

console.log('🔍 Debug API Client:');
console.log('apiClient:', apiClient);
console.log('apiClient type:', typeof apiClient);
console.log('apiClient.get:', typeof apiClient.get);
console.log('apiClient methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient)));

export function testApiClient() {
  console.log('🧪 Testing apiClient methods...');
  
  try {
    // Test if methods exist
    console.log('✅ apiClient.get exists:', typeof apiClient.get === 'function');
    console.log('✅ apiClient.post exists:', typeof apiClient.post === 'function');
    console.log('✅ apiClient.patch exists:', typeof apiClient.patch === 'function');
    console.log('✅ apiClient.delete exists:', typeof apiClient.delete === 'function');
    
    return {
      success: true,
      message: 'apiClient methods are available',
      methods: {
        get: typeof apiClient.get,
        post: typeof apiClient.post,
        patch: typeof apiClient.patch,
        delete: typeof apiClient.delete,
      }
    };
  } catch (error) {
    console.error('❌ apiClient test failed:', error);
    return {
      success: false,
      message: 'apiClient test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
