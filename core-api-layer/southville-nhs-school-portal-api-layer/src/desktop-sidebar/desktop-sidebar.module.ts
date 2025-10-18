import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { DesktopSidebarController } from './desktop-sidebar.controller';
import { DesktopSidebarService } from './desktop-sidebar.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [DesktopSidebarController],
  providers: [DesktopSidebarService],
  exports: [DesktopSidebarService],
})
export class DesktopSidebarModule {}
