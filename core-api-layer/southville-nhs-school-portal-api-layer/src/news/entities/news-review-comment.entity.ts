import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * News Review Comment Entity
 * Represents feedback/review comments on news articles
 */
@Entity('news_review_comments')
export class NewsReviewComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  news_id: string;

  @Column({ type: 'uuid' })
  reviewer_id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at?: string | null;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string | null;

  // Virtual field - populated by join
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
  };
}
