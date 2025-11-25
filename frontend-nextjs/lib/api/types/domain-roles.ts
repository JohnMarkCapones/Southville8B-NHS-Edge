/**
 * Domain Roles Types
 *
 * Types for the PBAC (Permission-Based Access Control) system based on actual database schema
 * Matches: domains, domain_roles, user_domain_roles tables
 */

/**
 * Domain entity (from domains table)
 */
export interface Domain {
  id: string;
  type: string;           // e.g., "journalism", "club", "department", "class"
  name: string;           // e.g., "School Newspaper", "Math Club", "Science Department"
  created_at: string;
  created_by?: string;
}

/**
 * Domain role entity (from domain_roles table)
 */
export interface DomainRole {
  id: string;
  domain_id: string;      // FK to domains table
  name: string;           // e.g., "Editor-in-Chief", "President", "Department Head"
  created_at: string;
  // Joined relations
  domain?: Domain;        // Populated when joining with domains table
}

/**
 * User domain role assignment (from user_domain_roles table)
 */
export interface UserDomainRole {
  id: string;
  user_id: string;
  domain_role_id: string;
  created_at: string;
  // Joined relations
  domain_role?: DomainRole;
}

/**
 * Legacy UI SubRoles (for backward compatibility with all-users-management-section)
 * These are display-only and should eventually map to actual domain_roles
 */

/**
 * SubRole configuration for UI display
 * Maps to legacy subrole system in all-users-management-section
 */
export const STUDENT_SUBROLES = [
  'Club President',
  'Club Vice President',
  'Secretary',
  'Treasurer',
  'Auditor',
  'PIO',
  'Muse',
  'Escort',
  'Class Representative',
  'Peace Officer',
  'Business Manager',
  'Sergeant at Arms',
  'Environmental Officer',
  'Sports Captain',
  'IT Officer',
  'Health Officer',
  'Regular Student',
] as const;

export const TEACHER_SUBROLES = [
  'Department Head',
  'Club Adviser',
  'Sports Coordinator',
  'Academic Coordinator',
  'Guidance Counselor',
  'Library Coordinator',
  'Research Coordinator',
  'Regular Teacher',
] as const;

export const ADMIN_SUBROLES = [
  'Super Admin',
  'Assistant Admin',
  'Academic Coordinator',
  'System Administrator',
  'Regular Admin',
] as const;

/**
 * Get subroles for a base role
 */
export function getSubRolesForRole(baseRole: 'Student' | 'Teacher' | 'Admin' | 'Administrator'): readonly string[] {
  if (baseRole === 'Student') return STUDENT_SUBROLES;
  if (baseRole === 'Teacher') return TEACHER_SUBROLES;
  if (baseRole === 'Admin' || baseRole === 'Administrator') return ADMIN_SUBROLES;
  return [];
}
