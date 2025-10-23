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
var QuizService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let QuizService = QuizService_1 = class QuizService {
    supabaseService;
    logger = new common_1.Logger(QuizService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createQuiz(createQuizDto, teacherId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            if (createQuizDto.questionPoolSize && createQuizDto.questionsToDisplay) {
                if (createQuizDto.questionsToDisplay > createQuizDto.questionPoolSize) {
                    throw new common_1.BadRequestException('Questions to display cannot exceed question pool size');
                }
            }
            const { data: quiz, error } = await supabase
                .from('quizzes')
                .insert({
                title: createQuizDto.title,
                description: createQuizDto.description,
                subject_id: createQuizDto.subjectId,
                teacher_id: teacherId,
                type: createQuizDto.type || 'form',
                grading_type: createQuizDto.gradingType || 'auto',
                time_limit: createQuizDto.timeLimit,
                start_date: createQuizDto.startDate,
                end_date: createQuizDto.endDate,
                visibility: createQuizDto.visibility || 'section_only',
                question_pool_size: createQuizDto.questionPoolSize,
                questions_to_display: createQuizDto.questionsToDisplay,
                allow_retakes: createQuizDto.allowRetakes || false,
                allow_backtracking: createQuizDto.allowBacktracking !== false,
                shuffle_questions: createQuizDto.shuffleQuestions || false,
                shuffle_choices: createQuizDto.shuffleChoices || false,
                total_points: createQuizDto.totalPoints,
                passing_score: createQuizDto.passingScore,
                status: 'draft',
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating quiz:', error);
                throw new common_1.InternalServerErrorException(`Failed to create quiz: ${error.message}`);
            }
            this.logger.log(`Quiz created successfully: ${quiz.quiz_id}`);
            return quiz;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error creating quiz:', error);
            throw new common_1.InternalServerErrorException('Failed to create quiz');
        }
    }
    async findAllQuizzes(filters = {}) {
        const supabase = this.supabaseService.getClient();
        const { page = 1, limit = 10, teacherId, subjectId, status, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        let query = supabase.from('quizzes').select('*', { count: 'exact' });
        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }
        if (subjectId) {
            query = query.eq('subject_id', subjectId);
        }
        if (status) {
            query = query.eq('status', status);
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching quizzes:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch quizzes');
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
    async findQuizById(quizId) {
        const supabase = this.supabaseService.getClient();
        const { data: quiz, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('quiz_id', quizId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException('Quiz not found');
            }
            this.logger.error('Error fetching quiz:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch quiz');
        }
        return quiz;
    }
    async updateQuiz(quizId, updateQuizDto, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only update your own quizzes');
        }
        if (updateQuizDto.questionPoolSize && updateQuizDto.questionsToDisplay) {
            if (updateQuizDto.questionsToDisplay > updateQuizDto.questionPoolSize) {
                throw new common_1.BadRequestException('Questions to display cannot exceed question pool size');
            }
        }
        if (quiz.status === 'published') {
            const { data: activeAttempts, error: attemptsError } = await supabase
                .from('quiz_attempts')
                .select('attempt_id')
                .eq('quiz_id', quizId)
                .in('status', ['in_progress', 'submitted'])
                .limit(1);
            if (attemptsError) {
                this.logger.error('Error checking active attempts:', attemptsError);
            }
            if (activeAttempts && activeAttempts.length > 0) {
                this.logger.log(`Quiz ${quizId} has active attempts, creating new version`);
                return await this.createQuizVersion(quizId, updateQuizDto, teacherId);
            }
        }
        const { data: updatedQuiz, error } = await supabase
            .from('quizzes')
            .update({
            ...(updateQuizDto.title && { title: updateQuizDto.title }),
            ...(updateQuizDto.description !== undefined && {
                description: updateQuizDto.description,
            }),
            ...(updateQuizDto.subjectId !== undefined && {
                subject_id: updateQuizDto.subjectId,
            }),
            ...(updateQuizDto.type && { type: updateQuizDto.type }),
            ...(updateQuizDto.gradingType && {
                grading_type: updateQuizDto.gradingType,
            }),
            ...(updateQuizDto.timeLimit !== undefined && {
                time_limit: updateQuizDto.timeLimit,
            }),
            ...(updateQuizDto.startDate !== undefined && {
                start_date: updateQuizDto.startDate,
            }),
            ...(updateQuizDto.endDate !== undefined && {
                end_date: updateQuizDto.endDate,
            }),
            ...(updateQuizDto.visibility && {
                visibility: updateQuizDto.visibility,
            }),
            ...(updateQuizDto.questionPoolSize !== undefined && {
                question_pool_size: updateQuizDto.questionPoolSize,
            }),
            ...(updateQuizDto.questionsToDisplay !== undefined && {
                questions_to_display: updateQuizDto.questionsToDisplay,
            }),
            ...(updateQuizDto.allowRetakes !== undefined && {
                allow_retakes: updateQuizDto.allowRetakes,
            }),
            ...(updateQuizDto.allowBacktracking !== undefined && {
                allow_backtracking: updateQuizDto.allowBacktracking,
            }),
            ...(updateQuizDto.shuffleQuestions !== undefined && {
                shuffle_questions: updateQuizDto.shuffleQuestions,
            }),
            ...(updateQuizDto.shuffleChoices !== undefined && {
                shuffle_choices: updateQuizDto.shuffleChoices,
            }),
            ...(updateQuizDto.totalPoints !== undefined && {
                total_points: updateQuizDto.totalPoints,
            }),
            ...(updateQuizDto.passingScore !== undefined && {
                passing_score: updateQuizDto.passingScore,
            }),
            updated_at: new Date().toISOString(),
        })
            .eq('quiz_id', quizId)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating quiz:', error);
            throw new common_1.InternalServerErrorException('Failed to update quiz');
        }
        this.logger.log(`Quiz updated successfully: ${quizId}`);
        return updatedQuiz;
    }
    async createQuizVersion(originalQuizId, updateQuizDto, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const originalQuiz = await this.findQuizById(originalQuizId);
        if (originalQuiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only create versions of your own quizzes');
        }
        const newVersion = (originalQuiz.version || 1) + 1;
        const { data: newQuiz, error: newQuizError } = await supabase
            .from('quizzes')
            .insert({
            title: updateQuizDto.title || originalQuiz.title,
            description: updateQuizDto.description ?? originalQuiz.description,
            subject_id: updateQuizDto.subjectId ?? originalQuiz.subject_id,
            teacher_id: teacherId,
            type: updateQuizDto.type || originalQuiz.type,
            grading_type: updateQuizDto.gradingType || originalQuiz.grading_type,
            time_limit: updateQuizDto.timeLimit ?? originalQuiz.time_limit,
            start_date: updateQuizDto.startDate ?? originalQuiz.start_date,
            end_date: updateQuizDto.endDate ?? originalQuiz.end_date,
            status: originalQuiz.status,
            version: newVersion,
            parent_quiz_id: originalQuizId,
            visibility: updateQuizDto.visibility || originalQuiz.visibility,
            question_pool_size: updateQuizDto.questionPoolSize ?? originalQuiz.question_pool_size,
            questions_to_display: updateQuizDto.questionsToDisplay ?? originalQuiz.questions_to_display,
            allow_retakes: updateQuizDto.allowRetakes ?? originalQuiz.allow_retakes,
            allow_backtracking: updateQuizDto.allowBacktracking ?? originalQuiz.allow_backtracking,
            shuffle_questions: updateQuizDto.shuffleQuestions ?? originalQuiz.shuffle_questions,
            shuffle_choices: updateQuizDto.shuffleChoices ?? originalQuiz.shuffle_choices,
            total_points: updateQuizDto.totalPoints ?? originalQuiz.total_points,
            passing_score: updateQuizDto.passingScore ?? originalQuiz.passing_score,
        })
            .select()
            .single();
        if (newQuizError) {
            this.logger.error('Error creating quiz version:', newQuizError);
            throw new common_1.InternalServerErrorException('Failed to create quiz version');
        }
        const { data: originalQuestions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', originalQuizId);
        if (questionsError) {
            this.logger.error('Error fetching original questions:', questionsError);
        }
        else if (originalQuestions && originalQuestions.length > 0) {
            const questionIdMap = new Map();
            for (const originalQuestion of originalQuestions) {
                const { data: newQuestion, error: questionError } = await supabase
                    .from('quiz_questions')
                    .insert({
                    quiz_id: newQuiz.quiz_id,
                    question_text: originalQuestion.question_text,
                    question_type: originalQuestion.question_type,
                    order_index: originalQuestion.order_index,
                    points: originalQuestion.points,
                    allow_partial_credit: originalQuestion.allow_partial_credit,
                    time_limit_seconds: originalQuestion.time_limit_seconds,
                    is_pool_question: originalQuestion.is_pool_question,
                    source_question_bank_id: originalQuestion.source_question_bank_id,
                    correct_answer: originalQuestion.correct_answer,
                    settings: originalQuestion.settings,
                })
                    .select('question_id')
                    .single();
                if (questionError) {
                    this.logger.error('Error creating question copy:', questionError);
                    continue;
                }
                questionIdMap.set(originalQuestion.question_id, newQuestion.question_id);
                const { data: originalChoices } = await supabase
                    .from('quiz_choices')
                    .select('*')
                    .eq('question_id', originalQuestion.question_id);
                if (originalChoices && originalChoices.length > 0) {
                    const choicesToInsert = originalChoices.map((choice) => ({
                        question_id: newQuestion.question_id,
                        choice_text: choice.choice_text,
                        is_correct: choice.is_correct,
                        order_index: choice.order_index,
                        metadata: choice.metadata,
                    }));
                    await supabase.from('quiz_choices').insert(choicesToInsert);
                }
            }
        }
        const { data: originalSections } = await supabase
            .from('quiz_sections')
            .select('*')
            .eq('quiz_id', originalQuizId);
        if (originalSections && originalSections.length > 0) {
            const sectionsToInsert = originalSections.map((section) => ({
                quiz_id: newQuiz.quiz_id,
                section_id: section.section_id,
                start_date: section.start_date,
                end_date: section.end_date,
                time_limit: section.time_limit,
                section_settings: section.section_settings,
            }));
            await supabase.from('quiz_sections').insert(sectionsToInsert);
        }
        this.logger.log(`Quiz version ${newVersion} created for quiz ${originalQuizId}`);
        return newQuiz;
    }
    async deleteQuiz(quizId, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only delete your own quizzes');
        }
        const { error } = await supabase
            .from('quizzes')
            .update({
            status: 'archived',
            updated_at: new Date().toISOString(),
        })
            .eq('quiz_id', quizId);
        if (error) {
            this.logger.error('Error deleting quiz:', error);
            throw new common_1.InternalServerErrorException('Failed to delete quiz');
        }
        this.logger.log(`Quiz archived successfully: ${quizId}`);
    }
    async addQuestion(quizId, createQuestionDto, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only add questions to your own quizzes');
        }
        const questionData = {
            quiz_id: quizId,
            question_text: createQuestionDto.questionText,
            question_type: createQuestionDto.questionType,
            order_index: createQuestionDto.orderIndex,
            points: createQuestionDto.points || 1,
            allow_partial_credit: createQuestionDto.allowPartialCredit || false,
            time_limit_seconds: createQuestionDto.timeLimitSeconds,
            is_pool_question: createQuestionDto.isPoolQuestion || false,
        };
        if (createQuestionDto.sourceQuestionBankId) {
            questionData.source_question_bank_id = createQuestionDto.sourceQuestionBankId;
        }
        const { data: question, error: questionError } = await supabase
            .from('quiz_questions')
            .insert(questionData)
            .select()
            .single();
        if (questionError) {
            this.logger.error('Error creating question:', questionError);
            throw new common_1.InternalServerErrorException('Failed to create question');
        }
        if (createQuestionDto.choices && createQuestionDto.choices.length > 0) {
            const choicesToInsert = createQuestionDto.choices.map((choice) => ({
                question_id: question.question_id,
                choice_text: choice.choiceText,
                is_correct: choice.isCorrect || false,
                order_index: choice.orderIndex,
                metadata: choice.metadata,
            }));
            const { error: choicesError } = await supabase
                .from('quiz_choices')
                .insert(choicesToInsert);
            if (choicesError) {
                await supabase
                    .from('quiz_questions')
                    .delete()
                    .eq('question_id', question.question_id);
                this.logger.error('Error creating choices:', choicesError);
                throw new common_1.InternalServerErrorException('Failed to create choices');
            }
        }
        if (createQuestionDto.metadata) {
            const { error: metadataError } = await supabase
                .from('quiz_question_metadata')
                .insert({
                question_id: question.question_id,
                metadata_type: this.getMetadataType(createQuestionDto.questionType),
                metadata: createQuestionDto.metadata,
            });
            if (metadataError) {
                this.logger.warn('Error creating question metadata:', metadataError);
            }
        }
        this.logger.log(`Question added to quiz ${quizId}`);
        return question;
    }
    async publishQuiz(quizId, publishDto, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only publish your own quizzes');
        }
        const { data: updatedQuiz, error } = await supabase
            .from('quizzes')
            .update({
            status: publishDto.status,
            updated_at: new Date().toISOString(),
        })
            .eq('quiz_id', quizId)
            .select()
            .single();
        if (error) {
            this.logger.error('Error publishing quiz:', error);
            throw new common_1.InternalServerErrorException('Failed to publish quiz');
        }
        if (publishDto.sectionIds && publishDto.sectionIds.length > 0) {
            const sectionsToInsert = publishDto.sectionIds.map((sectionId) => ({
                quiz_id: quizId,
                section_id: sectionId,
            }));
            const { error: sectionsError } = await supabase
                .from('quiz_sections')
                .insert(sectionsToInsert);
            if (sectionsError) {
                this.logger.error('Error assigning quiz to sections:', sectionsError);
                throw new common_1.InternalServerErrorException('Failed to assign quiz to sections');
            }
        }
        this.logger.log(`Quiz published: ${quizId} with status ${publishDto.status}`);
        return updatedQuiz;
    }
    async createQuizSettings(quizId, settingsDto, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only configure settings for your own quizzes');
        }
        const { data: settings, error } = await supabase
            .from('quiz_settings')
            .upsert({
            quiz_id: quizId,
            lockdown_browser: settingsDto.lockdownBrowser || false,
            anti_screenshot: settingsDto.antiScreenshot || false,
            disable_copy_paste: settingsDto.disableCopyPaste || false,
            disable_right_click: settingsDto.disableRightClick || false,
            require_fullscreen: settingsDto.requireFullscreen || false,
            track_tab_switches: settingsDto.trackTabSwitches !== false,
            track_device_changes: settingsDto.trackDeviceChanges !== false,
            track_ip_changes: settingsDto.trackIpChanges !== false,
            tab_switch_warning_threshold: settingsDto.tabSwitchWarningThreshold || 3,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating quiz settings:', error);
            throw new common_1.InternalServerErrorException('Failed to create quiz settings');
        }
        this.logger.log(`Quiz settings configured for quiz ${quizId}`);
        return settings;
    }
    async assignQuizToSections(quizId, sectionIds, teacherId, overrides) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only assign your own quizzes to sections');
        }
        if (quiz.status !== 'published') {
            throw new common_1.BadRequestException('Quiz must be published before assigning to sections');
        }
        const sectionsToInsert = sectionIds.map((sectionId) => ({
            quiz_id: quizId,
            section_id: sectionId,
        }));
        const { error: sectionsError } = await supabase
            .from('quiz_sections')
            .upsert(sectionsToInsert, {
            onConflict: 'quiz_id,section_id',
        });
        if (sectionsError) {
            this.logger.error('Error assigning quiz to sections:', sectionsError);
            throw new common_1.InternalServerErrorException('Failed to assign quiz to sections');
        }
        if (overrides && (overrides.startDate || overrides.endDate || overrides.timeLimit)) {
            const settingsToInsert = sectionIds.map((sectionId) => ({
                quiz_id: quizId,
                section_id: sectionId,
                start_date: overrides.startDate || quiz.start_date,
                end_date: overrides.endDate || quiz.end_date,
                time_limit_override: overrides.timeLimit || quiz.time_limit,
            }));
            const { error: settingsError } = await supabase
                .from('quiz_section_settings')
                .upsert(settingsToInsert, {
                onConflict: 'quiz_id,section_id',
            });
            if (settingsError) {
                this.logger.error('Error setting section-specific settings:', settingsError);
                throw new common_1.InternalServerErrorException('Failed to set section-specific settings');
            }
        }
        this.logger.log(`Quiz ${quizId} assigned to ${sectionIds.length} section(s)`);
    }
    async getQuizSections(quizId) {
        const supabase = this.supabaseService.getClient();
        const { data: sections, error } = await supabase
            .from('quiz_sections')
            .select('section_id, assigned_at')
            .eq('quiz_id', quizId);
        if (error) {
            this.logger.error('Error fetching quiz sections:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch quiz sections');
        }
        if (!sections || sections.length === 0) {
            return [];
        }
        const { data: sectionSettings } = await supabase
            .from('quiz_section_settings')
            .select('section_id, start_date, end_date, time_limit_override')
            .eq('quiz_id', quizId);
        const enrichedSections = sections.map((section) => {
            const settings = sectionSettings?.find((s) => s.section_id === section.section_id);
            return {
                section_id: section.section_id,
                assigned_at: section.assigned_at,
                start_date: settings?.start_date || null,
                end_date: settings?.end_date || null,
                time_limit: settings?.time_limit_override || null,
            };
        });
        return enrichedSections;
    }
    async removeQuizFromAllSections(quizId, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only remove your own quizzes from sections');
        }
        const { error } = await supabase
            .from('quiz_sections')
            .delete()
            .eq('quiz_id', quizId);
        if (error) {
            this.logger.error('Error removing quiz from all sections:', error);
            throw new common_1.InternalServerErrorException('Failed to remove quiz from all sections');
        }
        await supabase
            .from('quiz_section_settings')
            .delete()
            .eq('quiz_id', quizId);
        this.logger.log(`Quiz ${quizId} removed from all sections`);
    }
    async removeQuizFromSections(quizId, sectionIds, teacherId) {
        const supabase = this.supabaseService.getServiceClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only remove your own quizzes from sections');
        }
        const { error } = await supabase
            .from('quiz_sections')
            .delete()
            .eq('quiz_id', quizId)
            .in('section_id', sectionIds);
        if (error) {
            this.logger.error('Error removing quiz from sections:', error);
            throw new common_1.InternalServerErrorException('Failed to remove quiz from sections');
        }
        await supabase
            .from('quiz_section_settings')
            .delete()
            .eq('quiz_id', quizId)
            .in('section_id', sectionIds);
        this.logger.log(`Quiz ${quizId} removed from ${sectionIds.length} section(s)`);
    }
    async getAvailableQuizzes(studentId, filters = {}) {
        const supabase = this.supabaseService.getClient();
        const { subjectId, status = 'published', page = 1, limit = 10 } = filters;
        const { data: studentSections, error: sectionsError } = await supabase
            .from('students')
            .select('section_id')
            .eq('user_id', studentId)
            .single();
        if (sectionsError || !studentSections) {
            this.logger.error('Error fetching student sections:', sectionsError);
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        const sectionId = studentSections.section_id;
        const { data: quizSections, error: quizSectionsError } = await supabase
            .from('quiz_sections')
            .select('quiz_id')
            .eq('section_id', sectionId);
        if (quizSectionsError) {
            this.logger.error('Error fetching quiz sections:', quizSectionsError);
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        const quizIds = quizSections?.map((qs) => qs.quiz_id) || [];
        if (quizIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        const { data: sectionSettings } = await supabase
            .from('quiz_section_settings')
            .select('quiz_id, start_date, end_date, time_limit_override')
            .eq('section_id', sectionId)
            .in('quiz_id', quizIds);
        let query = supabase
            .from('quizzes')
            .select('*', { count: 'exact' })
            .eq('status', status)
            .in('quiz_id', quizIds);
        if (subjectId) {
            query = query.eq('subject_id', subjectId);
        }
        const now = new Date().toISOString();
        query = query.or(`start_date.is.null,start_date.lte.${now}`);
        query = query.or(`end_date.is.null,end_date.gte.${now}`);
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        query = query.order('start_date', { ascending: false });
        const { data: quizzes, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching available quizzes:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch available quizzes');
        }
        const enrichedQuizzes = quizzes?.map((quiz) => {
            const settings = sectionSettings?.find((s) => s.quiz_id === quiz.quiz_id);
            return {
                ...quiz,
                sectionStartDate: settings?.start_date || quiz.start_date,
                sectionEndDate: settings?.end_date || quiz.end_date,
                sectionTimeLimit: settings?.time_limit_override || quiz.time_limit,
            };
        });
        return {
            data: enrichedQuizzes || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }
    async cloneQuiz(originalQuizId, teacherId, newTitle) {
        const supabase = this.supabaseService.getServiceClient();
        const originalQuiz = await this.findQuizById(originalQuizId);
        if (originalQuiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only clone your own quizzes');
        }
        const { data: newQuiz, error: quizError } = await supabase
            .from('quizzes')
            .insert({
            title: newTitle || `${originalQuiz.title} (Copy)`,
            description: originalQuiz.description,
            subject_id: originalQuiz.subject_id,
            teacher_id: teacherId,
            type: originalQuiz.type,
            grading_type: originalQuiz.grading_type,
            time_limit: originalQuiz.time_limit,
            start_date: null,
            end_date: null,
            status: 'draft',
            version: 1,
            parent_quiz_id: null,
            visibility: originalQuiz.visibility,
            question_pool_size: originalQuiz.question_pool_size,
            questions_to_display: originalQuiz.questions_to_display,
            allow_retakes: originalQuiz.allow_retakes,
            allow_backtracking: originalQuiz.allow_backtracking,
            shuffle_questions: originalQuiz.shuffle_questions,
            shuffle_choices: originalQuiz.shuffle_choices,
            total_points: originalQuiz.total_points,
            passing_score: originalQuiz.passing_score,
        })
            .select()
            .single();
        if (quizError) {
            this.logger.error('Error cloning quiz:', quizError);
            throw new common_1.InternalServerErrorException('Failed to clone quiz');
        }
        const { data: originalQuestions } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', originalQuizId)
            .order('order_index', { ascending: true });
        if (originalQuestions && originalQuestions.length > 0) {
            for (const originalQuestion of originalQuestions) {
                const { data: newQuestion, error: questionError } = await supabase
                    .from('quiz_questions')
                    .insert({
                    quiz_id: newQuiz.quiz_id,
                    question_text: originalQuestion.question_text,
                    question_type: originalQuestion.question_type,
                    order_index: originalQuestion.order_index,
                    points: originalQuestion.points,
                    allow_partial_credit: originalQuestion.allow_partial_credit,
                    time_limit_seconds: originalQuestion.time_limit_seconds,
                    is_pool_question: originalQuestion.is_pool_question,
                    source_question_bank_id: originalQuestion.source_question_bank_id,
                    correct_answer: originalQuestion.correct_answer,
                    settings: originalQuestion.settings,
                })
                    .select('question_id')
                    .single();
                if (questionError) {
                    this.logger.error('Error cloning question:', questionError);
                    continue;
                }
                const { data: originalChoices } = await supabase
                    .from('quiz_choices')
                    .select('*')
                    .eq('question_id', originalQuestion.question_id)
                    .order('order_index', { ascending: true });
                if (originalChoices && originalChoices.length > 0) {
                    const choicesToInsert = originalChoices.map((choice) => ({
                        question_id: newQuestion.question_id,
                        choice_text: choice.choice_text,
                        is_correct: choice.is_correct,
                        order_index: choice.order_index,
                        metadata: choice.metadata,
                    }));
                    await supabase.from('quiz_choices').insert(choicesToInsert);
                }
                const { data: originalMetadata } = await supabase
                    .from('quiz_question_metadata')
                    .select('*')
                    .eq('question_id', originalQuestion.question_id);
                if (originalMetadata && originalMetadata.length > 0) {
                    const metadataToInsert = originalMetadata.map((meta) => ({
                        question_id: newQuestion.question_id,
                        metadata_type: meta.metadata_type,
                        metadata: meta.metadata,
                    }));
                    await supabase.from('quiz_question_metadata').insert(metadataToInsert);
                }
            }
        }
        const { data: originalSettings } = await supabase
            .from('quiz_settings')
            .select('*')
            .eq('quiz_id', originalQuizId)
            .single();
        if (originalSettings) {
            await supabase.from('quiz_settings').insert({
                quiz_id: newQuiz.quiz_id,
                lockdown_browser: originalSettings.lockdown_browser,
                anti_screenshot: originalSettings.anti_screenshot,
                disable_copy_paste: originalSettings.disable_copy_paste,
                disable_right_click: originalSettings.disable_right_click,
                require_fullscreen: originalSettings.require_fullscreen,
                track_tab_switches: originalSettings.track_tab_switches,
                track_device_changes: originalSettings.track_device_changes,
                track_ip_changes: originalSettings.track_ip_changes,
                tab_switch_warning_threshold: originalSettings.tab_switch_warning_threshold,
            });
        }
        this.logger.log(`Quiz cloned: ${originalQuizId} → ${newQuiz.quiz_id}`);
        return newQuiz;
    }
    async getQuizPreview(quizId, teacherId) {
        const supabase = this.supabaseService.getClient();
        const quiz = await this.findQuizById(quizId);
        if (quiz.teacher_id !== teacherId) {
            throw new common_1.ForbiddenException('You can only preview your own quizzes');
        }
        const { data: questions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select(`
        *,
        quiz_choices (*)
      `)
            .eq('quiz_id', quizId)
            .order('order_index', { ascending: true });
        if (questionsError) {
            throw new common_1.InternalServerErrorException('Failed to fetch quiz questions');
        }
        const { data: settings } = await supabase
            .from('quiz_settings')
            .select('*')
            .eq('quiz_id', quizId)
            .single();
        return {
            quiz,
            questions,
            settings,
            preview: true,
            note: 'This is a preview. Student data will not be recorded.',
        };
    }
    getMetadataType(questionType) {
        const mapping = {
            matching: 'matching_pairs',
            ordering: 'ordering_items',
            drag_drop: 'drag_drop_zones',
            fill_in_blank: 'fill_in_blanks',
        };
        return mapping[questionType] || questionType;
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = QuizService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map