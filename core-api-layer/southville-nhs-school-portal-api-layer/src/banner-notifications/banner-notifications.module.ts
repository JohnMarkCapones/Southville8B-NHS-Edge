import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BannerNotificationsController } from './banner-notifications.controller';
import { BannerNotificationsService } from './banner-notifications.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [BannerNotificationsController],
  providers: [BannerNotificationsService],
  exports: [BannerNotificationsService],
})
export class BannerNotificationsModule {}
