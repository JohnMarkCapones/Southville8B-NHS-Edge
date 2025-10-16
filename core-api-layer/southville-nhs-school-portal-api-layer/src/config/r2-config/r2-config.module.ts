import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2ConfigValidationService } from '../r2-config-validation/r2-config-validation.service';
import r2Config from '../r2.config';

@Module({
  imports: [ConfigModule.forFeature(r2Config)],
  providers: [R2ConfigValidationService],
  exports: [R2ConfigValidationService],
})
export class R2ConfigModule {}
