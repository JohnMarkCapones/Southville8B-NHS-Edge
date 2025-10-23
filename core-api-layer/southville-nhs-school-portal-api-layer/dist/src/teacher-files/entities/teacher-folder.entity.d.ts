export declare class TeacherFolder {
    id: string;
    name: string;
    description?: string;
    parent_id?: string;
    is_deleted: boolean;
    deleted_at?: string;
    deleted_by?: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}
export declare class TeacherFolderWithChildren extends TeacherFolder {
    children?: TeacherFolderWithChildren[];
    file_count?: number;
}
