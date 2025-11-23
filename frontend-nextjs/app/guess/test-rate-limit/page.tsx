/**
 * Test Page for Progressive Rate Limiting
 * 
 * This page allows you to test the frontend progressive rate limiting:
 * - 5 failed attempts → 1 minute lockout
 * - 8 failed attempts → 5 minute lockout  
 * - 10 failed attempts → 15 minute lockout
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RateLimitWarning } from '@/components/auth/rate-limit-warning';
import { useProgressiveRateLimit } from '@/lib/hooks/use-progressive-rate-limit';
import { AlertCircle, TestTube, Zap, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestRateLimitPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('wrongpassword');
  const [testResults, setTestResults] = useState<string[]>([]);

  const {
    isLockedOut,
    remainingTime,
    lockoutLevel,
    attemptCount,
    canAttempt,
    recordFailedAttempt,
    recordSuccessfulLogin,
    resetAttempts,
  } = useProgressiveRateLimit();

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const simulateFailedLogin = () => {
    if (!canAttempt) {
      addTestResult('❌ Cannot attempt - account is locked out');
      return;
    }

    recordFailedAttempt();
    addTestResult(`❌ Failed login attempt #${attemptCount + 1}`);
    
    if (attemptCount + 1 >= 5 && attemptCount + 1 < 8) {
      addTestResult('🔒 1-minute lockout will be applied after this attempt');
    } else if (attemptCount + 1 >= 8 && attemptCount + 1 < 10) {
      addTestResult('🔒 5-minute lockout will be applied after this attempt');
    } else if (attemptCount + 1 >= 10) {
      addTestResult('🔒 15-minute lockout will be applied after this attempt');
    }
  };

  const simulateSuccessfulLogin = () => {
    if (!canAttempt) {
      addTestResult('❌ Cannot attempt - account is locked out');
      return;
    }

    recordSuccessfulLogin();
    addTestResult('✅ Successful login - all failed attempts cleared');
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <TestTube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Progressive Rate Limiting Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Test the frontend progressive rate limiting system
          </p>
        </div>

        {/* Rate Limit Warning */}
        <RateLimitWarning
          isLockedOut={isLockedOut}
          remainingTime={remainingTime}
          lockoutLevel={lockoutLevel}
          attemptCount={attemptCount}
          onReset={resetAttempts}
        />

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Test Controls</span>
            </CardTitle>
            <CardDescription>
              Simulate login attempts to test the progressive rate limiting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Test Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="wrongpassword"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={simulateFailedLogin}
                disabled={!canAttempt}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Simulate Failed Login</span>
              </Button>

              <Button
                onClick={simulateSuccessfulLogin}
                disabled={!canAttempt}
                variant="default"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Simulate Successful Login</span>
              </Button>

              <Button
                onClick={resetAttempts}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Reset All Attempts</span>
              </Button>

              <Button
                onClick={clearTestResults}
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <span>Clear Test Log</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Log</CardTitle>
            <CardDescription>
              Real-time log of test actions and rate limiting responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No test results yet. Start testing the rate limiting system!
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg text-sm font-mono',
                      result.includes('✅') 
                        ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                        : result.includes('❌')
                        ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                        : result.includes('🔒')
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
                    )}
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Progressive Rate Limiting Rules</CardTitle>
            <CardDescription>
              The exact rules implemented in this frontend system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Level 1: 5 Attempts
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    After 5 failed attempts, account is locked for <strong>1 minute</strong>
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Level 2: 8 Attempts
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    After 8 failed attempts, account is locked for <strong>5 minutes</strong>
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Level 3: 10 Attempts
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    After 10 failed attempts, account is locked for <strong>15 minutes</strong>
                  </p>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> This is a frontend-only implementation for demonstration purposes. 
                  In production, rate limiting should be implemented on the backend for security.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
