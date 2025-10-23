export declare class CreateQuestionBankDto {
    questionText: string;
    questionType: string;
    subjectId?: string;
    topic?: string;
    difficulty?: string;
    tags?: string[];
    defaultPoints?: number;
    choices?: any;
    correctAnswer?: any;
    allowPartialCredit?: boolean;
    timeLimitSeconds?: number;
}
