import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Club } from './club.entity';
import { ClubFormQuestion } from './club-form-question.entity';
import { ClubFormResponse } from './club-form-response.entity';

@Entity('club_forms')
export class ClubForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  club_id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  auto_approve: boolean;

  @Column({ type: 'varchar', length: 50, default: 'member_registration' })
  form_type: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => ClubFormQuestion, (question) => question.form, {
    cascade: true,
  })
  questions: ClubFormQuestion[];

  @OneToMany(() => ClubFormResponse, (response) => response.form, {
    cascade: true,
  })
  responses: ClubFormResponse[];

  // Virtual fields for populated data
  created_by_user?: any;
}
