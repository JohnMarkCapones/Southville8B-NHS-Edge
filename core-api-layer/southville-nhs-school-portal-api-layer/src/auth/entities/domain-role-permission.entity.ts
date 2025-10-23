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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  domain_role_id: string;

  @Column({ type: 'uuid', nullable: false })
  permission_id: string;

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
