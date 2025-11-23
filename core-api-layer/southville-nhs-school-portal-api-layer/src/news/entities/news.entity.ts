import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * News entity representing a journalism article
 * Dual storage: article_json (ProseMirror) + article_html (rendered)
 */
@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true, nullable: false })
  slug: string;

  @Column({ type: 'uuid', nullable: false })
  author_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author_name?: string | null;

  @Column({ type: 'text', nullable: true })
  credits?: string | null;

  @Column({ type: 'uuid', nullable: true })
  domain_id?: string | null;

  // Tiptap dual storage
  @Column({ type: 'jsonb', nullable: true })
  article_json: object; // ProseMirror JSON structure

  @Column({ type: 'text', nullable: true })
  article_html: string; // Rendered HTML for display

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  // R2 storage for featured image
  @Column({ type: 'varchar', length: 500, nullable: true })
  featured_image_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  r2_featured_image_key?: string | null; // For R2 deletion

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'draft',
    nullable: false,
  })
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'published'
    | 'rejected'
    | 'archived';

  @Column({
    type: 'varchar',
    length: 50,
    default: 'public',
    nullable: false,
  })
  visibility: 'public' | 'students' | 'teachers' | 'private';

  // Review status for article review workflow
  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
    nullable: true,
  })
  review_status?:
    | 'pending'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'needs_revision'
    | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  published_date: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  scheduled_date?: Date | null;

  @Column({ type: 'integer', default: 0, nullable: false })
  views: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Soft delete
  @Column({ type: 'timestamp with time zone', nullable: true })
  deleted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  deleted_by: string;

  // Virtual fields for populated data (from Supabase joins)
  author?: any;
  domain?: any;
  category?: any;
  tags?: any[];
  co_authors?: any[];
  approval_history?: any[];
}
