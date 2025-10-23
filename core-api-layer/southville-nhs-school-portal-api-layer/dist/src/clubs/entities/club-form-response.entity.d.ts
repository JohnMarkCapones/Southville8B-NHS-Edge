import { ClubForm } from './club-form.entity';
import { ClubFormAnswer } from './club-form-answer.entity';
export declare class ClubFormResponse {
    id: string;
    form_id: string;
    user_id: string;
    status: string;
    reviewed_by: string;
    reviewed_at: Date;
    review_notes: string;
    created_at: Date;
    updated_at: Date;
    form: ClubForm;
    answers: ClubFormAnswer[];
    user?: any;
    reviewed_by_user?: any;
}
