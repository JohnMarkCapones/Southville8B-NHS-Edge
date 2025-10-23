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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
const supabase_service_1 = require("./supabase/supabase.service");
let AppController = class AppController {
    appService;
    supabaseService;
    constructor(appService, supabaseService) {
        this.appService = appService;
        this.supabaseService = supabaseService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getHealth() {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .limit(1);
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                supabase: error ? 'disconnected' : 'connected',
                error: error?.message || null,
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                supabase: 'error',
                error: error.message,
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get welcome message' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Welcome message retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check application health and Supabase connectivity',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health check completed',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', example: '2025-01-10T18:05:34.000Z' },
                supabase: { type: 'string', example: 'connected' },
                error: { type: 'string', nullable: true },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('Health & Info'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        supabase_service_1.SupabaseService])
], AppController);
//# sourceMappingURL=app.controller.js.map