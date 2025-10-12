import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DomainRole } from './domain-role.entity';

@Entity('user_domain_roles')
export class UserDomainRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'int', nullable: false })
  domain_role_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => DomainRole)
  @JoinColumn({ name: 'domain_role_id' })
  domain_role: DomainRole;
}
