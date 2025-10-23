import { SupabaseService } from '../../supabase/supabase.service';
export declare class AnalyticsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getQuizAnalytics(quizId: string, teacherId: string): Promise<any>;
    getQuestionAnalytics(quizId: string, teacherId: string): Promise<any>;
    getStudentPerformance(quizId: string, teacherId: string): Promise<any>;
}
