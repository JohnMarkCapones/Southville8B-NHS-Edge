import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@Injectable()
export class JwtVerificationService {
  constructor(private configService: ConfigService) {}

  /**
   * Verifies a Supabase JWT token locally without network calls
   * @param token - The JWT token to verify
   * @returns Promise<SupabaseUser> - The verified user data
   * @throws UnauthorizedException - If token is invalid or expired
   */
  async verifyTokenLocally(token: string): Promise<SupabaseUser> {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/i, '');

      // Decode JWT without verification first to get the header
      const decodedHeader = jwt.decode(cleanToken, { complete: true });

      if (!decodedHeader || typeof decodedHeader === 'string') {
        throw new UnauthorizedException('Invalid token format');
      }

      // Get the JWT payload
      const payload = decodedHeader.payload as any;

      // Verify token signature using Supabase's public key
      // For Supabase, we can verify using the JWT secret (service role key)
      const serviceRoleKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!serviceRoleKey) {
        throw new Error(
          'SUPABASE_SERVICE_ROLE_KEY is required for JWT verification',
        );
      }

      // Verify the token
      const verifiedPayload = jwt.verify(cleanToken, serviceRoleKey) as any;

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (verifiedPayload.exp && verifiedPayload.exp < currentTime) {
        throw new UnauthorizedException('Token has expired');
      }

      // Transform payload to SupabaseUser interface
      const user: SupabaseUser = {
        id: verifiedPayload.sub || verifiedPayload.user_id,
        email: verifiedPayload.email || '',
        role: verifiedPayload.role || verifiedPayload.user_metadata?.role,
        user_metadata: verifiedPayload.user_metadata,
        app_metadata: verifiedPayload.app_metadata,
        aud: verifiedPayload.aud || 'authenticated',
        created_at: verifiedPayload.created_at,
        updated_at: verifiedPayload.updated_at,
        email_confirmed_at: verifiedPayload.email_confirmed_at,
        phone: verifiedPayload.phone,
        phone_confirmed_at: verifiedPayload.phone_confirmed_at,
        last_sign_in_at: verifiedPayload.last_sign_in_at,
        confirmed_at: verifiedPayload.confirmed_at,
      };

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token signature');
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }

      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Extracts user payload from JWT token without verification
   * @param token - The JWT token
   * @returns any - The JWT payload
   */
  extractPayload(token: string): any {
    try {
      const cleanToken = token.replace(/^Bearer\s+/i, '');
      const payload = jwt.decode(cleanToken);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }
}
