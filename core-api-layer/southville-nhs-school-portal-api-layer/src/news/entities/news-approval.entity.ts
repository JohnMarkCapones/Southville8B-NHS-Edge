import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * News approval entity
 * Tracks approval/rejection history by advisers
 */
@Entity('news_approval')
export class NewsApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  news_id: string;

  @Column({ type: 'uuid', nullable: false })
  approver_id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: 'approved' | 'rejected' | 'pending' | 'changes_requested';

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  action_at: Date;

  // Virtual fields for populated data
  approver?: any;
  news?: any;
}
