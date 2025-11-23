import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ActivityMonitoringModule } from '../activity-monitoring/activity-monitoring.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    ActivityMonitoringModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
