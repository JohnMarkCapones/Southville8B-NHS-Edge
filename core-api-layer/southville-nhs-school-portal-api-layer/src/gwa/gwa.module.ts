import { Module } from '@nestjs/common';
import { GwaController } from './gwa.controller';
import { GwaPublicController } from './gwa-public.controller';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
    }),
    AuthModule,
  ],
  controllers: [GwaController, GwaPublicController],
  providers: [GwaService],
  exports: [GwaService],
})
export class GwaModule {}
