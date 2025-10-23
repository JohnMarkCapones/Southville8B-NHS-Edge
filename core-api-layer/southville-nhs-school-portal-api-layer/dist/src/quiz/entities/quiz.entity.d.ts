export declare class Quiz {
    quiz_id: string;
    title: string;
    description?: string;
    subject_id?: string;
    teacher_id: string;
    type: string;
    grading_type: string;
    time_limit?: number;
    start_date?: string;
    end_date?: string;
    status: string;
    version: number;
    parent_quiz_id?: string;
    visibility: string;
    question_pool_size?: number;
    questions_to_display?: number;
    allow_retakes: boolean;
    allow_backtracking: boolean;
    shuffle_questions: boolean;
    shuffle_choices: boolean;
    total_points?: number;
    passing_score?: number;
    created_at: string;
    updated_at: string;
}
