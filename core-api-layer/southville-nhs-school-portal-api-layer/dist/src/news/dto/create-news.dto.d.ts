export declare class CreateNewsDto {
    title: string;
    description?: string;
    articleJson: object;
    articleHtml: string;
    categoryId?: string;
    tags?: string[];
    visibility?: 'public' | 'students' | 'teachers' | 'private';
    scheduledDate?: string;
    coAuthorIds?: string[];
    featuredImageUrl?: string;
    r2FeaturedImageKey?: string;
}
