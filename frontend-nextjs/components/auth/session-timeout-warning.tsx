"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Session Timeout Warning Component
 * 
 * Shows a warning when the session is about to expire (30 minutes before timeout)
 * Implements your 2-hour session timeout recommendation
 */

interface SessionTimeoutWarningProps {
  onExtendSession?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function SessionTimeoutWarning({
  onExtendSession,
  onLogout,
  className,
}: SessionTimeoutWarningProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    const checkSessionTimeout = () => {
      // Get session start time from cookie
      const sessionStartCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-session-start='));
      
      if (!sessionStartCookie) return;

      const sessionStart = parseInt(sessionStartCookie.split('=')[1]);
      const now = Date.now();
      const sessionDuration = now - sessionStart;
      
      // Session timeout: 3 hours (3 * 60 * 60 * 1000 ms)
      const SESSION_TIMEOUT = 3 * 60 * 60 * 1000;
      // Warning threshold: 30 minutes before timeout (2.5 hours)
      const WARNING_THRESHOLD = 2.5 * 60 * 60 * 1000;
      
      const timeUntilTimeout = SESSION_TIMEOUT - sessionDuration;
      const timeUntilWarning = WARNING_THRESHOLD - sessionDuration;
      
      if (timeUntilTimeout <= 0) {
        // Session expired
        setIsVisible(false);
        if (onLogout) onLogout();
        return;
      }
      
      if (timeUntilWarning <= 0 && timeUntilTimeout > 0) {
        // Show warning
        setTimeRemaining(timeUntilTimeout);
        setIsVisible(true);
      } else {
        // No warning needed yet
        setIsVisible(false);
      }
    };

    // Check immediately
    checkSessionTimeout();
    
    // Check every minute
    const interval = setInterval(checkSessionTimeout, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [onLogout]);

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.ceil(ms / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      // Call backend to extend session
      const response = await fetch('/api/v1/auth/extend-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Update session start time
        document.cookie = `sb-session-start=${Date.now()}; path=/; max-age=${3 * 60 * 60}`;
        setIsVisible(false);
        setTimeRemaining(null);
      } else {
        console.error('Failed to extend session');
      }
    } catch (error) {
      console.error('Error extending session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  if (!isVisible || timeRemaining === null) {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300",
      className
    )}>
      <Card className="w-80 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Session Timeout Warning
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Your session will expire in {formatTimeRemaining(timeRemaining)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-amber-700 dark:text-amber-300">
            <Clock className="w-4 h-4 mr-2" />
            For security, sessions automatically expire after 3 hours of inactivity
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleExtendSession}
              disabled={isExtending}
              size="sm"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isExtending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Extending...
                </>
              ) : (
                'Extend Session'
              )}
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
