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
var NewsCategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let NewsCategoriesService = NewsCategoriesService_1 = class NewsCategoriesService {
    supabaseService;
    logger = new common_1.Logger(NewsCategoriesService_1.name);
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
            description: dbRecord.description,
            created_at: dbRecord.created_at,
            updated_at: dbRecord.updated_at,
        };
    }
    async create(createDto) {
        const supabase = this.supabaseService.getServiceClient();
        const slug = this.generateSlug(createDto.name);
        this.logger.debug(`Creating category: ${createDto.name} (${slug})`);
        const { data, error } = await supabase
            .from('news_categories')
            .insert({
            name: createDto.name,
            slug: slug,
            description: createDto.description || null,
        })
            .select()
            .single();
        if (error) {
            if (error.code === '23505' || error.message?.includes('duplicate')) {
                throw new common_1.ConflictException(`Category with name "${createDto.name}" already exists`);
            }
            this.logger.error('Error creating category:', error);
            throw new common_1.BadRequestException(`Failed to create category: ${error.message}`);
        }
        this.logger.log(`Category created: ${data.id}`);
        return this.mapToDto(data);
    }
    async findAll() {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news_categories')
            .select('*')
            .order('name', { ascending: true });
        if (error) {
            this.logger.error('Error fetching categories:', error);
            throw new common_1.BadRequestException('Failed to fetch categories');
        }
        return data.map((category) => this.mapToDto(category));
    }
    async findOne(id) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news_categories')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error || !data) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return this.mapToDto(data);
    }
    async findBySlug(slug) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news_categories')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        if (error || !data) {
            throw new common_1.NotFoundException(`Category with slug "${slug}" not found`);
        }
        return this.mapToDto(data);
    }
    async update(id, updateDto) {
        const supabase = this.supabaseService.getServiceClient();
        await this.findOne(id);
        const updatePayload = {
            updated_at: new Date().toISOString(),
        };
        if (updateDto.name) {
            updatePayload.name = updateDto.name;
            updatePayload.slug = this.generateSlug(updateDto.name);
        }
        if (updateDto.description !== undefined) {
            updatePayload.description = updateDto.description;
        }
        const { data, error } = await supabase
            .from('news_categories')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === '23505' || error.message?.includes('duplicate')) {
                throw new common_1.ConflictException(`Category with name "${updateDto.name}" already exists`);
            }
            this.logger.error('Error updating category:', error);
            throw new common_1.BadRequestException(`Failed to update category: ${error.message}`);
        }
        this.logger.log(`Category updated: ${id}`);
        return this.mapToDto(data);
    }
    async remove(id) {
        const supabase = this.supabaseService.getServiceClient();
        await this.findOne(id);
        const { error } = await supabase
            .from('news_categories')
            .delete()
            .eq('id', id);
        if (error) {
            this.logger.error('Error deleting category:', error);
            throw new common_1.BadRequestException(`Failed to delete category: ${error.message}`);
        }
        this.logger.log(`Category deleted: ${id}`);
    }
};
exports.NewsCategoriesService = NewsCategoriesService;
exports.NewsCategoriesService = NewsCategoriesService = NewsCategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], NewsCategoriesService);
//# sourceMappingURL=news-categories.service.js.map