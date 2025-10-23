import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SupabaseUser } from './interfaces/supabase-user.interface';

export const AuthUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): SupabaseUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested (e.g., 'id'), return just that property
    if (data && user) {
      return user[data];
    }

    // Otherwise return the full user object
    return user;
  },
);
