'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BadgeCard } from './badge-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  BadgeWithProgress,
  BadgeCategory,
  BadgeTier,
  BadgeRarity,
} from '@/lib/api/endpoints/gamification';
import { Search, Trophy, Lock, Star } from 'lucide-react';

interface BadgeShowcaseProps {
  badges: BadgeWithProgress[];
  categoryStats?: {
    academic: number;
    participation: number;
    streak: number;
    social: number;
    special: number;
  };
  className?: string;
  onBadgeClick?: (badge: BadgeWithProgress) => void;
}

type FilterType = 'all' | 'earned' | 'unearned';

export function BadgeShowcase({
  badges,
  categoryStats,
  className,
  onBadgeClick,
}: BadgeShowcaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<BadgeTier | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const earned = badges.filter((b) => b.earned).length;
    const total = badges.length;
    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

    return {
      earned,
      total,
      percentage,
      unearned: total - earned,
    };
  }, [badges]);

  // Filter badges
  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      // Filter type (earned/unearned)
      if (filterType === 'earned' && !badge.earned) return false;
      if (filterType === 'unearned' && badge.earned) return false;

      // Category filter
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;

      // Tier filter
      if (selectedTier !== 'all' && badge.tier !== selectedTier) return false;

      // Rarity filter
      if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          badge.name.toLowerCase().includes(query) ||
          badge.description?.toLowerCase().includes(query) ||
          badge.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [badges, filterType, selectedCategory, selectedTier, selectedRarity, searchQuery]);

  // Group badges by category
  const badgesByCategory = useMemo(() => {
    const categories: Record<BadgeCategory, BadgeWithProgress[]> = {
      academic: [],
      participation: [],
      streak: [],
      social: [],
      special: [],
    };

    filteredBadges.forEach((badge) => {
      categories[badge.category].push(badge);
    });

    return categories;
  }, [filteredBadges]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Badges</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Star className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Earned</p>
              <p className="text-2xl font-bold text-green-600">{stats.earned}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Locked</p>
              <p className="text-2xl font-bold text-gray-500">{stats.unearned}</p>
            </div>
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
            </div>
            <div className="h-8 w-8 rounded-full border-4 border-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-500">{stats.percentage}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earned">Earned</TabsTrigger>
              <TabsTrigger value="unearned">Locked</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BadgeCategory | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="participation">Participation</SelectItem>
              <SelectItem value="streak">Streak</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as BadgeTier | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRarity} onValueChange={(v) => setSelectedRarity(v as BadgeRarity | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBadges.length} of {badges.length} badges
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Badge Grid - All badges in one grid */}
      {selectedCategory === 'all' ? (
        <div>
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  onClick={() => onBadgeClick?.(badge)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No badges found matching your filters.</p>
            </Card>
          )}
        </div>
      ) : (
        /* Badge Grid - Grouped by category */
        <div className="space-y-8">
          {(Object.entries(badgesByCategory) as [BadgeCategory, BadgeWithProgress[]][]).map(
            ([category, categoryBadges]) => {
              if (categoryBadges.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">{category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {categoryBadges.filter((b) => b.earned).length} / {categoryBadges.length}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        onClick={() => onBadgeClick?.(badge)}
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

// Compact variant for dashboard widgets
export function BadgeShowcaseCompact({
  badges,
  maxDisplay = 6,
  onViewAll,
}: {
  badges: BadgeWithProgress[];
  maxDisplay?: number;
  onViewAll?: () => void;
}) {
  const recentBadges = useMemo(() => {
    return badges
      .filter((b) => b.earned)
      .sort((a, b) => {
        if (!a.earnedAt || !b.earnedAt) return 0;
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
      })
      .slice(0, maxDisplay);
  }, [badges, maxDisplay]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Badges</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {recentBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} size="sm" />
        ))}
      </div>

      {recentBadges.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No badges earned yet. Start completing activities to earn badges!
          </p>
        </Card>
      )}
    </div>
  );
}
