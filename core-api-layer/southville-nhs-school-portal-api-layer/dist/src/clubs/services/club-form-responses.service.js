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
var ClubFormResponsesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubFormResponsesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ClubFormResponsesService = ClubFormResponsesService_1 = class ClubFormResponsesService {
    supabaseService;
    logger = new common_1.Logger(ClubFormResponsesService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async submitResponse(clubId, formId, submitResponseDto, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const form = await this.verifyFormAccess(clubId, formId);
            const { data: existingResponse } = await supabase
                .from('club_form_responses')
                .select('id')
                .eq('form_id', formId)
                .eq('user_id', userId)
                .single();
            if (existingResponse) {
                throw new common_1.ConflictException('You have already submitted a response to this form');
            }
            await this.validateAnswers(formId, submitResponseDto.answers);
            const { data: response, error: responseError } = await supabase
                .from('club_form_responses')
                .insert({
                form_id: formId,
                user_id: userId,
                status: form.auto_approve ? 'approved' : 'pending',
            })
                .select(`
          *,
          user:user_id(id, full_name, email),
          form:form_id(id, name, auto_approve)
        `)
                .single();
            if (responseError) {
                this.logger.error('Error creating form response:', responseError);
                if (responseError.code === '23505') {
                    throw new common_1.ConflictException('You have already submitted a response to this form');
                }
                throw new common_1.BadRequestException(`Failed to submit response: ${responseError.message}`);
            }
            const answersData = submitResponseDto.answers.map((answer) => ({
                response_id: response.id,
                question_id: answer.question_id,
                answer_text: answer.answer_text,
                answer_value: answer.answer_value,
            }));
            const { error: answersError } = await supabase
                .from('club_form_answers')
                .insert(answersData);
            if (answersError) {
                this.logger.error('Error creating form answers:', answersError);
                await supabase
                    .from('club_form_responses')
                    .delete()
                    .eq('id', response.id);
                throw new common_1.BadRequestException(`Failed to submit response: ${answersError.message}`);
            }
            const { data: completeResponse } = await supabase
                .from('club_form_responses')
                .select(`
          *,
          user:user_id(id, full_name, email),
          form:form_id(id, name, auto_approve),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `)
                .eq('id', response.id)
                .single();
            this.logger.log(`Submitted response to form ${formId} by user ${userId} (Status: ${response.status})`);
            return completeResponse;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error('Unexpected error submitting response:', error);
            throw new common_1.BadRequestException('Failed to submit response');
        }
    }
    async findAllResponses(clubId, formId, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.verifyFormAccess(clubId, formId);
            const { data, error } = await supabase
                .from('club_form_responses')
                .select(`
          *,
          user:user_id(id, full_name, email),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `)
                .eq('form_id', formId)
                .order('created_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching form responses:', error);
                throw new common_1.BadRequestException(`Failed to fetch responses: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching responses:', error);
            throw new common_1.BadRequestException('Failed to fetch responses');
        }
    }
    async findOneResponse(clubId, formId, responseId, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.verifyFormAccess(clubId, formId);
            const { data, error } = await supabase
                .from('club_form_responses')
                .select(`
          *,
          user:user_id(id, full_name, email),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type,
              options:club_form_question_options(
                id,
                option_text,
                option_value
              )
            )
          )
        `)
                .eq('id', responseId)
                .eq('form_id', formId)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException(`Response with ID ${responseId} not found`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Error fetching response ${responseId}:`, error);
            throw new common_1.BadRequestException('Failed to fetch response');
        }
    }
    async reviewResponse(clubId, formId, responseId, reviewDto, userId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.verifyClubAccess(clubId, userId);
            await this.verifyFormAccess(clubId, formId);
            const { data: existingResponse } = await supabase
                .from('club_form_responses')
                .select('id, status')
                .eq('id', responseId)
                .eq('form_id', formId)
                .single();
            if (!existingResponse) {
                throw new common_1.NotFoundException(`Response with ID ${responseId} not found`);
            }
            const { data, error } = await supabase
                .from('club_form_responses')
                .update({
                status: reviewDto.status,
                reviewed_by: userId,
                reviewed_at: new Date().toISOString(),
                review_notes: reviewDto.review_notes,
                updated_at: new Date().toISOString(),
            })
                .eq('id', responseId)
                .eq('form_id', formId)
                .select(`
          *,
          user:user_id(id, full_name, email),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `)
                .single();
            if (error) {
                this.logger.error(`Error reviewing response ${responseId}:`, error);
                throw new common_1.BadRequestException(`Failed to review response: ${error.message}`);
            }
            this.logger.log(`Reviewed response ${responseId}: ${reviewDto.status} by user ${userId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Unexpected error reviewing response ${responseId}:`, error);
            throw new common_1.BadRequestException('Failed to review response');
        }
    }
    async verifyFormAccess(clubId, formId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: form, error } = await supabase
            .from('club_forms')
            .select('id, name, is_active, auto_approve')
            .eq('id', formId)
            .eq('club_id', clubId)
            .single();
        if (error || !form) {
            throw new common_1.NotFoundException(`Form with ID ${formId} not found in club ${clubId}`);
        }
        if (!form.is_active) {
            throw new common_1.BadRequestException('This form is not currently active');
        }
        return form;
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
            throw new common_1.ForbiddenException('Only club officers and advisors can view responses');
        }
    }
    async validateAnswers(formId, answers) {
        const supabase = this.supabaseService.getServiceClient();
        const questionIds = answers.map((a) => a.question_id);
        const uniqueQuestionIds = new Set(questionIds);
        if (questionIds.length !== uniqueQuestionIds.size) {
            throw new common_1.BadRequestException('Duplicate question_id found in answers. Each question can only be answered once.');
        }
        const { data: questions, error } = await supabase
            .from('club_form_questions')
            .select(`
        id,
        question_text,
        question_type,
        required,
        options:club_form_question_options(
          id,
          option_text,
          option_value
        )
      `)
            .eq('form_id', formId)
            .order('order_index');
        if (error) {
            throw new common_1.BadRequestException('Failed to validate form questions');
        }
        const requiredQuestions = questions.filter((q) => q.required);
        const answeredQuestionIds = answers.map((a) => a.question_id);
        for (const question of requiredQuestions) {
            if (!answeredQuestionIds.includes(question.id)) {
                throw new common_1.BadRequestException(`Required question "${question.question_text}" is missing`);
            }
        }
        for (const answer of answers) {
            const question = questions.find((q) => q.id === answer.question_id);
            if (!question) {
                throw new common_1.BadRequestException(`Invalid question ID: ${answer.question_id}`);
            }
            switch (question.question_type) {
                case 'dropdown':
                case 'radio':
                    if (!answer.answer_value) {
                        throw new common_1.BadRequestException(`Answer value is required for ${question.question_type} question "${question.question_text}"`);
                    }
                    const validValues = question.options.map((opt) => opt.option_value);
                    if (!validValues.includes(answer.answer_value)) {
                        throw new common_1.BadRequestException(`Invalid answer value "${answer.answer_value}" for question "${question.question_text}". Valid options: ${validValues.join(', ')}`);
                    }
                    break;
                case 'checkbox':
                    if (!answer.answer_value) {
                        throw new common_1.BadRequestException(`Answer value is required for checkbox question "${question.question_text}"`);
                    }
                    let selectedValues;
                    try {
                        selectedValues = JSON.parse(answer.answer_value);
                        if (!Array.isArray(selectedValues)) {
                            selectedValues = answer.answer_value
                                .split(',')
                                .map((v) => v.trim());
                        }
                    }
                    catch {
                        selectedValues = answer.answer_value
                            .split(',')
                            .map((v) => v.trim());
                    }
                    const validCheckboxValues = question.options.map((opt) => opt.option_value);
                    for (const value of selectedValues) {
                        if (!validCheckboxValues.includes(value)) {
                            throw new common_1.BadRequestException(`Invalid checkbox value "${value}" for question "${question.question_text}". Valid options: ${validCheckboxValues.join(', ')}`);
                        }
                    }
                    break;
                case 'text':
                case 'textarea':
                case 'number':
                case 'email':
                case 'date':
                    const hasTextAnswer = answer.answer_text && answer.answer_text.trim().length > 0;
                    const hasValueAnswer = answer.answer_value && answer.answer_value.trim().length > 0;
                    if (!hasTextAnswer && !hasValueAnswer) {
                        throw new common_1.BadRequestException(`Answer is required for ${question.question_type} question "${question.question_text}"`);
                    }
                    break;
                default:
                    throw new common_1.BadRequestException(`Unknown question type: ${question.question_type}`);
            }
        }
    }
};
exports.ClubFormResponsesService = ClubFormResponsesService;
exports.ClubFormResponsesService = ClubFormResponsesService = ClubFormResponsesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ClubFormResponsesService);
//# sourceMappingURL=club-form-responses.service.js.map