// Academic Calendar API Endpoints
// Provides functions to interact with the academic calendar backend API

import { apiClient } from '../client';
import type {
  AcademicCalendar,
  AcademicCalendarDay,
  AcademicCalendarMarker,
  AcademicCalendarListResponse,
  AcademicCalendarQueryParams,
  CreateAcademicCalendarDto,
  UpdateAcademicCalendarDto,
  CreateCalendarDayDto,
  UpdateCalendarDayDto,
  CreateMarkerDto,
  UpdateMarkerDto,
} from '../types/academic-calendar';

/**
 * Get all academic calendars with optional filtering and pagination
 */
export async function getAcademicCalendars(
  params?: AcademicCalendarQueryParams
): Promise<AcademicCalendarListResponse> {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  if (params?.year) queryParams.append('year', params.year);
  if (params?.month_name) queryParams.append('month_name', params.month_name);
  if (params?.term) queryParams.append('term', params.term);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.include_days !== undefined) queryParams.append('includeDays', params.include_days.toString());
  if (params?.include_markers !== undefined) queryParams.append('includeMarkers', params.include_markers.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/academic-calendar${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<AcademicCalendarListResponse>(endpoint, { requiresAuth: false });
}

/**
 * Get the current month's academic calendar
 */
export async function getCurrentCalendar(): Promise<AcademicCalendar | null> {
  try {
    const response = await apiClient.get<AcademicCalendar>('/academic-calendar/current', { requiresAuth: false });
    return response;
  } catch (error) {
    console.error('Error fetching current calendar:', error);
    return null;
  }
}

/**
 * Get a specific academic calendar by ID
 */
export async function getCalendarById(
  id: string,
  includeDays: boolean = true
): Promise<AcademicCalendar | null> {
  try {
    const queryParams = new URLSearchParams();
    if (includeDays) queryParams.append('includeDays', 'true');
    
    const queryString = queryParams.toString();
    const endpoint = `/academic-calendar/${id}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<AcademicCalendar>(endpoint, { requiresAuth: false });
    return response;
  } catch (error) {
    console.error(`Error fetching calendar ${id}:`, error);
    return null;
  }
}

/**
 * Get all days for a specific academic calendar
 */
export async function getCalendarDays(calendarId: string): Promise<AcademicCalendarDay[]> {
  try {
    const response = await apiClient.get<AcademicCalendarDay[]>(`/academic-calendar/${calendarId}/days`, { requiresAuth: false });
    return response;
  } catch (error) {
    console.error(`Error fetching calendar days for ${calendarId}:`, error);
    return [];
  }
}

/**
 * Create a new academic calendar (Admin only)
 */
export async function createAcademicCalendar(
  data: CreateAcademicCalendarDto
): Promise<AcademicCalendar> {
  return apiClient.post<AcademicCalendar>('/academic-calendar', data);
}

/**
 * Update an academic calendar (Admin only)
 */
export async function updateAcademicCalendar(
  id: string,
  data: UpdateAcademicCalendarDto
): Promise<AcademicCalendar> {
  return apiClient.patch<AcademicCalendar>(`/academic-calendar/${id}`, data);
}

/**
 * Delete an academic calendar (Admin only)
 */
export async function deleteAcademicCalendar(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/academic-calendar/${id}`);
}

/**
 * Regenerate calendar days for a specific calendar (Admin only)
 */
export async function regenerateCalendarDays(calendarId: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/academic-calendar/${calendarId}/generate-days`);
}

/**
 * Update a specific calendar day (Admin only)
 */
export async function updateCalendarDay(
  dayId: number,
  data: UpdateCalendarDayDto
): Promise<AcademicCalendarDay> {
  return apiClient.patch<AcademicCalendarDay>(`/academic-calendar/days/${dayId}`, data);
}

/**
 * Add a marker to a calendar (Admin only)
 */
export async function addCalendarMarker(
  calendarId: string,
  data: CreateMarkerDto
): Promise<AcademicCalendarMarker> {
  return apiClient.post<AcademicCalendarMarker>(`/academic-calendar/${calendarId}/markers`, data);
}

/**
 * Add a marker to a specific calendar day (Admin only)
 */
export async function addDayMarker(
  dayId: number,
  data: CreateMarkerDto
): Promise<AcademicCalendarMarker> {
  return apiClient.post<AcademicCalendarMarker>(`/academic-calendar/days/${dayId}/markers`, data);
}

/**
 * Update current day flag for all calendar days (Admin only)
 */
export async function updateCurrentDay(): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/academic-calendar/update-current-day');
}

// Utility functions for common operations

/**
 * Get calendars for a specific year
 */
export async function getCalendarsByYear(year: string): Promise<AcademicCalendar[]> {
  const response = await getAcademicCalendars({ 
    year, 
    include_days: true, 
    include_markers: true,
    limit: 50 
  });
  return response.data;
}

/**
 * Get calendars for a specific month
 */
export async function getCalendarsByMonth(monthName: string, year?: string): Promise<AcademicCalendar[]> {
  const params: AcademicCalendarQueryParams = { 
    month_name: monthName,
    include_days: true, 
    include_markers: true,
    limit: 50 
  };
  
  if (year) {
    params.year = year;
  }
  
  const response = await getAcademicCalendars(params);
  return response.data;
}

/**
 * Get calendars for a specific term
 */
export async function getCalendarsByTerm(term: string): Promise<AcademicCalendar[]> {
  const response = await getAcademicCalendars({ 
    term, 
    include_days: true, 
    include_markers: true,
    limit: 50 
  });
  return response.data;
}

/**
 * Get calendars that include a specific date
 */
export async function getCalendarsByDate(date: string): Promise<AcademicCalendar[]> {
  const response = await getAcademicCalendars({ 
    date, 
    include_days: true, 
    include_markers: true,
    limit: 50 
  });
  return response.data;
}

/**
 * Get upcoming calendar events (next 30 days)
 */
export async function getUpcomingCalendarEvents(): Promise<AcademicCalendarDay[]> {
  try {
    // Get current calendar first
    const currentCalendar = await getCurrentCalendar();
    if (!currentCalendar) {
      return [];
    }

    // Get all days for current calendar
    const days = await getCalendarDays(currentCalendar.id);
    
    // Filter for upcoming days (next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return days.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= today && dayDate <= thirtyDaysFromNow;
    });
  } catch (error) {
    console.error('Error fetching upcoming calendar events:', error);
    return [];
  }
}
