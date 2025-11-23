/**
 * ========================================
 * useAcademicCalendar Hook
 * ========================================
 * Custom React hook for managing academic calendar events
 *
 * Features:
 * - Fetch events for specific month
 * - Create, update, delete events
 * - Loading and error states
 * - Optimistic updates
 * - Category-based filtering
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import type { Event } from '@/lib/api/types/events';
import {
  getEventsForMonth,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendarCategory,
  mapCategoryToTagName,
} from '@/lib/api/endpoints/events';

interface UseAcademicCalendarOptions {
  initialYear?: number;
  initialMonth?: number;
}

export function useAcademicCalendar(options?: UseAcademicCalendarOptions) {
  const { toast } = useToast();
  const currentDate = new Date();

  // Fix: Make sure we're using the correct current month (November 2025 is month 11)
  const [year, setYear] = useState(options?.initialYear || currentDate.getFullYear());
  const [month, setMonth] = useState(options?.initialMonth || (currentDate.getMonth() + 1));
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load events for current year/month
   */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📅 Loading events for:', { year, month });
      const fetchedEvents = await getEventsForMonth(year, month);
      console.log('✅ Fetched events:', fetchedEvents);
      setEvents(fetchedEvents);
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error loading events:', error);
      setError(error);
      toast({
        title: 'Error Loading Events',
        description: error.message || 'Failed to load calendar events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [year, month, toast]);

  /**
   * Load events when year or month changes
   */
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /**
   * Navigate to previous month
   */
  const previousMonth = useCallback(() => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }, [year, month]);

  /**
   * Navigate to next month
   */
  const nextMonth = useCallback(() => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }, [year, month]);

  /**
   * Go to today's month
   */
  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }, []);

  /**
   * Go to specific month
   */
  const goToMonth = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  /**
   * Get events for a specific date
   */
  const getEventsForDate = useCallback((date: Date): Event[] => {
    const dateStr = date.toISOString().split('T')[0];

    return events.filter(event => {
      // Check if event spans this date
      const eventStartDate = event.date;
      // For now, we'll just match on the primary date
      // In the future, we can support multi-day events spanning date ranges
      return eventStartDate === dateStr;
    });
  }, [events]);

  /**
   * Create a new calendar event
   */
  const createCalendarEvent = useCallback(async (eventData: {
    title: string;
    description: string;
    category: 'holiday' | 'academic' | 'school-event' | 'professional' | 'no-class' | 'deadline';
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string;
    notes?: string;
    highlights?: string[];
    schedule?: { time: string; title: string }[];
    faqs?: { question: string; answer: string }[];
    additionalInfo?: string[];
    organizerId: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Map category to tag name
      const tagName = mapCategoryToTagName(eventData.category);

      // TODO: Get the actual tag ID from the backend
      // For now, we'll need to fetch tags first or pass tagIds differently
      // This is a placeholder - you'll need to implement tag fetching

      const newEvent = await createEvent({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        organizerId: eventData.organizerId,
        status: 'published',
        visibility: 'public',
        // These will be added via separate endpoints after event creation
        highlights: eventData.highlights?.map((text, index) => ({
          title: `Highlight ${index + 1}`,
          content: text,
          orderIndex: index,
        })),
        schedule: eventData.schedule?.map((item, index) => ({
          activityTime: item.time,
          activityDescription: item.title,
          orderIndex: index,
        })),
        faq: eventData.faqs,
        additionalInfo: eventData.additionalInfo?.map((text, index) => ({
          title: `Info ${index + 1}`,
          content: text,
          orderIndex: index,
        })),
      });

      // Optimistic update
      setEvents(prev => [...prev, newEvent]);

      toast({
        title: 'Event Created',
        description: `${eventData.title} has been added to the calendar`,
      });

      return newEvent;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error Creating Event',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Update an existing calendar event
   */
  const updateCalendarEvent = useCallback(async (
    eventId: string,
    updates: Partial<{
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      notes?: string;
    }>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const updatedEvent = await updateEvent(eventId, updates);

      // Optimistic update
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));

      toast({
        title: 'Event Updated',
        description: 'Event has been updated successfully',
      });

      return updatedEvent;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error Updating Event',
        description: error.message || 'Failed to update event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Delete a calendar event
   */
  const deleteCalendarEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteEvent(eventId);

      // Optimistic update
      setEvents(prev => prev.filter(e => e.id !== eventId));

      toast({
        title: 'Event Deleted',
        description: 'Event has been removed from the calendar',
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error Deleting Event',
        description: error.message || 'Failed to delete event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Duplicate an event
   */
  const duplicateCalendarEvent = useCallback(async (event: Event) => {
    setLoading(true);
    setError(null);

    try {
      const category = getCalendarCategory(event);

      if (!category) {
        throw new Error('Cannot duplicate event without a calendar category');
      }

      const newEvent = await createEvent({
        title: `${event.title} (Copy)`,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        organizerId: event.organizerId,
        status: 'published',
        visibility: 'public',
        highlights: event.highlights,
        schedule: event.schedule,
        faq: event.faq,
        additionalInfo: event.additionalInfo,
      });

      // Optimistic update
      setEvents(prev => [...prev, newEvent]);

      toast({
        title: 'Event Duplicated',
        description: `${newEvent.title} has been created`,
      });

      return newEvent;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error Duplicating Event',
        description: error.message || 'Failed to duplicate event',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Filter events by category
   */
  const filterByCategory = useCallback((
    category: 'all' | 'holiday' | 'academic' | 'school-event' | 'professional' | 'no-class' | 'deadline'
  ): Event[] => {
    if (category === 'all') return events;

    return events.filter(event => {
      const eventCategory = getCalendarCategory(event);
      return eventCategory === category;
    });
  }, [events]);

  return {
    // State
    year,
    month,
    events,
    loading,
    error,

    // Navigation
    previousMonth,
    nextMonth,
    goToToday,
    goToMonth,

    // Data fetching
    loadEvents,
    getEventsForDate,

    // CRUD operations
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    duplicateCalendarEvent,

    // Filtering
    filterByCategory,
  };
}
