# 🔐 Auth Integration Layer

This directory contains the complete authentication integration layer for Supabase Auth with NestJS.

## 📁 Structure

```
src/auth/
├── auth.module.ts                    # Main auth module configuration
├── auth.service.ts                   # Token verification & user extraction service
├── supabase-auth.guard.ts            # JWT validation guard
├── auth-user.decorator.ts            # Custom decorator for injecting user payload
└── interfaces/
    └── supabase-user.interface.ts    # TypeScript interfaces for Supabase user data
```

## 🚀 Usage Examples

### Protecting Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(SupabaseAuthGuard) // Protects this route
  async getProtectedData(@AuthUser() user: SupabaseUser) {
    return {
      message: 'This is protected data',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

### Role-Based Access Control

```typescript
import { AuthService } from '../auth/auth.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  @UseGuards(SupabaseAuthGuard)
  async getUsers(@AuthUser() user: SupabaseUser) {
    // Check if user has admin role
    const isAdmin = await this.authService.hasRole(user.id, 'admin');

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return this.usersService.findAll();
  }
}
```

### Public vs Protected Endpoints

```typescript
@Controller('mixed')
export class MixedController {
  // Public endpoint - no authentication required
  @Get('public')
  getPublicData() {
    return { message: 'This is public data' };
  }

  // Protected endpoint - requires valid Supabase JWT
  @Get('private')
  @UseGuards(SupabaseAuthGuard)
  getPrivateData(@AuthUser() user: SupabaseUser) {
    return {
      message: 'This is private data',
      user: user.email,
    };
  }
}
```

## 🔧 Configuration

Make sure your `.env` file contains:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🛡️ Security Features

- **JWT Verification**: Uses Supabase service role for server-side token validation
- **Type Safety**: Full TypeScript support with interfaces
- **Error Handling**: Proper HTTP status codes for auth failures
- **User Context**: Automatic user data injection into route handlers
- **Role Support**: Built-in role checking capabilities

## 📝 Notes

- All authentication is handled by Supabase (sign-in, sign-up, password management)
- This layer only **verifies** Supabase-issued JWTs
- No custom login/register endpoints needed
- Uses service role key for secure server-side verification
