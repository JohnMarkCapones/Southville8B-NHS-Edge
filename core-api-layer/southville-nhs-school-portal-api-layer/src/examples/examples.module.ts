import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoleExamplesController } from './role-examples.controller';

@Module({
  imports: [AuthModule],
  controllers: [RoleExamplesController],
})
export class ExamplesModule {}
