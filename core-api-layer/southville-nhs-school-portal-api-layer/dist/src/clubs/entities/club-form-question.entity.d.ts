import { ClubForm } from './club-form.entity';
import { ClubFormQuestionOption } from './club-form-question-option.entity';
import { ClubFormAnswer } from './club-form-answer.entity';
export declare class ClubFormQuestion {
    id: string;
    form_id: string;
    question_text: string;
    question_type: string;
    required: boolean;
    order_index: number;
    created_at: Date;
    updated_at: Date;
    form: ClubForm;
    options: ClubFormQuestionOption[];
    answers: ClubFormAnswer[];
}
