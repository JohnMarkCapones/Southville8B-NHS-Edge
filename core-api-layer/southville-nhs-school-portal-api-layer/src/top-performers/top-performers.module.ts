import { Module } from '@nestjs/common';
import { TopPerformersController } from './top-performers.controller';
import { TopPerformersService } from './top-performers.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [TopPerformersController],
  providers: [TopPerformersService],
  exports: [TopPerformersService],
})
export class TopPerformersModule {}
