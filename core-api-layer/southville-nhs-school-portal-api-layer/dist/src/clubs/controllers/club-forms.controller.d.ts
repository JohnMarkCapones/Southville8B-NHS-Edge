import { ClubFormsService } from '../services/club-forms.service';
import { ClubFormResponsesService } from '../services/club-form-responses.service';
import { CreateClubFormDto } from '../dto/create-club-form.dto';
import { UpdateClubFormDto } from '../dto/update-club-form.dto';
import { CreateFormQuestionDto } from '../dto/create-form-question.dto';
import { UpdateFormQuestionDto } from '../dto/update-form-question.dto';
import { SubmitFormResponseDto } from '../dto/submit-form-response.dto';
import { ReviewFormResponseDto } from '../dto/review-form-response.dto';
export declare class ClubFormsController {
    private readonly clubFormsService;
    private readonly clubFormResponsesService;
    constructor(clubFormsService: ClubFormsService, clubFormResponsesService: ClubFormResponsesService);
    createForm(clubId: string, createClubFormDto: CreateClubFormDto, user: any): Promise<any>;
    findAllForms(clubId: string): Promise<any[]>;
    findOneForm(clubId: string, formId: string): Promise<any>;
    updateForm(clubId: string, formId: string, updateClubFormDto: UpdateClubFormDto, user: any): Promise<any>;
    removeForm(clubId: string, formId: string, user: any): Promise<void>;
    addQuestion(clubId: string, formId: string, createQuestionDto: CreateFormQuestionDto, user: any): Promise<any>;
    updateQuestion(clubId: string, formId: string, questionId: string, updateQuestionDto: UpdateFormQuestionDto, user: any): Promise<any>;
    removeQuestion(clubId: string, formId: string, questionId: string, user: any): Promise<void>;
    submitResponse(clubId: string, formId: string, submitResponseDto: SubmitFormResponseDto, user: any): Promise<any>;
    findAllResponses(clubId: string, formId: string, user: any): Promise<any[]>;
    findOneResponse(clubId: string, formId: string, responseId: string, user: any): Promise<any>;
    reviewResponse(clubId: string, formId: string, responseId: string, reviewDto: ReviewFormResponseDto, user: any): Promise<any>;
}
