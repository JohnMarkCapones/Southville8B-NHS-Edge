/**
 * Event Schedule Timeline Component
 * 
 * Displays event schedule items in a beautiful timeline format.
 * Supports responsive design, hover effects, and accessibility.
 */

'use client';

import React from 'react';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EventSchedule } from '@/lib/api/types/events';

interface EventScheduleTimelineProps {
  schedule: EventSchedule[];
  className?: string;
  showIcons?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Event Schedule Timeline Component
 * 
 * @param schedule - Array of schedule items from the backend
 * @param className - Additional CSS classes
 * @param showIcons - Whether to show activity type icons
 * @param variant - Display variant (default, compact, detailed)
 */
export function EventScheduleTimeline({
  schedule,
  className,
  showIcons = true,
  variant = 'default'
}: EventScheduleTimelineProps) {
  // Safety check for undefined/null schedule
  const safeSchedule = Array.isArray(schedule) ? schedule : [];

  // Sort schedule by orderIndex, then by time
  const sortedSchedule = [...safeSchedule].sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }
    // Handle null/undefined activityTime values
    const timeA = a.activityTime || '';
    const timeB = b.activityTime || '';
    return timeA.localeCompare(timeB);
  });

  if (!sortedSchedule.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No schedule available for this event.</p>
      </div>
    );
  }

  const getActivityIcon = (description: string | null | undefined) => {
    if (!description) return <Clock className="h-4 w-4" />;
    
    const desc = description.toLowerCase();
    
    if (desc.includes('registration') || desc.includes('check-in')) {
      return <Users className="h-4 w-4" />;
    }
    if (desc.includes('break') || desc.includes('lunch') || desc.includes('coffee')) {
      return <Clock className="h-4 w-4" />;
    }
    if (desc.includes('location') || desc.includes('room') || desc.includes('venue')) {
      return <MapPin className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getActivityType = (description: string | null | undefined) => {
    if (!description) return 'activity';
    
    const desc = description.toLowerCase();
    
    if (desc.includes('registration') || desc.includes('check-in')) {
      return 'registration';
    }
    if (desc.includes('break') || desc.includes('lunch') || desc.includes('coffee')) {
      return 'break';
    }
    if (desc.includes('presentation') || desc.includes('speaker') || desc.includes('talk')) {
      return 'presentation';
    }
    if (desc.includes('workshop') || desc.includes('session')) {
      return 'workshop';
    }
    if (desc.includes('networking') || desc.includes('social')) {
      return 'networking';
    }
    return 'activity';
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'TBD';
    
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        {sortedSchedule.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            {showIcons && (
              <div className="flex-shrink-0">
                {getActivityIcon(item.activityDescription)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {formatTime(item.activityTime)}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    getActivityType(item.activityDescription) === 'break' && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                    getActivityType(item.activityDescription) === 'presentation' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    getActivityType(item.activityDescription) === 'workshop' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    getActivityType(item.activityDescription) === 'networking' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  )}
                >
                  {getActivityType(item.activityDescription)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {item.activityDescription}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("space-y-6", className)}>
        {sortedSchedule.map((item, index) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2",
                    "bg-background border-primary text-primary",
                    "relative z-10"
                  )}>
                    {showIcons ? (
                      getActivityIcon(item.activityDescription)
                    ) : (
                      <span className="text-sm font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  {index < sortedSchedule.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono">
                      {formatTime(item.activityTime)}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        getActivityType(item.activityDescription) === 'break' && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                        getActivityType(item.activityDescription) === 'presentation' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        getActivityType(item.activityDescription) === 'workshop' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        getActivityType(item.activityDescription) === 'networking' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      )}
                    >
                      {getActivityType(item.activityDescription)}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">
                    {item.activityDescription}
                  </h4>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Duration: Approximately 30-60 minutes</p>
                    <p>Location: Main Event Venue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-6">
        {sortedSchedule.map((item, index) => (
          <div key={item.id} className="relative flex items-start gap-4">
            {/* Timeline dot */}
            <div className={cn(
              "relative z-10 w-12 h-12 rounded-full flex items-center justify-center",
              "bg-background border-2 border-primary text-primary",
              "shadow-sm"
            )}>
              {showIcons ? (
                getActivityIcon(item.activityDescription)
              ) : (
                <span className="text-sm font-semibold">
                  {index + 1}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="font-mono text-sm">
                  {formatTime(item.activityTime)}
                </Badge>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs capitalize",
                    getActivityType(item.activityDescription) === 'break' && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                    getActivityType(item.activityDescription) === 'presentation' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    getActivityType(item.activityDescription) === 'workshop' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    getActivityType(item.activityDescription) === 'networking' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  )}
                >
                  {getActivityType(item.activityDescription)}
                </Badge>
              </div>
              
              <h4 className="font-semibold text-base mb-1">
                {item.activityDescription}
              </h4>
              
              <p className="text-sm text-muted-foreground">
                Scheduled for {formatTime(item.activityTime)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Event Schedule Summary Component
 * Shows a quick overview of the schedule
 */
export function EventScheduleSummary({ 
  schedule, 
  className 
}: { 
  schedule: EventSchedule[]; 
  className?: string; 
}) {
  const sortedSchedule = [...schedule].sort((a, b) => a.orderIndex - b.orderIndex);
  
  if (!sortedSchedule.length) {
    return null;
  }

  const startTime = sortedSchedule[0]?.activityTime;
  const endTime = sortedSchedule[sortedSchedule.length - 1]?.activityTime;
  const totalItems = sortedSchedule.length;

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>
          {startTime && endTime ? `${startTime} - ${endTime}` : 'Schedule available'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>{totalItems} activities</span>
      </div>
    </div>
  );
}
