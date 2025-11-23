import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum AlertType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
  SYSTEM = 'system',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  message: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  created_by: string;

  @Column({
    type: 'uuid',
    nullable: true, // NULL = global alert
  })
  recipient_id: string | null;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  is_read: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => "NOW() + INTERVAL '1 day'",
  })
  expires_at: Date;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Object, { nullable: true }) // Replace Object with actual User entity when available
  @JoinColumn({ name: 'created_by' })
  created_by_user?: any;
}
