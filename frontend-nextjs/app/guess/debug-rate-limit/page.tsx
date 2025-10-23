"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgressiveRateLimit } from '@/lib/hooks/use-progressive-rate-limit';
import { LockedLoginButton } from '@/components/auth/locked-login-button';
import { AttemptWarningModal } from '@/components/auth/attempt-warning-modal';
import { WarningModal } from '@/components/auth/warning-modal';

export default function DebugRateLimitPage() {
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const {
    attemptCount,
    isLockedOut,
    remainingTime,
    recordFailedAttempt,
    recordSuccessfulLogin,
    resetAttempts,
  } = useProgressiveRateLimit('debug-test');

  const handleFailedAttempt = () => {
    recordFailedAttempt();
    console.log('🔍 Debug - After failed attempt:', { attemptCount, isLockedOut, remainingTime });
    
    // Show modal based on new attempt count
    const newCount = attemptCount + 1;
    if (newCount < 5) {
      setShowAttemptModal(true);
    } else {
      setShowWarningModal(true);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Debug Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Current State:</h3>
                <p>Attempt Count: {attemptCount}</p>
                <p>Is Locked Out: {isLockedOut ? 'Yes' : 'No'}</p>
                <p>Remaining Time: {remainingTime}s</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Actions:</h3>
                <div className="space-y-2">
                  <Button onClick={handleFailedAttempt} disabled={isLockedOut}>
                    Simulate Failed Login
                  </Button>
                  <Button onClick={recordSuccessfulLogin} variant="outline">
                    Simulate Success
                  </Button>
                  <Button onClick={resetAttempts} variant="destructive">
                    Reset Attempts
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Locked Login Button:</h3>
              <LockedLoginButton
                isLocked={isLockedOut}
                retryAfterSeconds={remainingTime}
                attemptCount={attemptCount}
                isGamingTheme={false}
                onClick={() => console.log('Button clicked')}
              >
                Test Login Button
              </LockedLoginButton>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <AttemptWarningModal
          isOpen={showAttemptModal}
          onClose={() => setShowAttemptModal(false)}
          attemptCount={attemptCount}
          isGamingTheme={false}
        />

        <WarningModal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          attemptCount={attemptCount}
          isGamingTheme={false}
        />
      </div>
    </div>
  );
}
