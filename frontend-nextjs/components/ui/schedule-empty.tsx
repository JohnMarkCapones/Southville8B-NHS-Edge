/**
 * Schedule Empty State Component
 * 
 * Provides a friendly empty state when no schedule data is available.
 */

import { CalendarX, BookOpen, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScheduleEmptyProps {
  onRefresh?: () => void
  className?: string
}

export function ScheduleEmpty({ onRefresh, className }: ScheduleEmptyProps) {
  return (
    <div className={className}>
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-600/50 border-b border-slate-200/50 dark:border-slate-600/50 p-8">
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <CalendarX className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
            No Schedule Available
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Empty State Icon */}
            <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CalendarX className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Main Message */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Your schedule is not available yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                It looks like your class schedule hasn't been set up yet. This usually happens at the beginning of the school year or when schedules are being updated.
              </p>
            </div>

            {/* Helpful Information */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-4">
                What you can do:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Check with your teacher</p>
                    <p className="text-slate-600 dark:text-slate-400">Ask your homeroom teacher about your schedule</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Wait for updates</p>
                    <p className="text-slate-600 dark:text-slate-400">Schedules are usually updated weekly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Contact support</p>
                    <p className="text-slate-600 dark:text-slate-400">Reach out to the school office</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  className="flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Check Again</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <CalendarX className="w-4 h-4" />
                <span>Refresh Page</span>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-sm text-slate-500 dark:text-slate-500">
              <p>
                If you believe this is an error, please contact your teacher or the school administration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScheduleEmpty





