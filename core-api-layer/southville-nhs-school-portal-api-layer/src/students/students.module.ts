import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentRankingsPublicController } from './student-rankings-public.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ActivityMonitoringModule } from '../activity-monitoring/activity-monitoring.module';

@Module({
  imports: [
    AuthModule, // Import AuthModule to access AuthService and SupabaseAuthGuard
    SupabaseModule, // Import SupabaseModule to access SupabaseService
    ActivityMonitoringModule, // Import ActivityMonitoringModule for advisory notifications
  ],
  controllers: [StudentsController, StudentRankingsPublicController],
  providers: [StudentsService],
  exports: [StudentsService], // Export StudentsService so other modules can use it
})
export class StudentsModule {}
