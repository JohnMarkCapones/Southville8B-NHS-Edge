/**
 * Domains API Endpoints
 *
 * API functions for fetching domains and domain roles from the database
 * Based on: domains, domain_roles, user_domain_roles tables
 *
 * @module lib/api/endpoints/domains
 */

'use client';

import { apiClient } from '../client';
import type { Domain, DomainRole, UserDomainRole } from '../types/domain-roles';

// Re-export types for convenience
export type { Domain, DomainRole, UserDomainRole } from '../types/domain-roles';

/**
 * Get all domains
 *
 * @returns Promise with array of domains
 *
 * @example
 * ```typescript
 * const domains = await getDomains();
 * // Returns all domains: clubs, journalism orgs, departments, etc.
 * ```
 */
export async function getDomains(): Promise<Domain[]> {
  return apiClient.get<Domain[]>('/domains');
}

/**
 * Get domains filtered by type
 *
 * @param type - Domain type (e.g., "club", "journalism", "department", "class")
 * @returns Promise with filtered domains
 *
 * @example
 * ```typescript
 * const clubs = await getDomainsByType('club');
 * const journalism = await getDomainsByType('journalism');
 * ```
 */
export async function getDomainsByType(type: string): Promise<Domain[]> {
  return apiClient.get<Domain[]>(`/domains?type=${encodeURIComponent(type)}`);
}

/**
 * Get a specific domain by ID
 *
 * @param domainId - Domain ID
 * @returns Promise with domain data
 */
export async function getDomainById(domainId: string): Promise<Domain> {
  return apiClient.get<Domain>(`/domains/${domainId}`);
}

/**
 * Get all domain roles
 *
 * @returns Promise with array of domain roles
 *
 * @example
 * ```typescript
 * const allRoles = await getDomainRoles();
 * ```
 */
export async function getDomainRoles(): Promise<DomainRole[]> {
  return apiClient.get<DomainRole[]>('/domain-roles');
}

/**
 * Get domain roles for a specific domain
 *
 * @param domainId - Domain ID
 * @returns Promise with domain roles for that domain
 *
 * @example
 * ```typescript
 * const mathClubRoles = await getDomainRolesByDomain('math-club-id');
 * // Returns: President, Vice President, Secretary, etc. for Math Club
 * ```
 */
export async function getDomainRolesByDomain(domainId: string): Promise<DomainRole[]> {
  return apiClient.get<DomainRole[]>(`/domains/${domainId}/roles`);
}

/**
 * Get domain roles filtered by domain type
 *
 * @param domainType - Domain type (e.g., "club", "journalism")
 * @returns Promise with domain roles for that type
 *
 * @example
 * ```typescript
 * const clubRoles = await getDomainRolesByType('club');
 * // Returns all roles from all clubs
 * ```
 */
export async function getDomainRolesByType(domainType: string): Promise<DomainRole[]> {
  return apiClient.get<DomainRole[]>(`/domain-roles?type=${encodeURIComponent(domainType)}`);
}

/**
 * Get a specific domain role by ID
 *
 * @param domainRoleId - Domain role ID
 * @returns Promise with domain role data
 */
export async function getDomainRoleById(domainRoleId: string): Promise<DomainRole> {
  return apiClient.get<DomainRole>(`/domain-roles/${domainRoleId}`);
}

/**
 * Get all domain role assignments for a user
 *
 * @param userId - User ID
 * @returns Promise with user's domain role assignments
 *
 * @example
 * ```typescript
 * const userRoles = await getUserDomainRoles('user-id-123');
 * // Returns all domain roles assigned to this user
 * ```
 */
export async function getUserDomainRoles(userId: string): Promise<UserDomainRole[]> {
  return apiClient.get<UserDomainRole[]>(`/users/${userId}/domain-roles`);
}

/**
 * Assign a domain role to a user
 *
 * @param userId - User ID
 * @param domainRoleId - Domain role ID to assign
 * @returns Promise with created user domain role assignment
 *
 * @example
 * ```typescript
 * await assignUserDomainRole('user-id-123', 'president-role-id');
 * ```
 */
export async function assignUserDomainRole(
  userId: string,
  domainRoleId: string
): Promise<UserDomainRole> {
  return apiClient.post<UserDomainRole>(`/users/${userId}/domain-roles`, {
    domain_role_id: domainRoleId,
  });
}

/**
 * Remove a domain role assignment from a user
 *
 * @param userId - User ID
 * @param userDomainRoleId - User domain role assignment ID (from user_domain_roles table)
 * @returns Promise with void
 *
 * @example
 * ```typescript
 * await removeUserDomainRole('user-id-123', 'assignment-id-456');
 * ```
 */
export async function removeUserDomainRole(
  userId: string,
  userDomainRoleId: string
): Promise<void> {
  return apiClient.delete<void>(`/users/${userId}/domain-roles/${userDomainRoleId}`);
}

/**
 * Update multiple domain role assignments for a user (replaces all existing)
 *
 * @param userId - User ID
 * @param domainRoleIds - Array of domain role IDs to assign
 * @returns Promise with updated user domain role assignments
 *
 * @example
 * ```typescript
 * await updateUserDomainRoles('user-id-123', [
 *   'president-role-id',
 *   'editor-role-id'
 * ]);
 * ```
 */
export async function updateUserDomainRoles(
  userId: string,
  domainRoleIds: string[]
): Promise<UserDomainRole[]> {
  return apiClient.put<UserDomainRole[]>(`/users/${userId}/domain-roles`, {
    domain_role_ids: domainRoleIds,
  });
}
