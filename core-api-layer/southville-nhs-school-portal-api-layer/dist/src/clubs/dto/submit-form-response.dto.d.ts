export declare enum ResponseStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class FormAnswerDto {
    question_id: string;
    answer_text?: string;
    answer_value?: string;
}
export declare class SubmitFormResponseDto {
    answers: FormAnswerDto[];
}
