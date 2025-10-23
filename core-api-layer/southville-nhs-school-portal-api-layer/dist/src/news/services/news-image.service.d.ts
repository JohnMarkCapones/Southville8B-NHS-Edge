export declare class NewsImageService {
    private readonly logger;
    extractFirstImage(html: string): string | null;
    extractAllImages(html: string): string[];
    generateDescriptionFromHtml(html: string, maxLength?: number): string;
    validateAndGetFeaturedImage(featuredImageUrl: string | undefined, articleHtml: string): string;
    isValidImageUrl(url: string): boolean;
    countImages(html: string): number;
}
