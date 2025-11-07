import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient | null = null;
  private serviceClient: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

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

    try {
      const url = new URL(supabaseUrl);
      // Validate URL format - should be https://xxxxx.supabase.co
      if (!url.protocol.startsWith('https')) {
        throw new Error(
          `SUPABASE_URL must use HTTPS protocol. Current: ${supabaseUrl}`,
        );
      }
      if (!url.hostname.includes('supabase.co')) {
        this.logger.warn(
          `SUPABASE_URL hostname does not contain 'supabase.co': ${url.hostname}. This may be incorrect.`,
        );
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          `Invalid SUPABASE_URL format: ${supabaseUrl}. Expected format: https://xxxxx.supabase.co`,
        );
      }
      throw error;
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      try {
        this.validateConfig();

        const supabaseUrl = this.configService.get<string>('supabase.url');
        const anonKey = this.configService.get<string>('supabase.anonKey');

        this.supabase = createClient(supabaseUrl!, anonKey!, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });

        this.logger.log('Supabase client initialized successfully');
      } catch (error) {
        this.logger.error(
          `Failed to initialize Supabase client: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      }
    }
    return this.supabase;
  }

  getClientWithAuth(accessToken: string): SupabaseClient {
    try {
      this.validateConfig();

      const supabaseUrl = this.configService.get<string>('supabase.url');
      const anonKey = this.configService.get<string>('supabase.anonKey');

      const client = createClient(supabaseUrl!, anonKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      this.logger.debug('Supabase client with auth initialized');
      return client;
    } catch (error) {
      this.logger.error(
        `Failed to initialize Supabase client with auth: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  getServiceClient(): SupabaseClient {
    if (!this.serviceClient) {
      try {
        this.validateConfig();

        const supabaseUrl = this.configService.get<string>('supabase.url');
        const serviceRoleKey = this.configService.get<string>(
          'supabase.serviceRoleKey',
        );

        this.serviceClient = createClient(supabaseUrl!, serviceRoleKey!, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });

        this.logger.log('Supabase service client initialized successfully');
      } catch (error) {
        this.logger.error(
          `Failed to initialize Supabase service client: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      }
    }
    return this.serviceClient;
  }
}

