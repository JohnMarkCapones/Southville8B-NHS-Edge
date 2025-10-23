import { CreateQuizChoiceDto } from './create-quiz-choice.dto';
export declare class CreateQuizQuestionDto {
    questionText: string;
    questionType: string;
    orderIndex: number;
    points?: number;
    allowPartialCredit?: boolean;
    timeLimitSeconds?: number;
    isPoolQuestion?: boolean;
    sourceQuestionBankId?: string;
    choices?: CreateQuizChoiceDto[];
    metadata?: any;
}
