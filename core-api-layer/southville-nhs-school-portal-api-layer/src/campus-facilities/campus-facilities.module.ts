import { Module } from '@nestjs/common';
import { CampusFacilitiesService } from './campus-facilities.service';
import { CampusFacilitiesController } from './campus-facilities.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [CampusFacilitiesController],
  providers: [CampusFacilitiesService],
  exports: [CampusFacilitiesService],
})
export class CampusFacilitiesModule {}
