import { GradingService } from '../services/grading.service';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
export declare class GradingController {
    private readonly gradingService;
    private readonly logger;
    constructor(gradingService: GradingService);
    getUngradedAnswers(quizId: string, user: SupabaseUser): Promise<any>;
    gradeAnswer(answerId: string, gradeDto: GradeAnswerDto, user: SupabaseUser): Promise<any>;
}
