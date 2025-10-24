import { useState, useEffect, useMemo } from 'react';
import { fetchMySchedule } from '@/services/schedules';
import type { Schedule } from '@/lib/types/schedule';
import { DayOfWeek } from '@/lib/types/schedule';

interface UseMyScheduleReturn {
  schedules: Schedule[];
  todaysSchedules: Schedule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasStudentProfile: boolean;
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const minute = minutes;
  
  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
}

function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];
  return days[new Date().getDay()];
}

export function useMySchedule(): UseMyScheduleReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStudentProfile, setHasStudentProfile] = useState(true);

  const todaysSchedules = useMemo(() => {
    const today = getCurrentDayOfWeek();
    return schedules
      .filter(schedule => schedule.dayOfWeek === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
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
    schedules,
    todaysSchedules,
    loading,
    error,
    refetch: fetchData,
    hasStudentProfile,
  };
}

export { formatTime };
