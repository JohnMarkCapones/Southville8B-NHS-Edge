import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseUser } from './interfaces/supabase-user.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify the token and get user data
      const user: SupabaseUser = await this.authService.verifyToken(token);

      // Attach user data and raw token to request object for use in controllers/services
      request.user = user;
      request.accessToken = token; // Store raw token for RLS-enabled Supabase queries

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }
  }

  /**
   * Extracts the JWT token from the Authorization header
   * @param request - The HTTP request object
   * @returns string | undefined - The extracted token or undefined
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
