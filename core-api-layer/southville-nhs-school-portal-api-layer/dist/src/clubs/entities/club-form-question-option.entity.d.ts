import { ClubFormQuestion } from './club-form-question.entity';
export declare class ClubFormQuestionOption {
    id: string;
    question_id: string;
    option_text: string;
    option_value: string;
    order_index: number;
    created_at: Date;
    question: ClubFormQuestion;
}
