export declare class Module {
    id: string;
    title: string;
    description?: string;
    file_url?: string;
    uploaded_by?: string;
    r2_file_key?: string;
    file_size_bytes?: number;
    mime_type?: string;
    is_global: boolean;
    is_deleted: boolean;
    deleted_at?: string;
    deleted_by?: string;
    subject_id?: string;
    created_at: string;
    updated_at: string;
}
export declare class SectionModule {
    id: string;
    section_id: string;
    module_id: string;
    visible: boolean;
    assigned_at: string;
    assigned_by?: string;
}
export declare class ModuleWithDetails extends Module {
    uploader?: {
        id: string;
        full_name: string;
        email: string;
    };
    subject?: {
        id: string;
        subject_name: string;
        description?: string;
    };
    sections?: Array<{
        id: string;
        name: string;
        grade_level?: string;
    }>;
    downloadStats?: {
        totalDownloads: number;
        uniqueUsers: number;
        successRate: number;
        lastDownloaded?: string;
    };
}
