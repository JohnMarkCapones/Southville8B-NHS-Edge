export declare class StudentRanking {
    id: string;
    student_id: string;
    grade_level: string;
    rank: number;
    honor_status?: string;
    quarter: string;
    school_year: string;
    created_at: string;
    updated_at: string;
    student?: {
        id: string;
        first_name: string;
        last_name: string;
        student_id: string;
        grade_level: string;
    };
}
