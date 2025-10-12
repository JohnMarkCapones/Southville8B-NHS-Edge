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
import { Permission } from './permission.entity';

@Entity('domain_role_permissions')
export class DomainRolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  domain_role_id: number;

  @Column({ type: 'int', nullable: false })
  permission_id: number;

  @Column({ type: 'boolean', default: true })
  allowed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => DomainRole)
  @JoinColumn({ name: 'domain_role_id' })
  domain_role: DomainRole;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
