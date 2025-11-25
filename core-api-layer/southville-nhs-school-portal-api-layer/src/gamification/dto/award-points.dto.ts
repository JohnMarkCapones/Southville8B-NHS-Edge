import { IsUUID, IsInt, IsString, IsOptional, IsBoolean, Min, Max, MinLength, MaxLength, IsObject } from 'class-validator';

export class AwardPointsDto {
  @IsUUID()
  studentId: string;

  @IsInt()
  @Min(-1000)
  @Max(10000)
  points: number;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;

  @IsString()
  category: 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';

  @IsString()
  transactionType: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsBoolean()
  isManual?: boolean;
}

export class AwardPointsResponse {
  success: boolean;
  old_total: number;
  new_total: number;
  points_awarded: number;
  level_up?: boolean;
  new_level?: number;
  badges_earned?: string[];
}
