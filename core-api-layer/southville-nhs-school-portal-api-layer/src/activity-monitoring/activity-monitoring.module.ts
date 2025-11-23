import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityMonitoringService } from './activity-monitoring.service';

@Module({
  imports: [ConfigModule],
  providers: [ActivityMonitoringService],
  exports: [ActivityMonitoringService],
})
export class ActivityMonitoringModule {}

