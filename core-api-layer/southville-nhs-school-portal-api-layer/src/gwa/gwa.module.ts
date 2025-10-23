import { Module } from '@nestjs/common';
import { GwaController } from './gwa.controller';
import { GwaService } from './gwa.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GwaController],
  providers: [GwaService],
  exports: [GwaService],
})
export class GwaModule {}
