'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Database, Zap } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  bundleSize: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    bundleSize: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));

    // Measure render time
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      setMetrics(prev => ({ ...prev, renderTime }));
    });

    // Simulate API response time measurement
    const measureApiTime = async () => {
      const start = performance.now();
      try {
        await fetch('/api/test-public-rankings');
        const apiTime = performance.now() - start;
        setMetrics(prev => ({ ...prev, apiResponseTime: apiTime }));
      } catch (error) {
        console.warn('API measurement failed:', error);
      }
    };

    measureApiTime();

    // Calculate cache hit rate (simulated)
    const cacheHitRate = Math.random() * 100;
    setMetrics(prev => ({ ...prev, cacheHitRate }));

    // Get bundle size (simulated)
    const bundleSize = Math.random() * 1000 + 500; // 500KB - 1.5MB
    setMetrics(prev => ({ ...prev, bundleSize }));

    // Show performance monitor in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800';
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
          <Badge variant="outline" className="text-xs">
            Dev
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Load Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 2000 })}`}>
              {metrics.loadTime.toFixed(0)}ms
            </span>
            <Badge 
              className={`text-xs ${getPerformanceBadge(metrics.loadTime, { good: 1000, warning: 2000 })}`}
            >
              {metrics.loadTime <= 1000 ? 'Fast' : metrics.loadTime <= 2000 ? 'Good' : 'Slow'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Render Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${getPerformanceColor(metrics.renderTime, { good: 16, warning: 33 })}`}>
              {metrics.renderTime.toFixed(1)}ms
            </span>
            <Badge 
              className={`text-xs ${getPerformanceBadge(metrics.renderTime, { good: 16, warning: 33 })}`}
            >
              {metrics.renderTime <= 16 ? '60fps' : metrics.renderTime <= 33 ? '30fps' : 'Slow'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-500" />
            <span className="text-sm">API Response</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${getPerformanceColor(metrics.apiResponseTime, { good: 200, warning: 500 })}`}>
              {metrics.apiResponseTime.toFixed(0)}ms
            </span>
            <Badge 
              className={`text-xs ${getPerformanceBadge(metrics.apiResponseTime, { good: 200, warning: 500 })}`}
            >
              {metrics.apiResponseTime <= 200 ? 'Fast' : metrics.apiResponseTime <= 500 ? 'Good' : 'Slow'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Cache Hit Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${getPerformanceColor(100 - metrics.cacheHitRate, { good: 20, warning: 40 })}`}>
              {metrics.cacheHitRate.toFixed(1)}%
            </span>
            <Badge 
              className={`text-xs ${getPerformanceBadge(100 - metrics.cacheHitRate, { good: 20, warning: 40 })}`}
            >
              {metrics.cacheHitRate >= 80 ? 'Excellent' : metrics.cacheHitRate >= 60 ? 'Good' : 'Poor'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Bundle Size</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono ${getPerformanceColor(metrics.bundleSize, { good: 500, warning: 1000 })}`}>
              {(metrics.bundleSize / 1024).toFixed(1)}KB
            </span>
            <Badge 
              className={`text-xs ${getPerformanceBadge(metrics.bundleSize, { good: 500, warning: 1000 })}`}
            >
              {metrics.bundleSize <= 500 ? 'Small' : metrics.bundleSize <= 1000 ? 'Medium' : 'Large'}
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t">
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-gray-500 hover:text-gray-700 w-full text-left"
          >
            Hide Monitor
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
