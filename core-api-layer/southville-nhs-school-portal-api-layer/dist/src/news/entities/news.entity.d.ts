export declare class News {
    id: string;
    title: string;
    slug: string;
    author_id: string;
    domain_id: string;
    article_json: object;
    article_html: string;
    description: string;
    featured_image_url: string;
    r2_featured_image_key: string;
    category_id: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'archived';
    visibility: 'public' | 'students' | 'teachers' | 'private';
    published_date: Date;
    scheduled_date: Date;
    views: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    deleted_by: string;
    author?: any;
    domain?: any;
    category?: any;
    tags?: any[];
    co_authors?: any[];
    approval_history?: any[];
}
