import { Club } from './club.entity';
import { ClubFormQuestion } from './club-form-question.entity';
import { ClubFormResponse } from './club-form-response.entity';
export declare class ClubForm {
    id: string;
    club_id: string;
    created_by: string;
    name: string;
    description: string;
    is_active: boolean;
    auto_approve: boolean;
    form_type: string;
    created_at: Date;
    updated_at: Date;
    club: Club;
    questions: ClubFormQuestion[];
    responses: ClubFormResponse[];
    created_by_user?: any;
}
