'use client';

import { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

// Lazy load the optimized student rankings component
const StudentRankingsOptimized = lazy(() => 
  import('./student-rankings-optimized').then(module => ({
    default: module.StudentRankingsOptimized
  }))
);

// Loading skeleton component
function LeaderboardSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Error boundary component
function LeaderboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="w-full">
      <CardContent className="p-6 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Leaderboard</h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </CardContent>
    </Card>
  );
}

// Main lazy-loaded leaderboard component
export function LeaderboardLazy({ className }: { className?: string }) {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <StudentRankingsOptimized className={className} />
    </Suspense>
  );
}

// Export with error boundary wrapper
export default function LeaderboardWithErrorBoundary({ className }: { className?: string }) {
  return (
    <ErrorBoundary fallback={LeaderboardError}>
      <LeaderboardLazy className={className} />
    </ErrorBoundary>
  );
}

// Simple error boundary implementation
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; reset: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Leaderboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
