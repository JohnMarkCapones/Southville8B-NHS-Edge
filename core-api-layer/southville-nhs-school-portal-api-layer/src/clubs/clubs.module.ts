import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
