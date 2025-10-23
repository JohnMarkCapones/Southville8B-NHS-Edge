/**
 * Test Client Fix
 * Test if removing 'use client' fixed the apiClient issue
 */

import { apiClient } from './client';

export function testClientFix() {
  console.log('🔧 Testing client fix...');
  console.log('apiClient:', apiClient);
  console.log('apiClient type:', typeof apiClient);
  console.log('apiClient.get:', apiClient.get);
  console.log('typeof apiClient.get:', typeof apiClient.get);
  
  // Check if it's an instance of ApiClient
  console.log('apiClient constructor name:', apiClient.constructor.name);
  console.log('apiClient instanceof ApiClient:', apiClient instanceof Object);
  
  // Check available methods
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient));
  console.log('Available methods:', methods);
  
  return {
    success: typeof apiClient.get === 'function',
    message: typeof apiClient.get === 'function' ? 'Client fix successful!' : 'Client fix failed',
    details: {
      type: typeof apiClient,
      hasGet: typeof apiClient.get === 'function',
      hasPost: typeof apiClient.post === 'function',
      hasPatch: typeof apiClient.patch === 'function',
      hasDelete: typeof apiClient.delete === 'function',
      methods: methods
    }
  };
}
