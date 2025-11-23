'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Badge as BadgeType, getLevelTitle, formatPoints } from '@/lib/api/endpoints/gamification';
import * as LucideIcons from 'lucide-react';
import { X, Zap, Trophy, TrendingUp, Flame, Award } from 'lucide-react';

type NotificationType = 'points' | 'badge' | 'level_up' | 'streak' | 'rank_up';

interface AchievementNotificationProps {
  type: NotificationType;
  title: string;
  description?: string;
  icon?: string;
  points?: number;
  badge?: BadgeType;
  level?: number;
  streak?: number;
  previousRank?: number;
  newRank?: number;
  isVisible?: boolean;
  duration?: number; // milliseconds
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  onClose?: () => void;
  autoClose?: boolean;
}

export function AchievementNotification({
  type,
  title,
  description,
  icon,
  points,
  badge,
  level,
  streak,
  previousRank,
  newRank,
  isVisible = true,
  duration = 5000,
  position = 'top-right',
  onClose,
  autoClose = true,
}: AchievementNotificationProps) {
  const [visible, setVisible] = useState(isVisible);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    setVisible(isVisible);
    if (isVisible) {
      setIsEntering(true);
      const enterTimer = setTimeout(() => setIsEntering(false), 100);

      if (autoClose) {
        const closeTimer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => {
          clearTimeout(enterTimer);
          clearTimeout(closeTimer);
        };
      }
      return () => clearTimeout(enterTimer);
    }
  }, [isVisible, duration, autoClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'points':
        return {
          Icon: Zap,
          bgGradient: 'from-yellow-500 to-amber-600',
          iconColor: 'text-white',
          defaultTitle: `+${points || 0} Points`,
        };
      case 'badge':
        return {
          Icon: Trophy,
          bgGradient: 'from-purple-500 to-indigo-600',
          iconColor: 'text-white',
          defaultTitle: 'Badge Earned!',
        };
      case 'level_up':
        return {
          Icon: TrendingUp,
          bgGradient: 'from-blue-500 to-cyan-600',
          iconColor: 'text-white',
          defaultTitle: `Level ${level || 0}!`,
        };
      case 'streak':
        return {
          Icon: Flame,
          bgGradient: 'from-orange-500 to-red-600',
          iconColor: 'text-white',
          defaultTitle: `${streak || 0} Day Streak!`,
        };
      case 'rank_up':
        return {
          Icon: Award,
          bgGradient: 'from-green-500 to-emerald-600',
          iconColor: 'text-white',
          defaultTitle: 'Rank Up!',
        };
      default:
        return {
          Icon: Award,
          bgGradient: 'from-gray-500 to-gray-600',
          iconColor: 'text-white',
          defaultTitle: 'Achievement!',
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = icon ? ((LucideIcons as any)[icon] || config.Icon) : config.Icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const animationClasses = {
    'top-right': isEntering ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
    'top-center': isEntering ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
    'bottom-right': isEntering ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
    'bottom-center': isEntering ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100',
  };

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300 ease-out',
        positionClasses[position],
        animationClasses[position],
        !visible && 'opacity-0 pointer-events-none'
      )}
    >
      <Card
        className={cn(
          'w-96 max-w-[calc(100vw-2rem)] overflow-hidden shadow-lg',
          'border-2 border-white/20'
        )}
      >
        {/* Header with gradient background */}
        <div className={cn('bg-gradient-to-r p-4 text-white relative', config.bgGradient)}>
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm shrink-0">
              <IconComponent className={cn('h-6 w-6', config.iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight">
                {title || config.defaultTitle}
              </h3>
              {description && (
                <p className="text-sm text-white/90 mt-0.5 line-clamp-2">{description}</p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="shrink-0 h-6 w-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sparkle animation overlay */}
          <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-20 animate-pulse pointer-events-none" />
        </div>

        {/* Details section */}
        <div className="p-4 bg-background">
          {type === 'points' && points && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Points Earned</span>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-lg text-yellow-600">
                  +{formatPoints(points)}
                </span>
              </div>
            </div>
          )}

          {type === 'badge' && badge && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{badge.name}</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-sm font-medium">+{badge.points_reward} pts</span>
                </div>
              </div>
              {badge.description && (
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              )}
              <div className="flex gap-2">
                <BadgeUI variant="outline" className="text-xs capitalize">
                  {badge.tier}
                </BadgeUI>
                <BadgeUI variant="outline" className="text-xs capitalize">
                  {badge.rarity}
                </BadgeUI>
              </div>
            </div>
          )}

          {type === 'level_up' && level && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Level</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {level}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Title</span>
                <span className="font-semibold">{getLevelTitle(level)}</span>
              </div>
            </div>
          )}

          {type === 'streak' && streak && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-lg text-orange-600">{streak} days</span>
              </div>
            </div>
          )}

          {type === 'rank_up' && newRank && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Rank</span>
                <div className="flex items-center gap-2">
                  {previousRank && (
                    <>
                      <span className="text-muted-foreground">#{previousRank}</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </>
                  )}
                  <span className="font-bold text-xl text-green-600">#{newRank}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Toast-style notification system for multiple notifications
interface NotificationItem extends AchievementNotificationProps {
  id: string;
}

export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const show = (notification: Omit<AchievementNotificationProps, 'isVisible' | 'onClose'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev, { ...notification, id, isVisible: true }]);
  };

  const close = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    show,
    close,
  };
}

// Container for stacking multiple notifications
export function AchievementNotificationContainer({
  notifications,
  onClose,
}: {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
}) {
  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index,
          }}
        >
          <AchievementNotification
            {...notification}
            onClose={() => onClose(notification.id)}
          />
        </div>
      ))}
    </>
  );
}
