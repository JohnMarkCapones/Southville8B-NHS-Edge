import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private serviceClient: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

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
   * Gets the regular Supabase client (lazy initialization)
   */
  getClient(): SupabaseClient {
    if (!this.supabase) {
      this.validateConfig();

      const supabaseUrl = this.configService.get<string>('supabase.url');
      const anonKey = this.configService.get<string>('supabase.anonKey');

      this.supabase = createClient(supabaseUrl!, anonKey!);
    }
    return this.supabase;
  }

  /**
   * Gets the service role Supabase client (lazy initialization)
   */
  getServiceClient(): SupabaseClient {
    if (!this.serviceClient) {
      this.validateConfig();

      const supabaseUrl = this.configService.get<string>('supabase.url');
      const serviceRoleKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      this.serviceClient = createClient(supabaseUrl!, serviceRoleKey!);
    }
    return this.serviceClient;
  }
}
