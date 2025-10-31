import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * News co-author entity
 * Tracks journalists who collaborated on an article
 */
@Entity('news_co_authors')
export class NewsCoAuthor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  news_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  co_author_name: string;

  @Column({
    type: 'varchar',
    length: 100,
    default: 'co-author',
    nullable: false,
  })
  role: 'co-author' | 'editor' | 'contributor';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  added_at: Date;

  @Column({ type: 'uuid', nullable: true })
  added_by: string;

  // Virtual fields for populated data
  added_by_user?: any;
}
