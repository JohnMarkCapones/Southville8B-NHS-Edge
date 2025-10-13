import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtVerificationService } from './jwt-verification.service';
import { RoleCacheService } from './services/role-cache.service';
import { AuthController } from './auth.controller';
import { PbacModule } from './pbac.module';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule, // Import SupabaseModule to access SupabaseService
    PbacModule, // Import PBAC module for domain-specific permissions
  ],
  providers: [
    AuthService,
    SupabaseAuthGuard,
    RolesGuard,
    JwtVerificationService,
    RoleCacheService,
  ],
  exports: [
    AuthService,
    SupabaseAuthGuard,
    RolesGuard,
    JwtVerificationService,
    RoleCacheService,
    PbacModule, // Export PBAC module for use in other modules
  ],
  controllers: [AuthController],
})
export class AuthModule {}
