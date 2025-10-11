import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SupabaseUser } from './interfaces/supabase-user.interface';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SupabaseUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
