export declare class ClubMembership {
    id: string;
    studentId: string;
    clubId: string;
    positionId: string;
    joinedAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    student?: any;
    club?: any;
    position?: any;
}
