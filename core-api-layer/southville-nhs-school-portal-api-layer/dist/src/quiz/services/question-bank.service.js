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
var QuestionBankService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let QuestionBankService = QuestionBankService_1 = class QuestionBankService {
    supabaseService;
    logger = new common_1.Logger(QuestionBankService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto, teacherId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: question, error } = await supabase
                .from('question_bank')
                .insert({
                teacher_id: teacherId,
                question_text: createDto.questionText,
                question_type: createDto.questionType,
                subject_id: createDto.subjectId,
                topic: createDto.topic,
                difficulty: createDto.difficulty,
                tags: createDto.tags,
                default_points: createDto.defaultPoints || 1,
                choices: createDto.choices,
                correct_answer: createDto.correctAnswer,
                allow_partial_credit: createDto.allowPartialCredit || false,
                time_limit_seconds: createDto.timeLimitSeconds,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating question bank item:', error);
                throw new common_1.InternalServerErrorException(`Failed to create question: ${error.message}`);
            }
            this.logger.log(`Question bank item created: ${question.id}`);
            return question;
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error creating question bank item:', error);
            throw new common_1.InternalServerErrorException('Failed to create question');
        }
    }
    async findAll(filters = {}) {
        const supabase = this.supabaseService.getClient();
        const { page = 1, limit = 10, teacherId, subjectId, topic, difficulty, questionType, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        let query = supabase.from('question_bank').select('*', { count: 'exact' });
        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }
        if (subjectId) {
            query = query.eq('subject_id', subjectId);
        }
        if (topic) {
            query = query.eq('topic', topic);
        }
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }
        if (questionType) {
            query = query.eq('question_type', questionType);
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching question bank:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch questions');
        }
        return {
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }
    async findOne(id, teacherId) {
        const supabase = this.supabaseService.getClient();
        const { data: question, error } = await supabase
            .from('question_bank')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException('Question not found');
            }
            this.logger.error('Error fetching question:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch question');
        }
        if (question.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only view your own question bank items');
        }
        return question;
    }
    async update(id, updateDto, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        await this.findOne(id, teacherId);
        const { data: updatedQuestion, error } = await supabase
            .from('question_bank')
            .update({
            ...(updateDto.questionText && { question_text: updateDto.questionText }),
            ...(updateDto.questionType && { question_type: updateDto.questionType }),
            ...(updateDto.subjectId !== undefined && {
                subject_id: updateDto.subjectId,
            }),
            ...(updateDto.topic !== undefined && { topic: updateDto.topic }),
            ...(updateDto.difficulty !== undefined && {
                difficulty: updateDto.difficulty,
            }),
            ...(updateDto.tags !== undefined && { tags: updateDto.tags }),
            ...(updateDto.defaultPoints !== undefined && {
                default_points: updateDto.defaultPoints,
            }),
            ...(updateDto.choices !== undefined && { choices: updateDto.choices }),
            ...(updateDto.correctAnswer !== undefined && {
                correct_answer: updateDto.correctAnswer,
            }),
            ...(updateDto.allowPartialCredit !== undefined && {
                allow_partial_credit: updateDto.allowPartialCredit,
            }),
            ...(updateDto.timeLimitSeconds !== undefined && {
                time_limit_seconds: updateDto.timeLimitSeconds,
            }),
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating question:', error);
            throw new common_1.InternalServerErrorException('Failed to update question');
        }
        this.logger.log(`Question bank item updated: ${id}`);
        return updatedQuestion;
    }
    async remove(id, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        await this.findOne(id, teacherId);
        const { error } = await supabase.from('question_bank').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting question:', error);
            throw new common_1.InternalServerErrorException('Failed to delete question');
        }
        this.logger.log(`Question bank item deleted: ${id}`);
    }
};
exports.QuestionBankService = QuestionBankService;
exports.QuestionBankService = QuestionBankService = QuestionBankService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], QuestionBankService);
//# sourceMappingURL=question-bank.service.js.map