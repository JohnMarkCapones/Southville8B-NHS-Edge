// Academic Calendar API Types
// Based on backend entities: AcademicCalendar, AcademicCalendarDay, AcademicCalendarMarker

export interface AcademicCalendar {
  id: string;
  year: string;
  month_name: string;
  term: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  total_days: number;
  description?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  days?: AcademicCalendarDay[];
  markers?: AcademicCalendarMarker[];
}

export interface AcademicCalendarDay {
  id: number;
  academic_calendar_id: string;
  date: string; // ISO date string
  day_of_week: string;
  week_number: number;
  is_weekend: boolean;
  is_holiday: boolean;
  is_current_day: boolean;
  marker_icon?: string;
  marker_color?: string;
  note?: string;
  created_at: string;
  
  // Relations
  academic_calendar?: AcademicCalendar;
  markers?: AcademicCalendarMarker[];
}

export interface AcademicCalendarMarker {
  id: number;
  academic_calendar_id: string;
  academic_calendar_day_id?: number;
  color: string;
  icon?: string;
  label?: string;
  order_priority: number;
  created_at: string;
  
  // Relations
  academic_calendar?: AcademicCalendar;
  academic_calendar_day?: AcademicCalendarDay;
}

// Request/Response Types
export interface AcademicCalendarListResponse {
  data: AcademicCalendar[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AcademicCalendarQueryParams {
  year?: string;
  month_name?: string;
  term?: string;
  date?: string; // Filter calendars that include this date
  include_days?: boolean;
  include_markers?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'start_date' | 'end_date' | 'year' | 'month_name';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateAcademicCalendarDto {
  year: string;
  month_name: string;
  term: string;
  start_date: string;
  end_date: string;
  total_days: number;
  description?: string;
}

export interface UpdateAcademicCalendarDto {
  year?: string;
  month_name?: string;
  term?: string;
  start_date?: string;
  end_date?: string;
  total_days?: number;
  description?: string;
}

export interface CreateCalendarDayDto {
  academic_calendar_id: string;
  date: string;
  day_of_week: string;
  week_number: number;
  is_weekend?: boolean;
  is_holiday?: boolean;
  is_current_day?: boolean;
  marker_icon?: string;
  marker_color?: string;
  note?: string;
}

export interface UpdateCalendarDayDto {
  day_of_week?: string;
  week_number?: number;
  is_weekend?: boolean;
  is_holiday?: boolean;
  is_current_day?: boolean;
  marker_icon?: string;
  marker_color?: string;
  note?: string;
}

export interface CreateMarkerDto {
  academic_calendar_id: string;
  academic_calendar_day_id?: number;
  color: string;
  icon?: string;
  label?: string;
  order_priority?: number;
}

export interface UpdateMarkerDto {
  color?: string;
  icon?: string;
  label?: string;
  order_priority?: number;
}

// Frontend-specific types for calendar display
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  category: 
    | "academic"
    | "holiday"
    | "meeting"
    | "sports"
    | "exam"
    | "registration"
    | "deadline"
    | "celebration"
    | "break"
    | "orientation"
    | "workshop"
    | "club"
    | "volunteer";
  description?: string;
  location?: string;
  time?: string;
  color: string;
  priority?: "high" | "medium" | "low";
  source: "academic_calendar" | "events" | "manual";
  originalData?: AcademicCalendarDay | any; // Store original data for reference
}

// Utility types for data transformation
export interface CalendarDataMapping {
  mapAcademicDayToEvent: (day: AcademicCalendarDay) => CalendarEvent;
  mapEventToAcademicDay: (event: CalendarEvent) => Partial<AcademicCalendarDay>;
  getEventCategoryFromMarker: (marker: AcademicCalendarMarker) => CalendarEvent['category'];
  getEventColorFromMarker: (marker: AcademicCalendarMarker) => string;
}
