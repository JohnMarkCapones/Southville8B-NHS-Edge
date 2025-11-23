import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from '../auth/auth.module';
import { ActivityMonitoringModule } from '../activity-monitoring/activity-monitoring.module';
import { GwaController } from './gwa.controller';
import { GwaPublicController } from './gwa-public.controller';
import { GwaService } from './gwa.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
    }),
    AuthModule,
    ActivityMonitoringModule,
  ],
  controllers: [GwaController, GwaPublicController],
  providers: [GwaService],
  exports: [GwaService],
})
export class GwaModule {}
