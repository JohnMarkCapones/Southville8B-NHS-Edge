import { Module } from '@nestjs/common';
import { HotspotsService } from './hotspots.service';
import { HotspotsController } from './hotspots.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HotspotsController],
  providers: [HotspotsService],
})
export class HotspotsModule {}
