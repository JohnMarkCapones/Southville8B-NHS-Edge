/**
 * Schedule Error Component
 * 
 * Provides user-friendly error states with retry functionality
 * for schedule data loading failures.
 */

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScheduleErrorProps {
  error: Error
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}

export function ScheduleError({ 
  error, 
  onRetry, 
  isRetrying = false, 
  className 
}: ScheduleErrorProps) {
  // Determine error type and appropriate messaging
  const getErrorInfo = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        icon: WifiOff,
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        action: "Retry Connection"
      }
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        icon: AlertCircle,
        title: "Authentication Required",
        description: "Your session has expired. Please log in again to view your schedule.",
        action: "Sign In Again"
      }
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        icon: AlertCircle,
        title: "Access Denied",
        description: "You don't have permission to view schedule data. Please contact your administrator.",
        action: "Contact Support"
      }
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        icon: AlertCircle,
        title: "Schedule Not Found",
        description: "No schedule data found for your account. Please contact your teacher or administrator.",
        action: "Contact Support"
      }
    }
    
    if (message.includes('timeout')) {
      return {
        icon: Wifi,
        title: "Request Timeout",
        description: "The request took too long to complete. Please try again.",
        action: "Try Again"
      }
    }
    
    // Generic error
    return {
      icon: AlertCircle,
      title: "Something went wrong",
      description: "We encountered an unexpected error while loading your schedule. Please try again.",
      action: "Try Again"
    }
  }

  const errorInfo = getErrorInfo(error)
  const Icon = errorInfo.icon

  return (
    <div className={className}>
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-red-200/50 dark:border-red-600/50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50/50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-red-200/50 dark:border-red-600/50 p-8">
          <CardTitle className="text-2xl font-bold text-red-800 dark:text-red-200 flex items-center">
            <Icon className="w-6 h-6 mr-3" />
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Error Alert */}
            <Alert variant="destructive" className="border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {errorInfo.description}
              </AlertDescription>
            </Alert>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Error Details (Development)
                </h4>
                <code className="text-xs text-red-600 dark:text-red-400 break-all">
                  {error.message}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>
                  {isRetrying ? 'Retrying...' : errorInfo.action}
                </span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>
                If the problem persists, please contact your teacher or administrator for assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScheduleError





