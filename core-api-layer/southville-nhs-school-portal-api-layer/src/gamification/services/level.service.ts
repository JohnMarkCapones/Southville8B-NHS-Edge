import { Injectable } from '@nestjs/common';

export interface LevelData {
  level: number;
  title: string;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number; // 0-100
}

@Injectable()
export class LevelService {
  private readonly LEVEL_TITLES = {
    1: { min: 1, max: 5, title: 'Novice', icon: 'Sprout' },
    2: { min: 6, max: 10, title: 'Apprentice', icon: 'BookOpen' },
    3: { min: 11, max: 20, title: 'Scholar', icon: 'GraduationCap' },
    4: { min: 21, max: 30, title: 'Expert', icon: 'Brain' },
    5: { min: 31, max: 40, title: 'Master', icon: 'Star' },
    6: { min: 41, max: 50, title: 'Grand Master', icon: 'Stars' },
    7: { min: 51, max: 60, title: 'Legend', icon: 'Crown' },
    8: { min: 61, max: 70, title: 'Champion', icon: 'Trophy' },
    9: { min: 71, max: 80, title: 'Hero', icon: 'Shield' },
    10: { min: 81, max: 90, title: 'Elite', icon: 'Zap' },
    11: { min: 91, max: 99, title: 'Supreme', icon: 'Sparkles' },
    12: { min: 100, max: 999, title: 'Immortal', icon: 'Infinity' },
  };

  /**
   * Calculate required XP for a given level
   * Formula: 100 * (level ^ 1.5)
   */
  calculateRequiredXP(level: number): number {
    return Math.round(100 * Math.pow(level, 1.5));
  }

  /**
   * Calculate level, XP, and progress from total points
   */
  calculateLevel(totalPoints: number): LevelData {
    let level = 1;
    let xpRemaining = totalPoints;

    // Find current level
    while (true) {
      const xpForNextLevel = this.calculateRequiredXP(level);
      if (xpRemaining < xpForNextLevel) break;
      xpRemaining -= xpForNextLevel;
      level++;
    }

    const nextLevelXP = this.calculateRequiredXP(level);
    const progress = Math.round((xpRemaining / nextLevelXP) * 100);
    const title = this.getLevelTitle(level);

    return {
      level,
      title,
      currentLevelXP: xpRemaining,
      nextLevelXP,
      progress: Math.min(100, progress), // Cap at 100
    };
  }

  /**
   * Get level title based on level number
   */
  getLevelTitle(level: number): string {
    for (const tier of Object.values(this.LEVEL_TITLES)) {
      if (level >= tier.min && level <= tier.max) {
        return tier.title;
      }
    }
    return 'Immortal'; // Default for very high levels
  }

  /**
   * Get level icon based on level number
   */
  getLevelIcon(level: number): string {
    for (const tier of Object.values(this.LEVEL_TITLES)) {
      if (level >= tier.min && level <= tier.max) {
        return tier.icon;
      }
    }
    return 'Infinity'; // Default for very high levels
  }

  /**
   * Calculate bonus points awarded on level up
   */
  getLevelUpBonus(newLevel: number): number {
    if (newLevel % 10 === 0) return 500; // Milestone levels (10, 20, 30...)
    if (newLevel % 5 === 0) return 200; // Half milestones (5, 15, 25...)
    return 50; // Regular levels
  }

  /**
   * Check if level up occurred between two point totals
   */
  checkLevelUp(oldPoints: number, newPoints: number): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    bonus: number;
  } {
    const oldLevelData = this.calculateLevel(oldPoints);
    const newLevelData = this.calculateLevel(newPoints);

    const leveledUp = newLevelData.level > oldLevelData.level;
    const bonus = leveledUp ? this.getLevelUpBonus(newLevelData.level) : 0;

    return {
      leveledUp,
      oldLevel: oldLevelData.level,
      newLevel: newLevelData.level,
      bonus,
    };
  }

  /**
   * Get special badge key for level milestones
   */
  getLevelMilestoneBadge(level: number): string | null {
    const LEVEL_BADGES = {
      10: 'level-10',
      25: 'level-25',
      50: 'level-50',
      75: 'level-75',
      100: 'level-100',
    };

    return LEVEL_BADGES[level] || null;
  }

  /**
   * Calculate total XP required to reach a specific level
   */
  calculateTotalXPForLevel(targetLevel: number): number {
    let total = 0;
    for (let level = 1; level < targetLevel; level++) {
      total += this.calculateRequiredXP(level);
    }
    return total;
  }

  /**
   * Get level progression curve data for charts
   */
  getLevelCurveData(maxLevel: number = 50): Array<{ level: number; xpRequired: number; totalXP: number }> {
    const data: Array<{ level: number; xpRequired: number; totalXP: number }> = [];
    let totalXP = 0;

    for (let level = 1; level <= maxLevel; level++) {
      const xpRequired = this.calculateRequiredXP(level);
      totalXP += xpRequired;
      data.push({
        level,
        xpRequired,
        totalXP,
      });
    }

    return data;
  }
}
