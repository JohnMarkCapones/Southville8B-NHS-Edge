import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClubFormQuestion } from './club-form-question.entity';

@Entity('club_form_question_options')
export class ClubFormQuestionOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  question_id: string;

  @Column({ type: 'text', nullable: false })
  option_text: string;

  @Column({ type: 'text', nullable: false })
  option_value: string;

  @Column({ type: 'integer', default: 0 })
  order_index: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations
  @ManyToOne(() => ClubFormQuestion, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: ClubFormQuestion;
}
