/**
 * Minimal Events API Endpoints
 * Simplified version to test apiClient integration
 */

import { apiClient } from '../client';

/**
 * Get upcoming events (minimal test)
 */
export async function getUpcomingEventsMinimal() {
  try {
    console.log('🧪 Testing minimal events API...');
    console.log('apiClient:', apiClient);
    console.log('apiClient.get:', apiClient.get);
    console.log('typeof apiClient.get:', typeof apiClient.get);
    
    const result = await apiClient.get('/events/upcoming', { requiresAuth: false });
    console.log('✅ Minimal events API successful:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Minimal events API failed:', error);
    throw error;
  }
}
