export interface PointTransaction {
  id: string;
  student_id: string;

  // Transaction details
  points: number; // Positive for awards, negative for deductions
  transaction_type: string;
  category: PointCategory;

  // Context
  reason: string | null;
  metadata: Record<string, any> | null;

  // Related entities
  related_entity_id: string | null;
  related_entity_type: string | null;

  // Attribution
  created_by: string | null;
  is_manual: boolean;

  // Audit
  created_at: string;

  // Balance snapshot
  balance_after: number | null;
}

export type PointCategory = 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';

export interface PointTransactionWithDetails extends PointTransaction {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_by_user?: {
    id: string;
    full_name: string;
  };
}

export interface PointSummary {
  total_earned: number;
  total_spent: number;
  current_balance: number;
  by_category: {
    quiz: number;
    activity: number;
    streak: number;
    bonus: number;
    penalty: number;
  };
}
