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
import { ClubForm } from './club-form.entity';
import { ClubFormQuestionOption } from './club-form-question-option.entity';
import { ClubFormAnswer } from './club-form-answer.entity';

@Entity('club_form_questions')
export class ClubFormQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  form_id: string;

  @Column({ type: 'text', nullable: false })
  question_text: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'text',
    enum: [
      'text',
      'textarea',
      'dropdown',
      'radio',
      'checkbox',
      'number',
      'email',
      'date',
    ],
  })
  question_type: string;

  @Column({ type: 'boolean', default: true })
  required: boolean;

  @Column({ type: 'integer', default: 0 })
  order_index: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => ClubForm, (form) => form.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: ClubForm;

  @OneToMany(() => ClubFormQuestionOption, (option) => option.question, {
    cascade: true,
  })
  options: ClubFormQuestionOption[];

  @OneToMany(() => ClubFormAnswer, (answer) => answer.question, {
    cascade: true,
  })
  answers: ClubFormAnswer[];
}
