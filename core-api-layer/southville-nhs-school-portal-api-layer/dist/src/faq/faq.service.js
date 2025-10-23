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
var FaqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let FaqService = FaqService_1 = class FaqService {
    configService;
    logger = new common_1.Logger(FaqService_1.name);
    supabase = null;
    constructor(configService) {
        this.configService = configService;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new common_1.InternalServerErrorException('Database configuration is missing. Please contact administrator.');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async create(createFaqDto) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('faq')
            .insert({
            question: createFaqDto.question,
            answer: createFaqDto.answer,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating FAQ:', error);
            throw new common_1.InternalServerErrorException('Failed to create FAQ');
        }
        this.logger.log(`Created FAQ: ${data.question}`);
        return data;
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, search } = filters;
        let query = supabase
            .from('faq')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });
        if (search) {
            query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
        }
        query = query.range((page - 1) * limit, page * limit - 1);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching FAQs:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch FAQs');
        }
        const totalPages = Math.ceil((count || 0) / limit);
        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            totalPages,
        };
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('faq')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('FAQ not found');
        }
        return data;
    }
    async update(id, updateFaqDto) {
        const supabase = this.getSupabaseClient();
        const existingFaq = await this.findOne(id);
        const { data, error } = await supabase
            .from('faq')
            .update({
            ...(updateFaqDto.question && { question: updateFaqDto.question }),
            ...(updateFaqDto.answer && { answer: updateFaqDto.answer }),
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating FAQ:', error);
            throw new common_1.InternalServerErrorException('Failed to update FAQ');
        }
        this.logger.log(`Updated FAQ: ${data.question}`);
        return data;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        await this.findOne(id);
        const { error } = await supabase.from('faq').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting FAQ:', error);
            throw new common_1.InternalServerErrorException('Failed to delete FAQ');
        }
        this.logger.log(`Deleted FAQ with ID: ${id}`);
    }
    async search(query) {
        const supabase = this.getSupabaseClient();
        const { data, error, count } = await supabase
            .from('faq')
            .select('*', { count: 'exact' })
            .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
            .order('created_at', { ascending: false });
        if (error) {
            this.logger.error('Error searching FAQs:', error);
            throw new common_1.InternalServerErrorException('Failed to search FAQs');
        }
        return {
            data: data || [],
            total: count || 0,
        };
    }
};
exports.FaqService = FaqService;
exports.FaqService = FaqService = FaqService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FaqService);
//# sourceMappingURL=faq.service.js.map