import { useState, useEffect } from 'react';
import { eventsService } from '@/services/events';
import { Event } from '@/lib/types/event';

export const useUpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log('[useUpcomingEvents] Starting to fetch events...');
      try {
        setLoading(true);
        const response = await eventsService.getUpcomingEvents();
        console.log('[useUpcomingEvents] Response received:', response);
        setEvents(response.data);
        setError(null);
      } catch (err: any) {
        console.error('[useUpcomingEvents] Error occurred:', err);
        setError(err.message || 'Failed to fetch events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};
