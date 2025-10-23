export declare class CreateQuizDto {
    title: string;
    description?: string;
    subjectId?: string;
    type?: string;
    gradingType?: string;
    timeLimit?: number;
    startDate?: string;
    endDate?: string;
    visibility?: string;
    questionPoolSize?: number;
    questionsToDisplay?: number;
    allowRetakes?: boolean;
    allowBacktracking?: boolean;
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
    totalPoints?: number;
    passingScore?: number;
}
