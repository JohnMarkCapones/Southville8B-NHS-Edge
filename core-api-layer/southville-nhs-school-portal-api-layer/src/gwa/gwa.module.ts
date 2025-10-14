import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from '../auth/auth.module';
import { GwaService } from './gwa.service';
import { GwaController } from './gwa.controller';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
    }),
    AuthModule,
  ],
  controllers: [GwaController],
  providers: [GwaService],
  exports: [GwaService],
})
export class GwaModule {}
