import { IsString, IsOptional, IsInt, IsBoolean, IsObject, MinLength, MaxLength, Min } from 'class-validator';

export class CreateBadgeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  badgeKey: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  category: 'academic' | 'participation' | 'streak' | 'social' | 'special';

  @IsString()
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

  @IsString()
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsReward?: number;

  @IsOptional()
  @IsObject()
  criteria?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isProgressive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  progressTarget?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class UpdateBadgeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsReward?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsObject()
  criteria?: Record<string, any>;
}

export class ShowcaseBadgeDto {
  @IsString()
  studentBadgeId: string;

  @IsBoolean()
  isShowcased: boolean;
}

export interface BadgeFilterDto {
  filter?: 'earned' | 'unearned' | 'all';
  category?: string;
  studentId?: string;
}
