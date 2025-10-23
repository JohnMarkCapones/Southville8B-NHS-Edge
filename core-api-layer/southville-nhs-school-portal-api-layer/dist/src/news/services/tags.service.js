"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TagsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let TagsService = TagsService_1 = class TagsService {
    supabaseService;
    logger = new common_1.Logger(TagsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    mapToDto(dbRecord) {
        return {
            id: dbRecord.id,
            name: dbRecord.name,
            slug: dbRecord.slug,
            created_at: dbRecord.created_at,
        };
    }
    async getOrCreate(name) {
        const supabase = this.supabaseService.getServiceClient();
        const trimmedName = name.trim();
        const slug = this.generateSlug(trimmedName);
        const { data: existing, error: findError } = await supabase
            .from('tags')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        if (findError) {
            this.logger.error('Error finding tag:', findError);
            throw new common_1.BadRequestException('Failed to find tag');
        }
        if (existing) {
            this.logger.debug(`Tag already exists: ${trimmedName} (${slug})`);
            return this.mapToDto(existing);
        }
        this.logger.debug(`Creating new tag: ${trimmedName} (${slug})`);
        const { data, error } = await supabase
            .from('tags')
            .insert({
            name: trimmedName,
            slug: slug,
        })
            .select()
            .single();
        if (error) {
            if (error.code === '23505' || error.message?.includes('duplicate')) {
                this.logger.debug('Tag created by another request, fetching...');
                const { data: newExisting } = await supabase
                    .from('tags')
                    .select('*')
                    .eq('slug', slug)
                    .single();
                if (newExisting) {
                    return this.mapToDto(newExisting);
                }
            }
            this.logger.error('Error creating tag:', error);
            throw new common_1.BadRequestException(`Failed to create tag: ${error.message}`);
        }
        this.logger.log(`Tag created: ${data.id} (${data.name})`);
        return this.mapToDto(data);
    }
    async getOrCreateMultiple(names) {
        const uniqueNames = [...new Set(names.map((n) => n.trim()))];
        const tags = [];
        for (const name of uniqueNames) {
            if (name) {
                const tag = await this.getOrCreate(name);
                tags.push(tag);
            }
        }
        return tags;
    }
    async findAll() {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name', { ascending: true });
        if (error) {
            this.logger.error('Error fetching tags:', error);
            throw new common_1.BadRequestException('Failed to fetch tags');
        }
        return data.map((tag) => this.mapToDto(tag));
    }
    async findPopular(limit = 10) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('tags')
            .select(`
        *,
        news_tags(count)
      `)
            .limit(limit)
            .order('news_tags(count)', { ascending: false });
        if (error) {
            this.logger.error('Error fetching popular tags:', error);
            throw new common_1.BadRequestException('Failed to fetch popular tags');
        }
        return data.map((tag) => this.mapToDto(tag));
    }
    async linkToNews(newsId, tagIds) {
        if (tagIds.length === 0)
            return;
        const supabase = this.supabaseService.getServiceClient();
        const junctions = tagIds.map((tagId) => ({
            news_id: newsId,
            tag_id: tagId,
        }));
        const { error } = await supabase
            .from('news_tags')
            .insert(junctions)
            .select();
        if (error) {
            if (error.code !== '23505') {
                this.logger.error('Error linking tags to news:', error);
                throw new common_1.BadRequestException(`Failed to link tags: ${error.message}`);
            }
        }
        this.logger.debug(`Linked ${tagIds.length} tags to news ${newsId}`);
    }
    async unlinkFromNews(newsId) {
        const supabase = this.supabaseService.getServiceClient();
        const { error } = await supabase
            .from('news_tags')
            .delete()
            .eq('news_id', newsId);
        if (error) {
            this.logger.error('Error unlinking tags from news:', error);
            throw new common_1.BadRequestException(`Failed to unlink tags: ${error.message}`);
        }
        this.logger.debug(`Unlinked all tags from news ${newsId}`);
    }
    async updateNewsTags(newsId, tagNames) {
        const tags = await this.getOrCreateMultiple(tagNames);
        await this.unlinkFromNews(newsId);
        await this.linkToNews(newsId, tags.map((t) => t.id));
        return tags;
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = TagsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TagsService);
//# sourceMappingURL=tags.service.js.map