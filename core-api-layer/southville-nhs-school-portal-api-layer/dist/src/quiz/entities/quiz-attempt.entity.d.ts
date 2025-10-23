export declare class QuizAttempt {
    attempt_id: string;
    quiz_id: string;
    student_id: string;
    attempt_number: number;
    score?: number;
    max_possible_score?: number;
    status: string;
    terminated_by_teacher: boolean;
    termination_reason?: string;
    started_at: string;
    submitted_at?: string;
    time_taken_seconds?: number;
    questions_shown?: string[];
    created_at: string;
}
