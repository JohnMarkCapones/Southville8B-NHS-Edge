import { useState, useEffect, useCallback } from 'react';
import { eventsService } from '@/services/events';
import { Event } from '@/lib/types/event';

interface UseUpcomingEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUpcomingEvents = (): UseUpcomingEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log('[useUpcomingEvents] Starting to fetch events...');
    try {
      setLoading(true);
      setError(null);
      const response = await eventsService.getUpcomingEvents();
      console.log('[useUpcomingEvents] Response received:', response);
      setEvents(response.data);
    } catch (err: any) {
      console.error('[useUpcomingEvents] Error occurred:', err);
      setError(err.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { events, loading, error, refetch: fetchData };
};
