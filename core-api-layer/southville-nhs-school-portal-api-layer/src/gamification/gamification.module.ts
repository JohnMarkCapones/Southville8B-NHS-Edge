import { Module, forwardRef } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { StudentActivitiesModule } from '../student-activities/student-activities.module';
import { AuthModule } from '../auth/auth.module';

// Services
import { PointsService } from './services/points.service';
import { BadgeService } from './services/badge.service';
import { LevelService } from './services/level.service';
import { LeaderboardService } from './services/leaderboard.service';
import { StreakService } from './services/streak.service';

// Controllers
import { GamificationController } from './controllers/gamification.controller';
import { BadgeController } from './controllers/badge.controller';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    forwardRef(() => StudentActivitiesModule),
  ],
  providers: [
    LevelService,
    BadgeService,
    PointsService,
    LeaderboardService,
    StreakService,
  ],
  controllers: [
    GamificationController,
    BadgeController,
  ],
  exports: [
    PointsService,
    BadgeService,
    LevelService,
    LeaderboardService,
    StreakService,
  ],
})
export class GamificationModule {}
