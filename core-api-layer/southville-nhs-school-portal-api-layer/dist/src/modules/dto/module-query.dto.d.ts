export declare class ModuleQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    sectionId?: string;
    isGlobal?: boolean;
    uploadedBy?: string;
    includeDeleted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
