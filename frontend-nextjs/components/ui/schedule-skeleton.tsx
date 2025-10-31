/**
 * Schedule Skeleton Loading Component
 * 
 * Provides skeleton loading states for the schedule grid
 * to improve perceived performance during data fetching.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ScheduleSkeletonProps {
  className?: string
}

export function ScheduleSkeleton({ className }: ScheduleSkeletonProps) {
  return (
    <div className={className}>
      {/* Header Skeleton */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-600/50 border-b border-slate-200/50 dark:border-slate-600/50 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Statistics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-700/50 dark:to-slate-600/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                <div className="flex items-center space-x-3 mb-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Schedule Grid Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
            {/* Time Grid Skeleton */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700">
                    <th className="w-20 p-4 text-left border-r border-slate-200 dark:border-slate-600">
                      <Skeleton className="h-5 w-12" />
                    </th>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <th key={day} className="w-32 p-4 text-center border-r border-slate-200 dark:border-slate-600 last:border-r-0">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 9 }, (_, hourIndex) => (
                    <tr key={hourIndex} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                      <td className="w-20 p-4 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-600">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      {Array.from({ length: 5 }, (_, dayIndex) => (
                        <td key={dayIndex} className="w-32 h-16 p-2 border-r border-slate-200 dark:border-slate-600 last:border-r-0">
                          <div className="h-full">
                            {hourIndex % 3 === 0 && (
                              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 h-full">
                                <Skeleton className="h-3 w-20 mb-1" />
                                <Skeleton className="h-2 w-16 mb-1" />
                                <Skeleton className="h-2 w-12" />
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScheduleSkeleton


