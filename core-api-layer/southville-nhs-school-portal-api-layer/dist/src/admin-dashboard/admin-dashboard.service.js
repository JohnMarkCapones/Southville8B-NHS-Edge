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
var AdminDashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let AdminDashboardService = AdminDashboardService_1 = class AdminDashboardService {
    configService;
    logger = new common_1.Logger(AdminDashboardService_1.name);
    supabase;
    metricsSubject = new rxjs_1.Subject();
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('supabase.url');
        const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
        this.startMetricsPolling();
    }
    startMetricsPolling() {
        (0, rxjs_1.interval)(30000)
            .pipe((0, operators_1.startWith)(0), (0, operators_1.switchMap)(() => this.fetchMetrics()))
            .subscribe({
            next: (metrics) => {
                this.metricsSubject.next(metrics);
                this.logger.log(`Admin dashboard metrics updated: ${JSON.stringify(metrics)}`);
            },
            error: (error) => {
                this.logger.error('Error updating admin dashboard metrics:', error);
            },
        });
    }
    async fetchMetrics() {
        try {
            const { count: studentsCount } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Active')
                .eq('role_id', '129922d5-b2c3-4ac9-89d7-0f1bb9946551');
            const { count: teachersCount } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Active')
                .eq('role_id', 'f8e53b78-9508-48b1-8d7f-4afa2e6f83c6');
            const { count: sectionsCount } = await this.supabase
                .from('sections')
                .select('*', { count: 'exact', head: true });
            const onlineUsersCount = Math.floor(Math.random() * 50) + 300;
            return {
                totalStudents: studentsCount || 0,
                activeTeachers: teachersCount || 0,
                totalSections: sectionsCount || 0,
                onlineUsersCount: onlineUsersCount,
                lastUpdated: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching admin dashboard metrics:', error);
            return {
                totalStudents: 1512,
                activeTeachers: 45,
                totalSections: 144,
                onlineUsersCount: 324,
                lastUpdated: new Date().toISOString(),
            };
        }
    }
    getMetricsStream() {
        return this.metricsSubject.asObservable().pipe((0, operators_1.map)((metrics) => new MessageEvent('dashboard-metrics-update', {
            data: JSON.stringify(metrics),
        })));
    }
    async triggerMetricsUpdate() {
        const metrics = await this.fetchMetrics();
        this.metricsSubject.next(metrics);
        return metrics;
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = AdminDashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map