/**
 * Rate Limit Warning Component
 * 
 * Displays beautiful lockout warnings with countdown timers
 * and progress indicators for failed login attempts
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  Lock, 
  Timer,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRemainingTime, getLockoutLevelInfo } from '@/lib/hooks/use-progressive-rate-limit';

interface RateLimitWarningProps {
  isLockedOut: boolean;
  remainingTime: number;
  lockoutLevel: number;
  attemptCount: number;
  onReset?: () => void;
  className?: string;
}

export function RateLimitWarning({
  isLockedOut,
  remainingTime,
  lockoutLevel,
  attemptCount,
  onReset,
  className
}: RateLimitWarningProps) {
  const lockoutInfo = getLockoutLevelInfo(lockoutLevel);
  
  // Don't show anything if not locked out and no attempts
  if (!isLockedOut && attemptCount === 0) {
    return null;
  }

  // Show attempt progress if not locked out but has attempts
  if (!isLockedOut && attemptCount > 0) {
    const nextLevel = LOCKOUT_LEVELS.find(level => level.attempts > attemptCount);
    const progress = nextLevel ? (attemptCount / nextLevel.attempts) * 100 : 100;
    
    return (
      <Card className={cn("border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-amber-800 dark:text-amber-200 text-lg">
              Login Attempts Warning
            </CardTitle>
          </div>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            You have {attemptCount} failed login attempt{attemptCount !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 dark:text-amber-300">Progress to lockout:</span>
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                {attemptCount}/{nextLevel?.attempts || 'MAX'}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              // @ts-ignore - custom class for warning state
              data-state="warning"
            />
          </div>
          
          {nextLevel && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {nextLevel.attempts - attemptCount} more failed attempt{nextLevel.attempts - attemptCount !== 1 ? 's' : ''} will result in a {nextLevel.name} lockout.
            </p>
          )}
          
          {onReset && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Attempts
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show lockout warning
  if (isLockedOut && lockoutInfo) {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    return (
      <Card className={cn("border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-red-800 dark:text-red-200 text-lg">
              Account Temporarily Locked
            </CardTitle>
          </div>
          <CardDescription className="text-red-700 dark:text-red-300">
            Too many failed login attempts. Please wait before trying again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <div className="flex items-center space-x-3">
              <Timer className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Time remaining:
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {formatRemainingTime(remainingTime)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-700 dark:text-red-300">
                Lockout Level {lockoutLevel}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {lockoutInfo.name}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-red-700 dark:text-red-300">
              <XCircle className="h-4 w-4" />
              <span>{attemptCount} failed attempt{attemptCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-red-700 dark:text-red-300">
              <Shield className="h-4 w-4" />
              <span>Security protection active</span>
            </div>
          </div>
          
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              This is a security measure to protect your account. The lockout will automatically expire.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Lockout levels for reference
const LOCKOUT_LEVELS = [
  { attempts: 5, duration: 1 * 60 * 1000, name: '1 minute' },
  { attempts: 8, duration: 5 * 60 * 1000, name: '5 minutes' },
  { attempts: 10, duration: 15 * 60 * 1000, name: '15 minutes' },
];
