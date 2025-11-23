'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Award } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  isBefore,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  differenceInDays,
} from 'date-fns';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string | null;
  activityDates?: string[]; // Array of ISO date strings when user was active
  className?: string;
  variant?: 'month' | 'compact';
}

export function StreakCalendar({
  currentStreak,
  longestStreak,
  lastActivityDate,
  activityDates = [],
  className,
  variant = 'month',
}: StreakCalendarProps) {
  const today = new Date();
  const lastActivity = lastActivityDate ? new Date(lastActivityDate) : null;

  // Convert activity dates to Date objects for easier comparison
  const activityDateObjects = useMemo(() => {
    return activityDates.map((date) => new Date(date));
  }, [activityDates]);

  // Get calendar days for the current month
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get last 30 days for compact variant
  const last30Days = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });
  }, [today]);

  const isActiveDay = (date: Date) => {
    return activityDateObjects.some((activityDate) => isSameDay(activityDate, date));
  };

  const getDayStatus = (date: Date): 'active' | 'inactive' | 'today' | 'future' => {
    if (isToday(date)) return 'today';
    if (isBefore(today, date)) return 'future';
    return isActiveDay(date) ? 'active' : 'inactive';
  };

  const getDayClasses = (date: Date) => {
    const status = getDayStatus(date);

    const baseClasses = 'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all';

    if (status === 'today') {
      return cn(
        baseClasses,
        isActiveDay(date)
          ? 'bg-orange-500 text-white ring-2 ring-orange-300 shadow-md'
          : 'bg-blue-500 text-white ring-2 ring-blue-300'
      );
    }

    if (status === 'active') {
      return cn(baseClasses, 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300');
    }

    if (status === 'future') {
      return cn(baseClasses, 'text-muted-foreground/40');
    }

    return cn(baseClasses, 'text-muted-foreground hover:bg-muted/50');
  };

  // Calculate streak milestones
  const streakMilestones = [7, 14, 30, 60, 100, 365];
  const nextMilestone = streakMilestones.find((m) => m > currentStreak) || streakMilestones[streakMilestones.length - 1];
  const progressToNextMilestone = Math.round((currentStreak / nextMilestone) * 100);

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Activity Streak
            </h3>
            <Badge variant="secondary" className="text-sm">
              {currentStreak} days
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold">{longestStreak}</p>
            </div>
          </div>

          {/* Last 30 days mini calendar */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Last 30 days</p>
            <div className="grid grid-cols-10 gap-1">
              {last30Days.map((date) => {
                const status = getDayStatus(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'h-6 w-6 rounded',
                      status === 'today' && isActiveDay(date)
                        ? 'bg-orange-500'
                        : status === 'today'
                        ? 'bg-blue-500'
                        : status === 'active'
                        ? 'bg-orange-200 dark:bg-orange-900'
                        : 'bg-muted'
                    )}
                    title={format(date, 'MMM d, yyyy')}
                  />
                );
              })}
            </div>
          </div>

          {/* Next milestone */}
          {currentStreak > 0 && currentStreak < nextMilestone && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next milestone</span>
                <span className="font-medium">{nextMilestone} days</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                  style={{ width: `${progressToNextMilestone}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {nextMilestone - currentStreak} days to go
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Full month calendar view
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              {format(today, 'MMMM yyyy')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your daily activity streak
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Current Streak</p>
                <p className="text-3xl font-bold">{currentStreak}</p>
                <p className="text-xs text-white/80">days</p>
              </div>
              <Flame className="h-10 w-10 text-white/80" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold">{longestStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">
                  {activityDateObjects.filter((date) => {
                    return date >= monthStart && date <= monthEnd;
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">active days</p>
              </div>
              <Award className="h-10 w-10 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="flex h-10 items-center justify-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date >= monthStart && date <= monthEnd;
              return (
                <div
                  key={index}
                  className={cn(
                    getDayClasses(date),
                    !isCurrentMonth && 'opacity-40'
                  )}
                  title={`${format(date, 'MMM d, yyyy')}${isActiveDay(date) ? ' - Active' : ''}`}
                >
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-500" />
            <span className="text-sm text-muted-foreground">Today (Active)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500" />
            <span className="text-sm text-muted-foreground">Today (Inactive)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-100 dark:bg-orange-950" />
            <span className="text-sm text-muted-foreground">Active Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Inactive</span>
          </div>
        </div>

        {/* Next milestone progress */}
        {currentStreak > 0 && currentStreak < nextMilestone && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next milestone: {nextMilestone} days</span>
              <span className="text-sm text-muted-foreground">
                {nextMilestone - currentStreak} days to go
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                style={{ width: `${progressToNextMilestone}%` }}
              />
            </div>
          </div>
        )}

        {/* Streak achievement message */}
        {currentStreak >= 7 && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              {currentStreak >= 365
                ? 'Incredible! You have a full year streak! 🎉'
                : currentStreak >= 100
                ? 'Amazing! You have a 100+ day streak! 🔥'
                : currentStreak >= 30
                ? 'Great work! You have a month-long streak! 🌟'
                : currentStreak >= 14
                ? 'Excellent! Two weeks in a row! 💪'
                : 'Nice! You have a week-long streak! 🎯'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
