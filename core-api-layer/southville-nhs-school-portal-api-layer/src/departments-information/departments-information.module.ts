import { Module } from '@nestjs/common';
import { DepartmentsInformationService } from './departments-information.service';
import { DepartmentsInformationController } from './departments-information.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DepartmentsInformationController],
  providers: [DepartmentsInformationService],
})
export class DepartmentsInformationModule {}
