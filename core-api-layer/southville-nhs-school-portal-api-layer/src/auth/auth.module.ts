import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtVerificationService } from './jwt-verification.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule, // Import SupabaseModule to access SupabaseService
  ],
  providers: [
    AuthService,
    SupabaseAuthGuard,
    RolesGuard,
    JwtVerificationService,
  ],
  exports: [AuthService, SupabaseAuthGuard, RolesGuard, JwtVerificationService],
  controllers: [AuthController],
})
export class AuthModule {}
