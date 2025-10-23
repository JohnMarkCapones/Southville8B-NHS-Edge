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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = class SupabaseService {
    configService;
    supabase = null;
    serviceClient = null;
    constructor(configService) {
        this.configService = configService;
    }
    validateConfig() {
        const supabaseUrl = this.configService.get('supabase.url');
        const anonKey = this.configService.get('supabase.anonKey');
        const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL is required but not set in environment variables');
        }
        if (!anonKey) {
            throw new Error('SUPABASE_ANON_KEY is required but not set in environment variables');
        }
        if (!serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set in environment variables');
        }
        try {
            new URL(supabaseUrl);
        }
        catch (error) {
            throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
        }
    }
    getClient() {
        if (!this.supabase) {
            this.validateConfig();
            const supabaseUrl = this.configService.get('supabase.url');
            const anonKey = this.configService.get('supabase.anonKey');
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, anonKey);
        }
        return this.supabase;
    }
    getClientWithAuth(accessToken) {
        this.validateConfig();
        const supabaseUrl = this.configService.get('supabase.url');
        const anonKey = this.configService.get('supabase.anonKey');
        const client = (0, supabase_js_1.createClient)(supabaseUrl, anonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        });
        return client;
    }
    getServiceClient() {
        if (!this.serviceClient) {
            this.validateConfig();
            const supabaseUrl = this.configService.get('supabase.url');
            const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
            this.serviceClient = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
        }
        return this.serviceClient;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map