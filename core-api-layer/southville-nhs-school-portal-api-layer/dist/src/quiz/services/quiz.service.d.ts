import { SupabaseService } from '../../supabase/supabase.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuizQuestionDto, CreateQuizSettingsDto, PublishQuizDto } from '../dto';
import { Quiz, QuizQuestion, QuizSettings } from '../entities';
export declare class QuizService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    createQuiz(createQuizDto: CreateQuizDto, teacherId: string): Promise<Quiz>;
    findAllQuizzes(filters?: any): Promise<any>;
    findQuizById(quizId: string): Promise<Quiz>;
    updateQuiz(quizId: string, updateQuizDto: UpdateQuizDto, teacherId: string): Promise<Quiz>;
    createQuizVersion(originalQuizId: string, updateQuizDto: UpdateQuizDto, teacherId: string): Promise<Quiz>;
    deleteQuiz(quizId: string, teacherId: string): Promise<void>;
    addQuestion(quizId: string, createQuestionDto: CreateQuizQuestionDto, teacherId: string): Promise<QuizQuestion>;
    publishQuiz(quizId: string, publishDto: PublishQuizDto, teacherId: string): Promise<Quiz>;
    createQuizSettings(quizId: string, settingsDto: CreateQuizSettingsDto, teacherId: string): Promise<QuizSettings>;
    assignQuizToSections(quizId: string, sectionIds: string[], teacherId: string, overrides?: {
        startDate?: string;
        endDate?: string;
        timeLimit?: number;
        sectionSettings?: any;
    }): Promise<void>;
    getQuizSections(quizId: string): Promise<any[]>;
    removeQuizFromAllSections(quizId: string, teacherId: string): Promise<void>;
    removeQuizFromSections(quizId: string, sectionIds: string[], teacherId: string): Promise<void>;
    getAvailableQuizzes(studentId: string, filters?: {
        subjectId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<any>;
    cloneQuiz(originalQuizId: string, teacherId: string, newTitle?: string): Promise<Quiz>;
    getQuizPreview(quizId: string, teacherId: string): Promise<any>;
    private getMetadataType;
}
