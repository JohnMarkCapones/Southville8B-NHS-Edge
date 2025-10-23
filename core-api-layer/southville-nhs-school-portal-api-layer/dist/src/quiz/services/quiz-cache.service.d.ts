import { Cache } from 'cache-manager';
export declare class QuizCacheService {
    private cacheManager;
    private readonly logger;
    private readonly DEFAULT_TTL;
    private readonly QUIZ_TTL;
    private readonly QUESTIONS_TTL;
    private readonly ANALYTICS_TTL;
    private readonly STUDENT_QUIZZES_TTL;
    constructor(cacheManager: Cache);
    getQuiz(quizId: string): Promise<any | null>;
    setQuiz(quizId: string, quiz: any): Promise<void>;
    getQuizQuestions(quizId: string): Promise<any | null>;
    setQuizQuestions(quizId: string, questions: any): Promise<void>;
    getQuizSettings(quizId: string): Promise<any | null>;
    setQuizSettings(quizId: string, settings: any): Promise<void>;
    getQuizSections(quizId: string): Promise<any | null>;
    setQuizSections(quizId: string, sections: any): Promise<void>;
    getStudentQuizzes(studentId: string): Promise<any | null>;
    setStudentQuizzes(studentId: string, quizzes: any): Promise<void>;
    getAnalytics(quizId: string): Promise<any | null>;
    setAnalytics(quizId: string, analytics: any): Promise<void>;
    invalidateQuiz(quizId: string): Promise<void>;
    invalidateStudentQuizzes(studentId: string): Promise<void>;
    invalidateAnalytics(quizId: string): Promise<void>;
    clearAll(): Promise<void>;
    getCacheStats(): Promise<{
        keys: string[];
        size: number;
    }>;
    private getQuizKey;
    private getQuestionsKey;
    private getSettingsKey;
    private getSectionsKey;
    private getStudentQuizzesKey;
    private getAnalyticsKey;
}
