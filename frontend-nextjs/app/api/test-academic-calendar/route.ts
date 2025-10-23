// Test route for Academic Calendar API integration
// Tests all major endpoints and data structures

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAcademicCalendars, 
  getCurrentCalendar, 
  getCalendarById,
  getCalendarDays,
  getCalendarsByYear,
  getCalendarsByMonth,
  getUpcomingCalendarEvents
} from '@/lib/api/endpoints/academic-calendar';

export async function GET(request: NextRequest) {
  const results: any = {
    success: false,
    message: 'Academic Calendar API tests completed',
    timestamp: new Date().toISOString(),
    results: {}
  };

  try {
    console.log('🧪 Starting Academic Calendar API tests...');

    // Test 1: Get all academic calendars
    console.log('📡 Testing getAcademicCalendars()...');
    try {
      const calendarsResponse = await getAcademicCalendars({ 
        limit: 5, 
        include_days: true, 
        include_markers: true 
      });
      results.results.allCalendars = {
        success: true,
        message: `Found ${calendarsResponse.data.length} calendars`,
        data: calendarsResponse.data.map(cal => ({
          id: cal.id,
          year: cal.year,
          month_name: cal.month_name,
          term: cal.term,
          total_days: cal.total_days,
          days_count: cal.days?.length || 0,
          markers_count: cal.markers?.length || 0
        }))
      };
    } catch (error) {
      results.results.allCalendars = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 2: Get current calendar
    console.log('📡 Testing getCurrentCalendar()...');
    try {
      const currentCalendar = await getCurrentCalendar();
      results.results.currentCalendar = {
        success: true,
        message: currentCalendar ? `Found current calendar: ${currentCalendar.month_name} ${currentCalendar.year}` : 'No current calendar found',
        data: currentCalendar ? {
          id: currentCalendar.id,
          year: currentCalendar.year,
          month_name: currentCalendar.month_name,
          term: currentCalendar.term,
          total_days: currentCalendar.total_days
        } : null
      };
    } catch (error) {
      results.results.currentCalendar = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: Get calendars by year (2025)
    console.log('📡 Testing getCalendarsByYear(2025)...');
    try {
      const yearCalendars = await getCalendarsByYear('2025');
      results.results.yearCalendars = {
        success: true,
        message: `Found ${yearCalendars.length} calendars for 2025`,
        data: yearCalendars.map(cal => ({
          id: cal.id,
          month_name: cal.month_name,
          term: cal.term,
          total_days: cal.total_days
        }))
      };
    } catch (error) {
      results.results.yearCalendars = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 4: Get calendars by month (August)
    console.log('📡 Testing getCalendarsByMonth(August)...');
    try {
      const monthCalendars = await getCalendarsByMonth('August', '2025');
      results.results.monthCalendars = {
        success: true,
        message: `Found ${monthCalendars.length} August calendars`,
        data: monthCalendars.map(cal => ({
          id: cal.id,
          year: cal.year,
          term: cal.term,
          total_days: cal.total_days
        }))
      };
    } catch (error) {
      results.results.monthCalendars = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 5: Get upcoming calendar events
    console.log('📡 Testing getUpcomingCalendarEvents()...');
    try {
      const upcomingEvents = await getUpcomingCalendarEvents();
      results.results.upcomingEvents = {
        success: true,
        message: `Found ${upcomingEvents.length} upcoming calendar events`,
        data: upcomingEvents.map(event => ({
          id: event.id,
          date: event.date,
          day_of_week: event.day_of_week,
          is_holiday: event.is_holiday,
          is_current_day: event.is_current_day,
          note: event.note
        }))
      };
    } catch (error) {
      results.results.upcomingEvents = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 6: Get specific calendar with days (if we have any calendars)
    if (results.results.allCalendars?.success && results.results.allCalendars.data.length > 0) {
      const firstCalendar = results.results.allCalendars.data[0];
      console.log(`📡 Testing getCalendarById(${firstCalendar.id})...`);
      try {
        const calendarDetails = await getCalendarById(firstCalendar.id, true);
        results.results.calendarDetails = {
          success: true,
          message: `Retrieved calendar details for ${calendarDetails?.month_name} ${calendarDetails?.year}`,
          data: calendarDetails ? {
            id: calendarDetails.id,
            year: calendarDetails.year,
            month_name: calendarDetails.month_name,
            term: calendarDetails.term,
            total_days: calendarDetails.total_days,
            days_count: calendarDetails.days?.length || 0,
            markers_count: calendarDetails.markers?.length || 0
          } : null
        };
      } catch (error) {
        results.results.calendarDetails = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Determine overall success
    const testResults = Object.values(results.results);
    const successCount = testResults.filter((result: any) => result.success).length;
    const totalTests = testResults.length;
    
    results.success = successCount === totalTests;
    results.message = `Academic Calendar API tests completed: ${successCount}/${totalTests} tests passed`;

    console.log(`🎉 Academic Calendar API tests completed: ${successCount}/${totalTests} tests passed`);

  } catch (error) {
    console.error('❌ Academic Calendar API tests failed:', error);
    results.success = false;
    results.message = 'Academic Calendar API tests failed';
    results.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json(results);
}
