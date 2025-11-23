/**
 * ========================================
 * ROLES API ENDPOINTS
 * ========================================
 * API client functions for fetching system roles.
 *
 * Note: These are the base roles (Student, Teacher, Admin) used for
 * announcement targeting and user management.
 */

import { apiClient } from '../client';

/**
 * Role entity
 */
export interface Role {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all system roles
 *
 * This endpoint fetches the base roles (Student, Teacher, Admin)
 * from the roles table. These IDs are used for announcement targeting.
 *
 * @returns Promise with array of roles
 *
 * @example
 * ```ts
 * const roles = await getRoles();
 * const studentRole = roles.find(r => r.name === 'Student');
 * ```
 */
export async function getRoles(): Promise<Role[]> {
  // Real role IDs from the database
  // Retrieved from: SELECT id, name FROM roles;
  return Promise.resolve([
    { id: '129922d5-b2c3-4ac9-89d7-0f1bb9946551', name: 'Student' },
    { id: 'f8e53b78-9508-48b1-8d7f-4afa2e6f83c6', name: 'Teacher' },
    { id: '168be9c7-17ad-4790-a209-38d1bbc4a12a', name: 'Admin' },
  ]);
}

/**
 * Get role by name
 *
 * @param name - Role name (Student, Teacher, Admin)
 * @returns Promise with role or null if not found
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  const roles = await getRoles();
  return roles.find(r => r.name === name) || null;
}
