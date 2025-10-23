import { Module } from '@nestjs/common';
import { R2ConfigModule } from '../config/r2-config/r2-config.module';
import { R2StorageService } from './r2-storage/r2-storage.service';
import { R2HealthController } from './r2-health/r2-health.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [R2ConfigModule, AuthModule],
  controllers: [R2HealthController],
  providers: [R2StorageService],
  exports: [R2StorageService],
})
export class StorageModule {}
