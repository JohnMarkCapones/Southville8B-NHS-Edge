'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPoints } from '@/lib/api/endpoints/gamification';

interface PointsCounterProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  showIcon?: boolean;
  className?: string;
  onPointsChange?: (newPoints: number) => void;
}

export function PointsCounter({
  points,
  size = 'md',
  showAnimation = true,
  showIcon = true,
  className,
  onPointsChange,
}: PointsCounterProps) {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (points !== displayPoints) {
      setIsAnimating(true);

      // Animate number counting
      const diff = points - displayPoints;
      const steps = 20;
      const increment = diff / steps;
      let current = displayPoints;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += increment;
        setDisplayPoints(Math.round(current));

        if (step >= steps) {
          clearInterval(interval);
          setDisplayPoints(points);
          setIsAnimating(false);
          onPointsChange?.(points);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [points, displayPoints, onPointsChange]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Zap
          className={cn(
            'text-yellow-500',
            isAnimating && showAnimation && 'animate-pulse'
          )}
          size={iconSizes[size]}
        />
      )}
      <span
        className={cn(
          'font-semibold tabular-nums',
          isAnimating && showAnimation && 'animate-gentleGlow text-yellow-600'
        )}
      >
        {formatPoints(displayPoints)}
      </span>
      {size === 'lg' && (
        <span className="text-sm font-normal text-muted-foreground">
          points
        </span>
      )}
    </div>
  );
}

export function PointsCard({ points, className }: { points: number; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-gradient-to-br from-yellow-500 to-amber-600 p-4 text-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Total Points</p>
          <PointsCounter points={points} size="lg" showIcon={false} className="text-white mt-1" />
        </div>
        <div className="rounded-full bg-white/20 p-3">
          <Zap className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
