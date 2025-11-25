import { apiRequest } from '@/lib/api-client';
import { Event } from '@/lib/types/event';

export interface UpcomingEventsResponse {
  data: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const eventsService = {
  async getUpcomingEvents(): Promise<UpcomingEventsResponse> {
    console.log('[eventsService] Fetching events...');
    try {
      const response = await apiRequest<UpcomingEventsResponse>('/events');
      console.log('[eventsService] Success:', response);
      return response;
    } catch (error) {
      console.error('[eventsService] Error:', error);
      throw error;
    }
  },
};
