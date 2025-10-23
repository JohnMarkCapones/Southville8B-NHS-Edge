export declare class NewsCoAuthor {
    id: string;
    news_id: string;
    user_id: string;
    role: 'co-author' | 'editor' | 'contributor';
    added_at: Date;
    added_by: string;
    user?: any;
    added_by_user?: any;
}
