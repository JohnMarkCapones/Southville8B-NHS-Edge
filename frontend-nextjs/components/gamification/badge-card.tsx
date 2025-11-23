'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgePrimitive } from '@/components/ui/badge';
import {
  Badge,
  BadgeWithProgress,
  getTierColor,
  getRarityColor,
} from '@/lib/api/endpoints/gamification';
import * as LucideIcons from 'lucide-react';
import { Lock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BadgeCardProps {
  badge: BadgeWithProgress | Badge;
  earned?: boolean;
  earnedAt?: string;
  progress?: number;
  progressCount?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function BadgeCard({
  badge,
  earned = false,
  earnedAt,
  progress = 0,
  progressCount,
  showProgress = true,
  size = 'md',
  className,
  onClick,
}: BadgeCardProps) {
  // Check if badge has earned property (BadgeWithProgress type)
  const isEarned = 'earned' in badge ? badge.earned : earned;
  const badgeEarnedAt = 'earnedAt' in badge ? badge.earnedAt : earnedAt;
  const badgeProgress = 'progress' in badge ? badge.progress : progress;
  const badgeProgressCount = 'progressCount' in badge ? badge.progressCount : progressCount;

  const Icon = (LucideIcons as any)[badge.icon || 'Award'] || LucideIcons.Award;
  const tierColor = getTierColor(badge.tier);
  const rarityColor = getRarityColor(badge.rarity);

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        !isEarned && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      {/* Locked overlay */}
      {!isEarned && (
        <div className="absolute top-2 right-2">
          <div className="rounded-full bg-muted p-1.5">
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Badge icon */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-full p-4',
            isEarned
              ? 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md'
              : 'bg-muted',
            iconSizes[size]
          )}
        >
          <Icon
            className={cn(
              'h-full w-full',
              isEarned ? 'text-white' : 'text-muted-foreground'
            )}
          />
        </div>

        {/* Badge name and description */}
        <div className="text-center space-y-1 w-full">
          <h3
            className={cn(
              'font-semibold line-clamp-2',
              titleSizes[size],
              isEarned ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {badge.name}
          </h3>
          {badge.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {badge.description}
            </p>
          )}
        </div>

        {/* Tier and Rarity badges */}
        <div className="flex gap-2 flex-wrap justify-center">
          <BadgePrimitive variant="outline" className={cn('text-xs capitalize', tierColor)}>
            {badge.tier}
          </BadgePrimitive>
          <BadgePrimitive variant="outline" className={cn('text-xs capitalize', rarityColor)}>
            {badge.rarity}
          </BadgePrimitive>
        </div>

        {/* Points reward */}
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <LucideIcons.Zap className="h-3.5 w-3.5 text-yellow-500" />
          <span>{badge.points_reward} pts</span>
        </div>

        {/* Progress bar for progressive badges */}
        {showProgress && badge.is_progressive && !isEarned && (
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {badgeProgressCount || 0} / {badge.progress_target || 0}
              </span>
            </div>
            <Progress value={badgeProgress} className="h-1.5" />
            <p className="text-xs text-center text-muted-foreground">
              {badgeProgress}% complete
            </p>
          </div>
        )}

        {/* Earned date */}
        {isEarned && badgeEarnedAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Earned {formatDistanceToNow(new Date(badgeEarnedAt), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      {/* Hidden badge indicator */}
      {badge.is_hidden && !isEarned && (
        <div className="absolute bottom-2 left-2">
          <BadgePrimitive variant="secondary" className="text-xs">
            Secret
          </BadgePrimitive>
        </div>
      )}
    </Card>
  );
}

// Compact horizontal variant
export function BadgeCardHorizontal({
  badge,
  earned = false,
  earnedAt,
  progress = 0,
  className,
  onClick,
}: BadgeCardProps) {
  const isEarned = 'earned' in badge ? badge.earned : earned;
  const badgeEarnedAt = 'earnedAt' in badge ? badge.earnedAt : earnedAt;
  const badgeProgress = 'progress' in badge ? badge.progress : progress;

  const Icon = (LucideIcons as any)[badge.icon || 'Award'] || LucideIcons.Award;
  const tierColor = getTierColor(badge.tier);

  return (
    <Card
      className={cn(
        'flex items-center gap-4 p-3 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        !isEarned && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full p-2 h-12 w-12 shrink-0',
          isEarned
            ? 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md'
            : 'bg-muted'
        )}
      >
        <Icon
          className={cn(
            'h-6 w-6',
            isEarned ? 'text-white' : 'text-muted-foreground'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate">{badge.name}</h4>
          <BadgePrimitive variant="outline" className={cn('text-xs capitalize', tierColor)}>
            {badge.tier}
          </BadgePrimitive>
        </div>
        {badge.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {badge.description}
          </p>
        )}
        {badge.is_progressive && !isEarned && (
          <div className="mt-2 space-y-1">
            <Progress value={badgeProgress} className="h-1" />
            <p className="text-xs text-muted-foreground">{badgeProgress}% complete</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="text-right shrink-0">
        {isEarned ? (
          <div className="text-xs text-muted-foreground">
            {badgeEarnedAt && formatDistanceToNow(new Date(badgeEarnedAt), { addSuffix: true })}
          </div>
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </Card>
  );
}
