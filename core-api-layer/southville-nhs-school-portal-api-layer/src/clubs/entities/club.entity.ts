import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  president_id: string;

  @Column({ type: 'uuid', nullable: true })
  vp_id: string;

  @Column({ type: 'uuid', nullable: true })
  secretary_id: string;

  @Column({ type: 'uuid', nullable: true })
  advisor_id: string;

  @Column({ type: 'uuid', nullable: true })
  co_advisor_id: string;

  @Column({ type: 'uuid', nullable: true })
  domain_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Virtual fields for populated data
  president?: any;
  vp?: any;
  secretary?: any;
  advisor?: any;
  co_advisor?: any;
  domain?: any;
}
