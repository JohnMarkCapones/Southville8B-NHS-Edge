import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
