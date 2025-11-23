'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { getLevelTitle, getLevelIcon, formatPoints } from '@/lib/api/endpoints/gamification';
import * as LucideIcons from 'lucide-react';

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number; // 0-100
  title?: string;
  showDetails?: boolean;
  className?: string;
}

export function LevelProgressBar({
  level,
  currentXP,
  nextLevelXP,
  progress,
  title,
  showDetails = true,
  className,
}: LevelProgressBarProps) {
  const levelTitle = title || getLevelTitle(level);
  const iconName = getLevelIcon(level);
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Star;

  const isNearCompletion = progress >= 90;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm',
              isNearCompletion && 'animate-pulse'
            )}
          >
            <span className="text-sm font-bold">{level}</span>
          </div>
          <div>
            <p className="text-sm font-semibold">{levelTitle}</p>
            {showDetails && (
              <p className="text-xs text-muted-foreground">
                Level {level}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">
            {formatPoints(currentXP)} / {formatPoints(nextLevelXP)} XP
          </p>
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      </div>

      <Progress
        value={progress}
        className={cn(
          'h-2',
          isNearCompletion && 'animate-gentleGlow'
        )}
      />

      {showDetails && (
        <p className="text-xs text-muted-foreground text-center">
          {nextLevelXP - currentXP} XP to next level
        </p>
      )}
    </div>
  );
}

export function LevelCard({
  level,
  currentXP,
  nextLevelXP,
  progress,
  title,
  className,
}: LevelProgressBarProps) {
  const levelTitle = title || getLevelTitle(level);
  const iconName = getLevelIcon(level);
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Star;

  return (
    <div
      className={cn(
        'rounded-lg border bg-gradient-to-br from-purple-500 to-indigo-600 p-4 text-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-white/80">Your Level</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold">{level}</span>
            <span className="text-lg font-medium text-white/90">{levelTitle}</span>
          </div>
        </div>
        <div className="rounded-full bg-white/20 p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="space-y-1">
        <Progress
          value={progress}
          className="h-2 bg-white/20"
        />
        <p className="text-xs text-white/80">
          {formatPoints(currentXP)} / {formatPoints(nextLevelXP)} XP ({progress}%)
        </p>
      </div>
    </div>
  );
}
