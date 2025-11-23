/**
 * RequireAuth Component
 * 
 * Protected route wrapper that:
 * - Checks if user is authenticated
 * - Redirects to login if not authenticated
 * - Optionally checks for required roles
 * - Shows loading state during authentication check
 * 
 * Usage:
 * ```tsx
 * <RequireAuth>
 *   <YourProtectedContent />
 * </RequireAuth>
 * 
 * // With role requirement
 * <RequireAuth requiredRoles={['Admin', 'Teacher']}>
 *   <AdminOrTeacherContent />
 * </RequireAuth>
 * ```
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Loader2 } from 'lucide-react';

/**
 * Props for RequireAuth component
 */
interface RequireAuthProps {
  children: React.ReactNode;
  /** Required roles for access. If undefined, any authenticated user can access */
  requiredRoles?: ('Admin' | 'Teacher' | 'Student')[];
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom unauthorized component */
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Default loading component
 */
function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Verifying authentication...</p>
      </div>
    </div>
  );
}

/**
 * Default unauthorized component
 */
function DefaultUnauthorizedComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="text-6xl">🚫</div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/**
 * Protected route wrapper component
 */
export function RequireAuth({
  children,
  requiredRoles,
  loadingComponent,
  unauthorizedComponent,
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError, error } = useUser();

  useEffect(() => {
    // If loading, do nothing (show loading state)
    if (isLoading) return;

    // If error or no user, redirect to portal with role parameter
    if (isError || !user) {
      console.log('[RequireAuth] No authenticated user, redirecting to portal');
      
      // Determine role based on the current path
      let role = 'student'; // default
      if (pathname.startsWith('/teacher')) {
        role = 'teacher';
      } else if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
        role = 'admin';
      }
      
      const portalUrl = `/guess/portal?role=${role}`;
      router.push(portalUrl);
      return;
    }

    // If required roles are specified, check if user has one of them
    if (requiredRoles && user.role) {
      const userRole = user.role.name;
      console.log('[RequireAuth] Checking role access:', {
        userRole,
        requiredRoles,
        hasAccess: requiredRoles.includes(userRole as any)
      });
      
      if (!requiredRoles.includes(userRole as any)) {
        console.log(`[RequireAuth] ❌ UNAUTHORIZED: User role "${userRole}" not in required roles:`, requiredRoles);
        // Don't redirect, just show unauthorized component
        return;
      }
    }

    console.log('[RequireAuth] ✅ User authenticated:', user.email, 'Role:', user.role?.name);
  }, [isLoading, isError, user, router, pathname, requiredRoles]);

  // Show loading state
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Show error/redirect (will be redirecting in useEffect)
  if (isError || !user) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Check role requirements
  if (requiredRoles && user.role) {
    const userRole = user.role.name;
    if (!requiredRoles.includes(userRole as any)) {
      return unauthorizedComponent || <DefaultUnauthorizedComponent />;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

