import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ClubForm } from './club-form.entity';
import { ClubFormAnswer } from './club-form-answer.entity';

@Entity('club_form_responses')
@Unique(['form_id', 'user_id']) // One response per student per form
export class ClubFormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  form_id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'text', nullable: true })
  review_notes: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => ClubForm, (form) => form.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: ClubForm;

  @OneToMany(() => ClubFormAnswer, (answer) => answer.response, {
    cascade: true,
  })
  answers: ClubFormAnswer[];

  // Virtual fields for populated data
  user?: any;
  reviewed_by_user?: any;
}
