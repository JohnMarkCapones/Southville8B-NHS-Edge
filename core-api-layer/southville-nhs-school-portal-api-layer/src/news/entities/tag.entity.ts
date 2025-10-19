import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Tag entity
 * Auto-created when used in articles
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: false })
  slug: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
