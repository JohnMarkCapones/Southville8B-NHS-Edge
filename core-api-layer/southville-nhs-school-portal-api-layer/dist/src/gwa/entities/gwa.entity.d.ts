export declare enum GradingPeriod {
    Q1 = "Q1",
    Q2 = "Q2",
    Q3 = "Q3",
    Q4 = "Q4"
}
export declare enum HonorStatus {
    NONE = "None",
    WITH_HONORS = "With Honors",
    WITH_HIGH_HONORS = "With High Honors",
    WITH_HIGHEST_HONORS = "With Highest Honors"
}
export declare class Gwa {
    id: string;
    student_id: string;
    gwa: number;
    grading_period: GradingPeriod;
    school_year: string;
    remarks?: string;
    honor_status: HonorStatus;
    recorded_by: string;
    created_at: string;
    updated_at: string;
    student?: {
        id: string;
        first_name: string;
        last_name: string;
        middle_name?: string;
        student_id: string;
        lrn_id: string;
        grade_level?: string;
        section?: {
            id: string;
            name: string;
            grade_level: string;
        };
    };
    teacher?: {
        id: string;
        first_name: string;
        last_name: string;
        middle_name?: string;
        advisory_section?: {
            id: string;
            name: string;
            grade_level: string;
        };
    };
}
