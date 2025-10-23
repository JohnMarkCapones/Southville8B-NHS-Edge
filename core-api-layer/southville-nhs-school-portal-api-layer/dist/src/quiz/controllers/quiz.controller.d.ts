import { QuizService } from '../services/quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuizQuestionDto, CreateQuizSettingsDto, PublishQuizDto } from '../dto';
import { AssignQuizToSectionsDto } from '../dto/assign-quiz-to-sections.dto';
import { Quiz, QuizQuestion, QuizSettings } from '../entities';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
export declare class QuizController {
    private readonly quizService;
    private readonly logger;
    constructor(quizService: QuizService);
    getAvailableQuizzes(user: SupabaseUser, page?: number, limit?: number, subjectId?: string): Promise<any>;
    createQuiz(createQuizDto: CreateQuizDto, user: SupabaseUser): Promise<Quiz>;
    findAllQuizzes(user: SupabaseUser, page?: number, limit?: number, teacherId?: string, subjectId?: string, status?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    findQuizById(id: string, user: SupabaseUser): Promise<Quiz>;
    updateQuiz(id: string, updateQuizDto: UpdateQuizDto, user: SupabaseUser): Promise<Quiz>;
    deleteQuiz(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
    addQuestion(quizId: string, createQuestionDto: CreateQuizQuestionDto, user: SupabaseUser): Promise<QuizQuestion>;
    createQuizSettings(quizId: string, settingsDto: CreateQuizSettingsDto, user: SupabaseUser): Promise<QuizSettings>;
    publishQuiz(quizId: string, publishDto: PublishQuizDto, user: SupabaseUser): Promise<Quiz>;
    assignQuizToSections(quizId: string, assignDto: AssignQuizToSectionsDto, user: SupabaseUser): Promise<{
        message: string;
    }>;
    getQuizSections(quizId: string): Promise<any[]>;
    removeQuizFromSections(quizId: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
    cloneQuiz(quizId: string, newTitle: string, user: SupabaseUser): Promise<Quiz>;
    getQuizPreview(quizId: string, user: SupabaseUser): Promise<any>;
}
