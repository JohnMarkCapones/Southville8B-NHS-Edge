export declare class TeacherFile {
    id: string;
    folder_id: string;
    title: string;
    description?: string;
    file_url: string;
    r2_file_key: string;
    file_size_bytes: number;
    mime_type: string;
    original_filename: string;
    is_deleted: boolean;
    deleted_at?: string;
    deleted_by?: string;
    uploaded_by: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}
export declare class TeacherFileWithDetails extends TeacherFile {
    folder?: {
        id: string;
        name: string;
        parent_id?: string;
    };
    uploader?: {
        id: string;
        full_name: string;
        email: string;
    };
    download_count?: number;
}
