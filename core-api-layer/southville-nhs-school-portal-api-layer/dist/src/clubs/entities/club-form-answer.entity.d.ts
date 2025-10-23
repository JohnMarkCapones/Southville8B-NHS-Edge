import { ClubFormResponse } from './club-form-response.entity';
import { ClubFormQuestion } from './club-form-question.entity';
export declare class ClubFormAnswer {
    id: string;
    response_id: string;
    question_id: string;
    answer_text: string;
    answer_value: string;
    created_at: Date;
    response: ClubFormResponse;
    question: ClubFormQuestion;
}
