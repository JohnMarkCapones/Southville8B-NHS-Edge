import { useState, useEffect, useMemo } from 'react';
import { fetchMySchedule } from '@/services/schedules';
import type { Schedule } from '@/lib/types/schedule';
import { DayOfWeek } from '@/lib/types/schedule';

interface WeeklySchedule {
  dayOfWeek: DayOfWeek;
  date: string;
  schedules: Schedule[];
}

interface UseWeeklyScheduleReturn {
  weeklySchedule: WeeklySchedule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasStudentProfile: boolean;
}

// Helper function to get date for a specific day of the week
function getDateForDayOfWeek(dayOfWeek: DayOfWeek): string {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const dayMap: { [key in DayOfWeek]: number } = {
    [DayOfWeek.SUNDAY]: 0,
    [DayOfWeek.MONDAY]: 1,
    [DayOfWeek.TUESDAY]: 2,
    [DayOfWeek.WEDNESDAY]: 3,
    [DayOfWeek.THURSDAY]: 4,
    [DayOfWeek.FRIDAY]: 5,
    [DayOfWeek.SATURDAY]: 6,
  };
  
  const targetDay = dayMap[dayOfWeek];
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  
  return targetDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// Helper function to format time from 24hr to 12hr
function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const minute = minutes;
  
  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `${hour}:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
}

export function useWeeklySchedule(): UseWeeklyScheduleReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStudentProfile, setHasStudentProfile] = useState(true);

  // Define the order of days in a week
  const weekOrder: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  const weeklySchedule = useMemo(() => {
    // Group schedules by day of the week
    const schedulesByDay = schedules.reduce((acc, schedule) => {
      if (!acc[schedule.dayOfWeek]) {
        acc[schedule.dayOfWeek] = [];
      }
      acc[schedule.dayOfWeek].push(schedule);
      return acc;
    }, {} as Record<DayOfWeek, Schedule[]>);

    // Create weekly schedule array with all days, but only include days that have schedules
    return weekOrder
      .map(dayOfWeek => ({
        dayOfWeek,
        date: getDateForDayOfWeek(dayOfWeek),
        schedules: schedulesByDay[dayOfWeek] || [],
      }))
      .filter(daySchedule => daySchedule.schedules.length > 0); // Only show days with schedules
  }, [schedules]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasStudentProfile(true);
      const data = await fetchMySchedule();
      setSchedules(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch schedule';
      
      if (err instanceof Error) {
        // Handle specific error cases
        if (err.message.includes('Student record not found') || err.message.includes('Student profile not found')) {
          errorMessage = 'Student profile not found. Please contact the administrator to set up your student profile.';
          setHasStudentProfile(false);
        } else if (err.message.includes('Failed to fetch student schedules')) {
          errorMessage = 'Schedule service is temporarily unavailable. This may be due to a database configuration issue. Please contact the administrator.';
        } else if (err.message.includes('Internal Server Error')) {
          errorMessage = 'Schedule service is experiencing technical difficulties. Please contact the administrator to resolve this issue.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    weeklySchedule,
    loading,
    error,
    refetch: fetchData,
    hasStudentProfile,
  };
}

export { formatTime };
