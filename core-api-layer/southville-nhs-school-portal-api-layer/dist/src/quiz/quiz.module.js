"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const auth_module_1 = require("../auth/auth.module");
const supabase_module_1 = require("../supabase/supabase.module");
const quiz_controller_1 = require("./controllers/quiz.controller");
const question_bank_controller_1 = require("./controllers/question-bank.controller");
const quiz_attempts_controller_1 = require("./controllers/quiz-attempts.controller");
const monitoring_controller_1 = require("./controllers/monitoring.controller");
const grading_controller_1 = require("./controllers/grading.controller");
const analytics_controller_1 = require("./controllers/analytics.controller");
const session_management_controller_1 = require("./controllers/session-management.controller");
const access_control_controller_1 = require("./controllers/access-control.controller");
const quiz_service_1 = require("./services/quiz.service");
const question_bank_service_1 = require("./services/question-bank.service");
const quiz_attempts_service_1 = require("./services/quiz-attempts.service");
const monitoring_service_1 = require("./services/monitoring.service");
const grading_service_1 = require("./services/grading.service");
const analytics_service_1 = require("./services/analytics.service");
const auto_grading_service_1 = require("./services/auto-grading.service");
const session_management_service_1 = require("./services/session-management.service");
const access_control_service_1 = require("./services/access-control.service");
const quiz_cache_service_1 = require("./services/quiz-cache.service");
let QuizModule = class QuizModule {
};
exports.QuizModule = QuizModule;
exports.QuizModule = QuizModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            supabase_module_1.SupabaseModule,
            cache_manager_1.CacheModule.register({
                ttl: 300000,
                max: 100,
            }),
        ],
        controllers: [
            quiz_controller_1.QuizController,
            question_bank_controller_1.QuestionBankController,
            quiz_attempts_controller_1.QuizAttemptsController,
            monitoring_controller_1.MonitoringController,
            grading_controller_1.GradingController,
            analytics_controller_1.AnalyticsController,
            session_management_controller_1.SessionManagementController,
            access_control_controller_1.AccessControlController,
        ],
        providers: [
            quiz_service_1.QuizService,
            question_bank_service_1.QuestionBankService,
            quiz_attempts_service_1.QuizAttemptsService,
            monitoring_service_1.MonitoringService,
            grading_service_1.GradingService,
            analytics_service_1.AnalyticsService,
            auto_grading_service_1.AutoGradingService,
            session_management_service_1.SessionManagementService,
            access_control_service_1.AccessControlService,
            quiz_cache_service_1.QuizCacheService,
        ],
        exports: [
            quiz_service_1.QuizService,
            question_bank_service_1.QuestionBankService,
            quiz_attempts_service_1.QuizAttemptsService,
            monitoring_service_1.MonitoringService,
            grading_service_1.GradingService,
            analytics_service_1.AnalyticsService,
        ],
    })
], QuizModule);
//# sourceMappingURL=quiz.module.js.map