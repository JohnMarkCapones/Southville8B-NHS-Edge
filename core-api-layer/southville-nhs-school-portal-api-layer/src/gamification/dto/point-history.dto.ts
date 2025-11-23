import { IsOptional, IsInt, IsString, Min } from 'class-validator';

export class PointHistoryQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(10)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  category?: 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  transactionType?: string;
}

export interface PointHistoryResponse {
  transactions: Array<{
    id: string;
    points: number;
    type: string;
    category: string;
    reason: string | null;
    metadata: Record<string, any> | null;
    createdAt: string;
    balanceAfter: number | null;
  }>;
  summary: {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
