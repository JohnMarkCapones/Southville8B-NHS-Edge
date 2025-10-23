export declare class QuestionBank {
    id: string;
    teacher_id: string;
    question_text: string;
    question_type: string;
    subject_id?: string;
    topic?: string;
    difficulty?: string;
    tags?: string[];
    default_points: number;
    choices?: any;
    correct_answer?: any;
    allow_partial_credit: boolean;
    time_limit_seconds?: number;
    created_at: string;
    updated_at: string;
}
