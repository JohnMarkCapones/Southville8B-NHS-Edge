import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [ConfigModule, AuthModule, SupabaseModule],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
