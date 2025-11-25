/**
 * ========================================
 * ROLES REACT QUERY HOOK
 * ========================================
 * Custom hook for fetching system roles
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getRoles, type Role } from '@/lib/api/endpoints/roles';

/**
 * Fetch all system roles
 *
 * @example
 * ```tsx
 * function RoleSelector() {
 *   const { data: roles, isLoading } = useRoles();
 *
 *   if (isLoading) return <div>Loading roles...</div>;
 *
 *   return (
 *     <select>
 *       {roles?.map(role => (
 *         <option key={role.id} value={role.id}>{role.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useRoles(options?: UseQueryOptions<Role[], Error>) {
  return useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: getRoles,
    staleTime: 60 * 60 * 1000, // Roles rarely change, cache for 1 hour
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
    refetchOnWindowFocus: false,
    retry: 3,
    ...options,
  });
}
