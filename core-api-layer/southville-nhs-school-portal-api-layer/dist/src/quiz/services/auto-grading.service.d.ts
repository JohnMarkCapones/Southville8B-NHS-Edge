import { SupabaseService } from '../../supabase/supabase.service';
export interface GradingResult {
    isCorrect: boolean | null;
    pointsAwarded: number;
    feedback?: string;
}
export declare class AutoGradingService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    gradeAnswer(questionId: string, studentAnswer: {
        choiceId?: string;
        choiceIds?: string[];
        answerText?: string;
        answerJson?: any;
    }): Promise<GradingResult>;
    private gradeMultipleChoice;
    private gradeTrueFalse;
    private gradeCheckbox;
    private gradeFillInBlank;
    private gradeShortAnswer;
    private gradeMatching;
    private gradeOrdering;
    gradeQuizAttempt(attemptId: string): Promise<{
        totalScore: number;
        maxScore: number;
        gradedCount: number;
        manualGradingRequired: number;
    }>;
}
