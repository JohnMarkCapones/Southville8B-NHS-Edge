export declare enum QuestionType {
    TEXT = "text",
    TEXTAREA = "textarea",
    DROPDOWN = "dropdown",
    RADIO = "radio",
    CHECKBOX = "checkbox",
    NUMBER = "number",
    EMAIL = "email",
    DATE = "date"
}
export declare class CreateQuestionOptionDto {
    option_text: string;
    option_value: string;
    order_index?: number;
}
export declare class CreateFormQuestionDto {
    question_text: string;
    question_type?: QuestionType;
    required?: boolean;
    order_index?: number;
    options?: CreateQuestionOptionDto[];
}
