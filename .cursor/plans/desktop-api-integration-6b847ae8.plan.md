<!-- 6b847ae8-ee42-443d-ad37-ecdb7c7eed33 3960a3ac-ec6a-4a4f-bb00-07051463973d -->
# Fix User Role in Login Response

## Problem

The backend is returning `role: "authenticated"` (Supabase's default) instead of the actual user role from the `public.users` table, preventing the desktop app from navigating to the correct dashboard.

## Root Cause

In `auth.service.ts`, the `signIn` method (line 124) returns:

```typescript
role: data.user.role  // Returns "authenticated" from Supabase Auth
```

But it should fetch the role from `public.users` table joined with `roles` table.

## Solution

Update the `signIn` method in `AuthService` to:

1. After successful Supabase authentication
2. Call `getUserRoleFromDatabase(userId)` to get the actual role name
3. Return the role name from the database instead of Supabase's default role

## Implementation

### File: `core-api-layer/southville-nhs-school-portal-api-layer/src/auth/auth.service.ts`

**Current code (lines 102-144):**

```typescript
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

    await this.ensureUserExistsInPublicTable(data.user);

    // Transform Supabase user data to our interface
    const user: SupabaseUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: data.user.role,  // ❌ This returns "authenticated"
      // ... other fields
    };

    return { user, session: data.session };
  } catch (error) {
    // error handling
  }
}
```

**Updated code:**

```typescript
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

    await this.ensureUserExistsInPublicTable(data.user);

    // ✅ Fetch actual role from public.users table
    const roleFromDatabase = await this.getUserRoleFromDatabase(data.user.id);
    
    // Transform Supabase user data to our interface
    const user: SupabaseUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: roleFromDatabase || data.user.role, // ✅ Use database role, fallback to Supabase role
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
```

**Change summary:**

- Add line after `ensureUserExistsInPublicTable`: `const roleFromDatabase = await this.getUserRoleFromDatabase(data.user.id);`
- Update role assignment: `role: roleFromDatabase || data.user.role,`

## Expected Behavior

After this change:

- Admin login returns: `role: "Admin"`
- Teacher login returns: `role: "Teacher"`  
- Student login returns: `role: "Student"`

The desktop app will then:

- Navigate Admin to AdminShellViewModel
- Navigate Teacher to TeacherShellViewModel
- Block Student with "Access Denied" message

## Testing

1. Restart the NestJS backend
2. Login with `superadmin@gmail.com` in desktop app
3. Check debug output shows `role: "Admin"` instead of `role: "authenticated"`
4. Verify desktop app navigates to admin dashboard
5. Test with teacher and student accounts to verify role blocking

### To-dos

- [ ] Update LoginViewModel to block student login, clear tokens, and show access denied error
- [ ] Clear password field when student access is blocked for security
- [ ] Add AccessControl configuration to appsettings.json for allowed/blocked roles
- [ ] Test that student login is properly blocked with appropriate error message
- [ ] Verify Admin and Teacher can still login successfully