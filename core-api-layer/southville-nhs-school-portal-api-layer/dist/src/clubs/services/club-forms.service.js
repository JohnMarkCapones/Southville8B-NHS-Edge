"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClubFormsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubFormsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ClubFormsService = ClubFormsService_1 = class ClubFormsService {
    supabaseService;
    logger = new common_1.Logger(ClubFormsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createForm(clubId, createClubFormDto, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            const { data, error } = await supabase
                .from('club_forms')
                .insert({
                ...createClubFormDto,
                club_id: clubId,
                created_by: userId,
            })
                .select(`
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email)
        `)
                .single();
            if (error) {
                this.logger.error('Error creating club form:', error);
                throw new common_1.BadRequestException(`Failed to create form: ${error.message}`);
            }
            this.logger.log(`Created club form: ${data.name} (ID: ${data.id})`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error('Unexpected error creating club form:', error);
            throw new common_1.BadRequestException('Failed to create club form');
        }
    }
    async findAllForms(clubId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('club_forms')
                .select(`
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email),
          questions:club_form_questions(
            id,
            question_text,
            question_type,
            required,
            order_index,
            options:club_form_question_options(
              id,
              option_text,
              option_value,
              order_index
            )
          )
        `)
                .eq('club_id', clubId)
                .order('created_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching club forms:', error);
                throw new common_1.BadRequestException(`Failed to fetch forms: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching club forms:', error);
            throw new common_1.BadRequestException('Failed to fetch club forms');
        }
    }
    async findOneForm(clubId, formId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('club_forms')
                .select(`
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email),
          questions:club_form_questions(
            id,
            question_text,
            question_type,
            required,
            order_index,
            options:club_form_question_options(
              id,
              option_text,
              option_value,
              order_index
            )
          )
        `)
                .eq('id', formId)
                .eq('club_id', clubId)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException(`Form with ID ${formId} not found in club ${clubId}`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching form ${formId}:`, error);
            throw new common_1.BadRequestException('Failed to fetch form');
        }
    }
    async updateForm(clubId, formId, updateClubFormDto, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.findOneForm(clubId, formId);
            const { data, error } = await supabase
                .from('club_forms')
                .update({
                ...updateClubFormDto,
                updated_at: new Date().toISOString(),
            })
                .eq('id', formId)
                .eq('club_id', clubId)
                .select(`
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email)
        `)
                .single();
            if (error) {
                this.logger.error(`Error updating form ${formId}:`, error);
                throw new common_1.BadRequestException(`Failed to update form: ${error.message}`);
            }
            this.logger.log(`Updated club form: ${data.name} (ID: ${data.id})`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Unexpected error updating form ${formId}:`, error);
            throw new common_1.BadRequestException('Failed to update club form');
        }
    }
    async removeForm(clubId, formId, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.findOneForm(clubId, formId);
            const { error } = await supabase
                .from('club_forms')
                .delete()
                .eq('id', formId)
                .eq('club_id', clubId);
            if (error) {
                this.logger.error(`Error deleting form ${formId}:`, error);
                throw new common_1.BadRequestException(`Failed to delete form: ${error.message}`);
            }
            this.logger.log(`Deleted club form with ID: ${formId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Unexpected error deleting form ${formId}:`, error);
            throw new common_1.BadRequestException('Failed to delete club form');
        }
    }
    async addQuestion(clubId, formId, createQuestionDto, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.findOneForm(clubId, formId);
            const { options, ...questionData } = createQuestionDto;
            const { data: question, error: questionError } = await supabase
                .from('club_form_questions')
                .insert({
                ...questionData,
                form_id: formId,
            })
                .select(`
          *
        `)
                .single();
            if (questionError) {
                this.logger.error('Error creating question:', questionError);
                throw new common_1.BadRequestException(`Failed to create question: ${questionError.message}`);
            }
            if (options && options.length > 0) {
                const optionsData = options.map((option) => ({
                    ...option,
                    question_id: question.id,
                }));
                const { error: optionsError } = await supabase
                    .from('club_form_question_options')
                    .insert(optionsData);
                if (optionsError) {
                    this.logger.error('Error creating question options:', optionsError);
                    await supabase
                        .from('club_form_questions')
                        .delete()
                        .eq('id', question.id);
                    throw new common_1.BadRequestException(`Failed to create question options: ${optionsError.message}`);
                }
                const { data: questionWithOptions } = await supabase
                    .from('club_form_questions')
                    .select(`
            *,
            options:club_form_question_options(
              id,
              option_text,
              option_value,
              order_index
            )
          `)
                    .eq('id', question.id)
                    .single();
                return questionWithOptions;
            }
            this.logger.log(`Added question to form ${formId}: ${question.question_text}`);
            return question;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error('Unexpected error adding question:', error);
            throw new common_1.BadRequestException('Failed to add question');
        }
    }
    async updateQuestion(clubId, formId, questionId, updateQuestionDto, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.findOneForm(clubId, formId);
            const { options, ...questionData } = updateQuestionDto;
            const { data, error } = await supabase
                .from('club_form_questions')
                .update({
                ...questionData,
                updated_at: new Date().toISOString(),
            })
                .eq('id', questionId)
                .eq('form_id', formId)
                .select(`
          *
        `)
                .single();
            if (error) {
                this.logger.error(`Error updating question ${questionId}:`, error);
                throw new common_1.BadRequestException(`Failed to update question: ${error.message}`);
            }
            this.logger.log(`Updated question ${questionId} in form ${formId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Unexpected error updating question ${questionId}:`, error);
            throw new common_1.BadRequestException('Failed to update question');
        }
    }
    async removeQuestion(clubId, formId, questionId, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.findOneForm(clubId, formId);
            const { error } = await supabase
                .from('club_form_questions')
                .delete()
                .eq('id', questionId)
                .eq('form_id', formId);
            if (error) {
                this.logger.error(`Error deleting question ${questionId}:`, error);
                throw new common_1.BadRequestException(`Failed to delete question: ${error.message}`);
            }
            this.logger.log(`Deleted question ${questionId} from form ${formId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Unexpected error deleting question ${questionId}:`, error);
            throw new common_1.BadRequestException('Failed to delete question');
        }
    }
    async verifyClubAccess(clubId, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: club, error } = await supabase
            .from('clubs')
            .select('id, president_id, vp_id, secretary_id, advisor_id')
            .eq('id', clubId)
            .single();
        if (error || !club) {
            throw new common_1.NotFoundException(`Club with ID ${clubId} not found`);
        }
        const isOfficerOrAdvisor = club.president_id === userId ||
            club.vp_id === userId ||
            club.secretary_id === userId ||
            club.advisor_id === userId;
        if (!isOfficerOrAdvisor) {
            throw new common_1.ForbiddenException('Only club officers and advisors can manage forms');
        }
    }
};
exports.ClubFormsService = ClubFormsService;
exports.ClubFormsService = ClubFormsService = ClubFormsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ClubFormsService);
//# sourceMappingURL=club-forms.service.js.map