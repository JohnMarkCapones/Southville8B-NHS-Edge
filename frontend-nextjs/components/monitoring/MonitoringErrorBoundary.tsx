'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Quiz Monitoring
 *
 * Prevents entire page crash if data transformation fails.
 * Shows user-friendly error message with retry option.
 */
export class MonitoringErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Monitoring Error Boundary caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (optional)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload page as fallback
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">Monitoring Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Something went wrong while loading the monitoring data. This might be due to:
              </p>

              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Network connection issues</li>
                <li>Unexpected data format from server</li>
                <li>Browser compatibility problems</li>
              </ul>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-sm">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/teacher/quiz')}
                  className="flex-1"
                >
                  Back to Quizzes
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                If this problem persists, please contact technical support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
