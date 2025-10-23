import { SupabaseService } from '../../supabase/supabase.service';
import { CreateClubFormDto } from '../dto/create-club-form.dto';
import { UpdateClubFormDto } from '../dto/update-club-form.dto';
import { CreateFormQuestionDto } from '../dto/create-form-question.dto';
import { UpdateFormQuestionDto } from '../dto/update-form-question.dto';
export declare class ClubFormsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    createForm(clubId: string, createClubFormDto: CreateClubFormDto, userId: string): Promise<any>;
    findAllForms(clubId: string): Promise<any[]>;
    findOneForm(clubId: string, formId: string): Promise<any>;
    updateForm(clubId: string, formId: string, updateClubFormDto: UpdateClubFormDto, userId: string): Promise<any>;
    removeForm(clubId: string, formId: string, userId: string): Promise<void>;
    addQuestion(clubId: string, formId: string, createQuestionDto: CreateFormQuestionDto, userId: string): Promise<any>;
    updateQuestion(clubId: string, formId: string, questionId: string, updateQuestionDto: UpdateFormQuestionDto, userId: string): Promise<any>;
    removeQuestion(clubId: string, formId: string, questionId: string, userId: string): Promise<void>;
    private verifyClubAccess;
}
