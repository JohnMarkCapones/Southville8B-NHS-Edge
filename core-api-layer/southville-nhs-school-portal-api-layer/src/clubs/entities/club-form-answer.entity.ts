import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ClubFormResponse } from './club-form-response.entity';
import { ClubFormQuestion } from './club-form-question.entity';

@Entity('club_form_answers')
@Unique(['response_id', 'question_id']) // One answer per question per response
export class ClubFormAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  response_id: string;

  @Column({ type: 'uuid', nullable: false })
  question_id: string;

  @Column({ type: 'text', nullable: true })
  answer_text: string;

  @Column({ type: 'text', nullable: true })
  answer_value: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations
  @ManyToOne(() => ClubFormResponse, (response) => response.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'response_id' })
  response: ClubFormResponse;

  @ManyToOne(() => ClubFormQuestion, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: ClubFormQuestion;
}
