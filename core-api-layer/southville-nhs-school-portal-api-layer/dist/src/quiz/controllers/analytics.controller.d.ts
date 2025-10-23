import { AnalyticsService } from '../services/analytics.service';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService);
    getQuizAnalytics(quizId: string, user: SupabaseUser): Promise<any>;
    getQuestionAnalytics(quizId: string, user: SupabaseUser): Promise<any>;
    getStudentPerformance(quizId: string, user: SupabaseUser): Promise<any>;
}
