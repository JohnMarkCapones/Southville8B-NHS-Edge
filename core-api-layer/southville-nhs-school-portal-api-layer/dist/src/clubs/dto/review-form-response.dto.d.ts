export declare enum ReviewStatus {
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class ReviewFormResponseDto {
    status: ReviewStatus;
    review_notes?: string;
}
