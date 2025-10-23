import { SupabaseService } from '../../supabase/supabase.service';
import { SubmitFormResponseDto } from '../dto/submit-form-response.dto';
import { ReviewFormResponseDto } from '../dto/review-form-response.dto';
export declare class ClubFormResponsesService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    submitResponse(clubId: string, formId: string, submitResponseDto: SubmitFormResponseDto, userId: string): Promise<any>;
    findAllResponses(clubId: string, formId: string, userId: string): Promise<any[]>;
    findOneResponse(clubId: string, formId: string, responseId: string, userId: string): Promise<any>;
    reviewResponse(clubId: string, formId: string, responseId: string, reviewDto: ReviewFormResponseDto, userId: string): Promise<any>;
    private verifyFormAccess;
    private verifyClubAccess;
    private validateAnswers;
}
