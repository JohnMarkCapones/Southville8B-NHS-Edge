import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Domain } from './domain.entity';

@Entity('domain_roles')
export class DomainRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  domain_id: string;

  @Column({ type: 'text', nullable: false })
  name: string; // e.g., 'Treasurer', 'Secretary', 'President'

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Domain)
  @JoinColumn({ name: 'domain_id' })
  domain: Domain;
}
