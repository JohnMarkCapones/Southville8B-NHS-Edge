import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

// Controllers
import { QuizController } from './controllers/quiz.controller';
import { QuestionBankController } from './controllers/question-bank.controller';
import { QuizAttemptsController } from './controllers/quiz-attempts.controller';
import { MonitoringController } from './controllers/monitoring.controller';
import { GradingController } from './controllers/grading.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { SessionManagementController } from './controllers/session-management.controller';
import { AccessControlController } from './controllers/access-control.controller';

// Services
import { QuizService } from './services/quiz.service';
import { QuestionBankService } from './services/question-bank.service';
import { QuizAttemptsService } from './services/quiz-attempts.service';
import { MonitoringService } from './services/monitoring.service';
import { GradingService } from './services/grading.service';
import { AnalyticsService } from './services/analytics.service';
import { AutoGradingService } from './services/auto-grading.service';
import { SessionManagementService } from './services/session-management.service';
import { AccessControlService } from './services/access-control.service';
import { QuizCacheService } from './services/quiz-cache.service';

@Module({
  imports: [
    AuthModule, // Import AuthModule to access AuthService and SupabaseAuthGuard
    SupabaseModule, // Import SupabaseModule to access SupabaseService
    CacheModule.register({
      ttl: 300000, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [
    QuizController,
    QuestionBankController,
    QuizAttemptsController,
    MonitoringController,
    GradingController,
    AnalyticsController,
    SessionManagementController,
    AccessControlController,
  ],
  providers: [
    QuizService,
    QuestionBankService,
    QuizAttemptsService,
    MonitoringService,
    GradingService,
    AnalyticsService,
    AutoGradingService,
    SessionManagementService,
    AccessControlService,
    QuizCacheService,
  ],
  exports: [
    QuizService,
    QuestionBankService,
    QuizAttemptsService,
    MonitoringService,
    GradingService,
    AnalyticsService,
  ], // Export all services for use in other modules
})
export class QuizModule {}
