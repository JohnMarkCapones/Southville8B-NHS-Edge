"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NewsImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsImageService = void 0;
const common_1 = require("@nestjs/common");
let NewsImageService = NewsImageService_1 = class NewsImageService {
    logger = new common_1.Logger(NewsImageService_1.name);
    extractFirstImage(html) {
        if (!html)
            return null;
        const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/i;
        const match = html.match(imgRegex);
        if (match && match[1]) {
            const imageUrl = match[1];
            this.logger.debug(`Extracted first image from HTML: ${imageUrl}`);
            return imageUrl;
        }
        this.logger.debug('No images found in HTML content');
        return null;
    }
    extractAllImages(html) {
        if (!html)
            return [];
        const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/gi;
        const images = [];
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            images.push(match[1]);
        }
        this.logger.debug(`Extracted ${images.length} images from HTML`);
        return images;
    }
    generateDescriptionFromHtml(html, maxLength = 200) {
        if (!html)
            return '';
        const textOnly = html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (textOnly.length <= maxLength) {
            return textOnly;
        }
        const truncated = textOnly.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            return truncated.substring(0, lastSpace) + '...';
        }
        return truncated + '...';
    }
    validateAndGetFeaturedImage(featuredImageUrl, articleHtml) {
        if (featuredImageUrl && featuredImageUrl.trim()) {
            this.logger.debug('Using user-provided featured image');
            return featuredImageUrl.trim();
        }
        const firstImage = this.extractFirstImage(articleHtml);
        if (!firstImage) {
            throw new common_1.BadRequestException('Article must have at least one image. Either upload a featured image or add an image to your article content.');
        }
        this.logger.debug('Using first article image as featured image');
        return firstImage;
    }
    isValidImageUrl(url) {
        if (!url)
            return false;
        const urlPattern = /^https?:\/\/.+/i;
        const imageExtPattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
        return urlPattern.test(url) && imageExtPattern.test(url);
    }
    countImages(html) {
        return this.extractAllImages(html).length;
    }
};
exports.NewsImageService = NewsImageService;
exports.NewsImageService = NewsImageService = NewsImageService_1 = __decorate([
    (0, common_1.Injectable)()
], NewsImageService);
//# sourceMappingURL=news-image.service.js.map