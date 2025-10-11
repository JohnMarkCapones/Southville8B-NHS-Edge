import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseUser,
  SupabaseJWTPayload,
} from './interfaces/supabase-user.interface';
import { JwtVerificationService } from './jwt-verification.service';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient | null = null;
  private authClient: SupabaseClient | null = null;

  constructor(
    private configService: ConfigService,
    private jwtVerificationService: JwtVerificationService,
  ) {}

  /**
   * Validates Supabase configuration
   */
  private validateConfig(): void {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const anonKey = this.configService.get<string>('supabase.anonKey');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    if (!supabaseUrl) {
      throw new Error(
        'SUPABASE_URL is required but not set in environment variables',
      );
    }

    if (!anonKey) {
      throw new Error(
        'SUPABASE_ANON_KEY is required but not set in environment variables',
      );
    }

    if (!serviceRoleKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY is required but not set in environment variables',
      );
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (error) {
      throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
    }
  }

  /**
   * Gets the service role Supabase client (lazy initialization)
   */
  private getServiceClient(): SupabaseClient {
    if (!this.supabase) {
      this.validateConfig();

      const supabaseUrl = this.configService.get<string>('supabase.url');
      const serviceRoleKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      this.supabase = createClient(supabaseUrl!, serviceRoleKey!);
    }
    return this.supabase;
  }

  /**
   * Gets the auth client for user authentication (lazy initialization)
   */
  private getAuthClient(): SupabaseClient {
    if (!this.authClient) {
      this.validateConfig();

      const supabaseUrl = this.configService.get<string>('supabase.url');
      const anonKey = this.configService.get<string>('supabase.anonKey');

      this.authClient = createClient(supabaseUrl!, anonKey!);
    }
    return this.authClient;
  }

  /**
   * Authenticates a user with email and password using Supabase
   * @param email - User email address
   * @param password - User password
   * @returns Promise<{ user: SupabaseUser; session: any }> - User data and session
   * @throws UnauthorizedException - If credentials are invalid
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: SupabaseUser; session: any }> {
    try {
      // Use lazy-initialized auth client
      const authClient = this.getAuthClient();

      // Sign in with email and password
      const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Transform Supabase user data to our interface
      const user: SupabaseUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: data.user.role,
        user_metadata: data.user.user_metadata,
        app_metadata: data.user.app_metadata,
        aud: data.user.aud || 'authenticated',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        email_confirmed_at: data.user.email_confirmed_at,
        phone: data.user.phone,
        phone_confirmed_at: data.user.phone_confirmed_at,
        last_sign_in_at: data.user.last_sign_in_at,
        confirmed_at: data.user.confirmed_at,
      };

      return {
        user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Verifies a Supabase JWT token locally without network calls
   * @param token - The JWT token to verify
   * @returns Promise<SupabaseUser> - The verified user data
   * @throws UnauthorizedException - If token is invalid or expired
   */
  async verifyToken(token: string): Promise<SupabaseUser> {
    try {
      // Use local JWT verification (no network calls)
      return await this.jwtVerificationService.verifyTokenLocally(token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Extracts user payload from a verified JWT token
   * @param token - The JWT token
   * @returns Promise<SupabaseJWTPayload> - The JWT payload
   */
  async extractUserFromToken(token: string): Promise<SupabaseJWTPayload> {
    try {
      const cleanToken = token.replace(/^Bearer\s+/i, '');

      // Decode JWT payload (without verification - use verifyToken for verification)
      const payload = JSON.parse(
        Buffer.from(cleanToken.split('.')[1], 'base64').toString(),
      ) as SupabaseJWTPayload;

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }

  /**
   * Gets user role from Supabase auth.users table (lazy initialization)
   * @param userId - The user ID
   * @returns Promise<string | null> - The user's role name
   */
  async getUserRoleFromSupabase(userId: string): Promise<string | null> {
    try {
      // Use lazy-initialized service client
      const supabase = this.getServiceClient();

      // Query the auth.users table to get user role
      const { data, error } = await supabase
        .from('auth.users')
        .select('raw_user_meta_data')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      // Extract role from user metadata
      const role = data?.raw_user_meta_data?.role;
      return role || null;
    } catch (error) {
      console.error('Error in getUserRoleFromSupabase:', error);
      return null;
    }
  }

  /**
   * Gets user role information from custom user_roles table (if exists)
   * @param userId - The user ID
   * @returns Promise<string | undefined> - The user's role
   */
  async getUserRole(userId: string): Promise<string | undefined> {
    try {
      // Use lazy-initialized service client
      const supabase = this.getServiceClient();

      const { data, error } = await supabase
        .from('user_roles') // Assuming you have a user_roles table
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no custom role table exists, return undefined
        return undefined;
      }

      return data?.role;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Validates if a user has a specific role
   * @param userId - The user ID
   * @param requiredRole - The role to check for
   * @returns Promise<boolean> - Whether the user has the required role
   */
  async hasRole(userId: string, requiredRole: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === requiredRole;
  }
}
