import { GradingPeriod } from '../entities/gwa.entity';
export declare class QueryGwaDto {
    studentId?: string;
    gradingPeriod?: GradingPeriod;
    schoolYear?: string;
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'updated_at' | 'gwa' | 'grading_period' | 'school_year';
    sortOrder?: 'ASC' | 'DESC';
}
