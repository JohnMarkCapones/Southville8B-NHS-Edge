'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LeaderboardEntry,
  formatPoints,
  getLevelTitle,
} from '@/lib/api/endpoints/gamification';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Star,
} from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUser?: LeaderboardEntry | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  showPagination?: boolean;
  compact?: boolean;
  className?: string;
  onPageChange?: (page: number) => void;
}

export function LeaderboardTable({
  entries,
  currentUser,
  pagination,
  showPagination = true,
  compact = false,
  className,
  onPageChange,
}: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (entry: LeaderboardEntry) => {
    if (entry.trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (entry.trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const canGoPrev = pagination && pagination.page > 1;
  const canGoNext = pagination && pagination.page < totalPages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current User Card - Sticky at top */}
      {currentUser && !currentUser.isCurrentUser && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getRankIcon(currentUser.rank)}
                <span className={cn('text-lg font-bold', getRankColor(currentUser.rank))}>
                  #{currentUser.rank}
                </span>
              </div>
              <Avatar>
                <AvatarImage src={currentUser.student.avatarUrl} />
                <AvatarFallback>{getInitials(currentUser.student.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">You</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.student.gradeLevel && `Grade ${currentUser.student.gradeLevel}`}
                  {currentUser.student.section && ` - ${currentUser.student.section}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="font-semibold">{formatPoints(currentUser.stats.totalPoints)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-semibold">{currentUser.stats.level}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rank</TableHead>
              <TableHead>Student</TableHead>
              {!compact && <TableHead className="text-right">Grade</TableHead>}
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Level</TableHead>
              {!compact && <TableHead className="text-right">Streak</TableHead>}
              {!compact && <TableHead className="text-right">Badges</TableHead>}
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={entry.student.id}
                className={cn(
                  'transition-colors',
                  entry.isCurrentUser && 'bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900'
                )}
              >
                {/* Rank */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <span className={cn('font-bold text-lg', getRankColor(entry.rank))}>
                      {entry.rank}
                    </span>
                  </div>
                </TableCell>

                {/* Student */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.student.avatarUrl} />
                      <AvatarFallback>{getInitials(entry.student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {entry.student.name}
                        {entry.isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </p>
                      {!compact && entry.student.section && (
                        <p className="text-sm text-muted-foreground">
                          {entry.student.section}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Grade */}
                {!compact && (
                  <TableCell className="text-right">
                    {entry.student.gradeLevel && (
                      <Badge variant="outline">Grade {entry.student.gradeLevel}</Badge>
                    )}
                  </TableCell>
                )}

                {/* Points */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">
                      {formatPoints(entry.stats.totalPoints)}
                    </span>
                  </div>
                </TableCell>

                {/* Level */}
                <TableCell className="text-right">
                  <div className="text-right">
                    <p className="font-semibold">{entry.stats.level}</p>
                    <p className="text-xs text-muted-foreground">
                      {getLevelTitle(entry.stats.level)}
                    </p>
                  </div>
                </TableCell>

                {/* Streak */}
                {!compact && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{entry.stats.currentStreak}</span>
                    </div>
                  </TableCell>
                )}

                {/* Badges */}
                {!compact && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{entry.stats.totalBadges}</span>
                    </div>
                  </TableCell>
                )}

                {/* Trend */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {getTrendIcon(entry)}
                    {entry.trendChange && entry.trendChange > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {entry.trendChange}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={compact ? 5 : 8} className="text-center py-8">
                  <p className="text-muted-foreground">No leaderboard data available.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {showPagination && pagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} students
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!canGoPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9"
                      onClick={() => onPageChange?.(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Compact widget variant for dashboards
export function LeaderboardWidget({
  entries,
  maxEntries = 5,
  onViewAll,
}: {
  entries: LeaderboardEntry[];
  maxEntries?: number;
  onViewAll?: () => void;
}) {
  const topEntries = entries.slice(0, maxEntries);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Performers</h3>
        {onViewAll && (
          <button onClick={onViewAll} className="text-sm text-blue-600 hover:underline">
            View all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {topEntries.map((entry) => (
          <div
            key={entry.student.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg transition-colors',
              entry.isCurrentUser
                ? 'bg-blue-50 dark:bg-blue-950'
                : 'hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn('font-bold text-lg w-8', getRankColor(entry.rank))}>
                #{entry.rank}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.student.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(entry.student.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{entry.student.name}</p>
                <p className="text-xs text-muted-foreground">
                  Level {entry.stats.level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span className="font-semibold text-sm">
                  {formatPoints(entry.stats.totalPoints)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {topEntries.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No leaderboard data available yet.
          </p>
        )}
      </div>
    </Card>
  );
}
