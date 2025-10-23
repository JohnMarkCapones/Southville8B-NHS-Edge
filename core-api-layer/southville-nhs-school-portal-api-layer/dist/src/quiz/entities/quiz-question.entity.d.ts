export declare class QuizQuestion {
    question_id: string;
    quiz_id: string;
    question_text: string;
    question_type: string;
    order_index: number;
    points: number;
    allow_partial_credit: boolean;
    time_limit_seconds?: number;
    is_pool_question: boolean;
    source_question_bank_id?: string;
    created_at: string;
    updated_at: string;
}
