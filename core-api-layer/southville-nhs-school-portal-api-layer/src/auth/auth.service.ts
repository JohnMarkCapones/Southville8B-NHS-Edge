import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseUser,
  SupabaseJWTPayload,
} from './interfaces/supabase-user.interface';
import { JwtVerificationService } from './jwt-verification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
  // In src/auth/auth.service.ts, update the signIn method:
  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: SupabaseUser; session: any }> {
    try {
      const authClient = this.getAuthClient();
      const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // ✅ NEW: Ensure user exists in public.users table
      await this.ensureUserExistsInPublicTable(data.user);

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

      return { user, session: data.session };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  // ✅ NEW: Add this method to AuthService
  private async ensureUserExistsInPublicTable(authUser: any): Promise<void> {
    try {
      const supabase = this.getServiceClient();

      console.log('🔍 Ensuring user exists in public.users:', authUser.id);

      // Check if user exists in public.users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, role_id')
        .eq('id', authUser.id)
        .single();

      // Get role ID based on user metadata
      const roleName = authUser.user_metadata?.role || 'Student';
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        this.logger.error(
          `❌ Role '${roleName}' not found in database`,
          roleError,
        );
        throw new InternalServerErrorException(
          `Role '${roleName}' not found. Please ensure roles table is properly seeded.`,
        );
      }

      const roleId: string = role.id;

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('❌ Error checking existing user:', checkError);
        return;
      }

      if (!existingUser) {
        console.log('📝 User not found, creating new user...');

        // Insert user into public.users table
        const userData = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email,
          ...(roleId ? { role_id: roleId } : {}),
          status: 'Active',
        };

        console.log('📝 Inserting user data:', userData);

        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error inserting user:', insertError);
        } else {
          console.log('✅ User successfully inserted:', insertedUser);
        }
      } else {
        console.log('📝 User exists, checking if update needed...');

        // Check if user needs updating (wrong email or missing role_id)
        const needsUpdate =
          existingUser.email !== authUser.email ||
          (!existingUser.role_id && !!roleId);

        if (needsUpdate) {
          console.log('🔄 Updating user information...');

          const updateData: any = {};
          if (existingUser.email !== authUser.email) {
            updateData.email = authUser.email;
            updateData.full_name =
              authUser.user_metadata?.full_name || authUser.email;
          }
          if (!existingUser.role_id && roleId) {
            updateData.role_id = roleId;
          }

          console.log('📝 Updating user data:', updateData);

          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', authUser.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error updating user:', updateError);
          } else {
            console.log('✅ User successfully updated:', updatedUser);
          }
        } else {
          console.log('✅ User is up to date');
        }
      }
    } catch (error) {
      console.error(
        '❌ Unexpected error in ensureUserExistsInPublicTable:',
        error,
      );
    }
  }

  /**
   * Verifies a Supabase JWT token locally without network calls
   * @param token - The JWT token to verify
   * @returns Promise<SupabaseUser> - The verified user data
   * @throws UnauthorizedException - If token is invalid or expired
   */
  // async verifyToken(token: string): Promise<SupabaseUser> {
  //   try {
  //     // Use local JWT verification (no network calls)
  //     return await this.jwtVerificationService.verifyTokenLocally(token);
  //   } catch (error) {
  //     if (error instanceof UnauthorizedException) {
  //       throw error;
  //     }
  //     throw new UnauthorizedException('Token verification failed');
  //   }
  // }

  // In replace the verifyToken method:
  async verifyToken(token: string): Promise<SupabaseUser> {
    try {
      const authClient = this.getAuthClient();

      // Use Supabase's built-in token verification
      const {
        data: { user },
        error,
      } = await authClient.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Transform to SupabaseUser interface
      const supabaseUser: SupabaseUser = {
        id: user.id,
        email: user.email || '',
        role: user.role,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        aud: user.aud || 'authenticated',
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_confirmed_at: user.email_confirmed_at,
        phone: user.phone,
        phone_confirmed_at: user.phone_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        confirmed_at: user.confirmed_at,
      };

      return supabaseUser;
    } catch (error) {
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

  /**
   * Role hierarchy definition
   * Higher roles inherit permissions from lower roles
   */
  private readonly ROLE_HIERARCHY = {
    Admin: ['Admin', 'Teacher', 'Student'],
    Teacher: ['Teacher', 'Student'],
    Student: ['Student'],
  };

  /**
   * Check if a user role has access to a required role (hierarchy support)
   * @param userRole - The user's actual role
   * @param requiredRole - The role required for access
   * @returns boolean - Whether the user has access
   */
  hasRoleHierarchy(userRole: string, requiredRole: string): boolean {
    const allowedRoles = this.ROLE_HIERARCHY[userRole] || [];
    return allowedRoles.includes(requiredRole);
  }

  /**
   * Gets user role from public.users table (with caching)
   * @param userId - The user ID
   * @returns Promise<string | null> - The user's role name
   */
  async getUserRoleFromDatabase(userId: string): Promise<string | null> {
    try {
      const supabase = this.getServiceClient();

      // Query public.users table joined with roles table
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id,
          role_id,
          roles!inner(name)
        `,
        )
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role from database:', error);
        return null;
      }

      // Extract role name from the joined data
      const roleName = (data as any)?.roles?.name;
      return roleName || null;
    } catch (error) {
      console.error('Error in getUserRoleFromDatabase:', error);
      return null;
    }
  }
}
