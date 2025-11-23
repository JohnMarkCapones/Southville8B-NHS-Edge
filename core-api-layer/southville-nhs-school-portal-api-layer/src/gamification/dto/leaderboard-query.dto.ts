import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LeaderboardQueryDto {
  @IsOptional()
  @IsString()
  scope?: 'global' | 'grade' | 'section' = 'global';

  @IsOptional()
  @IsString()
  scopeValue?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time';
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  student: {
    id: string;
    name: string;
    gradeLevel?: number;
    section?: string;
    avatarUrl?: string;
  };
  stats: {
    totalPoints: number;
    level: number;
    currentStreak: number;
    totalBadges: number;
  };
  trend: 'up' | 'down' | 'same';
  trendChange?: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  currentUser: LeaderboardEntry | null;
  lastUpdated: string;
}
