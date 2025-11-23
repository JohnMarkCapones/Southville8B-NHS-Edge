import { Module } from '@nestjs/common';
import { DesktopTeacherDashboardController } from './desktop-teacher-dashboard.controller';
import { DesktopTeacherDashboardService } from './desktop-teacher-dashboard.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DesktopTeacherDashboardController],
  providers: [DesktopTeacherDashboardService],
  exports: [DesktopTeacherDashboardService],
})
export class DesktopTeacherDashboardModule {}
