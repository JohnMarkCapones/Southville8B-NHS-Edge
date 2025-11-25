import { Module } from '@nestjs/common';
import { StudentActivitiesController } from './student-activities.controller';
import { StudentActivitiesService } from './student-activities.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [StudentActivitiesController],
  providers: [StudentActivitiesService],
  exports: [StudentActivitiesService], // Export so other modules can use it
})
export class StudentActivitiesModule {}
