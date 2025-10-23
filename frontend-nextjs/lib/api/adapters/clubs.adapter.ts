/**
 * ========================================
 * CLUBS DATA ADAPTER
 * ========================================
 * Transforms backend Club API data to frontend-friendly format
 * Handles data mapping between API schema and UI requirements
 */

import type { Club } from '../types/clubs';

/**
 * Frontend-friendly club row for table display
 */
export interface ClubTableRow {
  id: string;
  name: string;
  description: string;
  logo?: string;

  // Leadership
  president: string;
  presidentEmail?: string;
  vicePresident: string;
  vpEmail?: string;
  secretary: string;
  secretaryEmail?: string;
  adviser: string;
  adviserEmail?: string;
  coAdviser?: string;
  coAdviserEmail?: string;

  // Organization
  domain: string;
  domainType: string;
  department?: string;

  // Membership
  membersCount: number;
  activeMembers: number;

  // Status (derived or default)
  status: 'Active' | 'Inactive' | 'On Hold' | 'Recruiting';
  isRecruiting: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Club membership interface (simplified)
 * Matches backend ClubMembership model
 */
export interface ClubMembershipSummary {
  id: string;
  studentId: string;
  clubId: string;
  positionId: string;
  joinedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform a single Club from backend to table row format
 */
export function transformClubToTableRow(
  club: Club,
  memberships: ClubMembershipSummary[] = []
): ClubTableRow {
  // Filter memberships for this club using camelCase (backend uses camelCase)
  const clubMemberships = memberships.filter(m => m.clubId === club.id);
  const activeMemberships = clubMemberships.filter(m => m.isActive);

  return {
    id: club.id,
    name: club.name,
    description: club.description,
    logo: undefined, // TODO: Add logo field to backend when implemented

    // Leadership - use full_name from populated relations
    president: club.president?.full_name || 'N/A',
    presidentEmail: club.president?.email,
    vicePresident: club.vp?.full_name || 'N/A',
    vpEmail: club.vp?.email,
    secretary: club.secretary?.full_name || 'N/A',
    secretaryEmail: club.secretary?.email,
    adviser: club.advisor?.full_name || 'N/A',
    adviserEmail: club.advisor?.email,
    coAdviser: club.co_advisor?.full_name,
    coAdviserEmail: club.co_advisor?.email,

    // Organization - domain replaces category
    domain: club.domain?.name || 'Unknown',
    domainType: club.domain?.type || 'unknown',
    department: getDepartmentFromDomain(club.domain?.name),

    // Membership counts
    membersCount: clubMemberships.length,
    activeMembers: activeMemberships.length,

    // Status - default to Active (TODO: add status field to backend)
    status: 'Active',
    isRecruiting: false, // TODO: add recruiting field to backend

    // Timestamps
    createdAt: club.created_at,
    updatedAt: club.updated_at,
  };
}

/**
 * Transform multiple clubs to table rows
 */
export function transformClubsToTableRows(
  clubs: Club[],
  memberships: ClubMembershipSummary[] = []
): ClubTableRow[] {
  return clubs.map(club => transformClubToTableRow(club, memberships));
}

/**
 * Derive department from domain name
 * This is a temporary helper until proper department linking is implemented
 */
function getDepartmentFromDomain(domainName?: string): string | undefined {
  if (!domainName) return undefined;

  const domainToDepartment: Record<string, string> = {
    'Science': 'Science Department',
    'Mathematics': 'Mathematics Department',
    'English': 'English Department',
    'Sports': 'Sports Department',
    'Arts': 'Arts Department',
    'Technology': 'Technology Department',
    'Music': 'Music Department',
    'Drama': 'Drama Department',
    'Community Service': 'Student Affairs',
    'Academic': 'Academic Affairs',
  };

  return domainToDepartment[domainName] || `${domainName} Department`;
}

/**
 * Filter clubs by search term
 */
export function filterClubsBySearch(
  clubs: ClubTableRow[],
  searchTerm: string
): ClubTableRow[] {
  if (!searchTerm.trim()) return clubs;

  const lowerSearch = searchTerm.toLowerCase();

  return clubs.filter(club =>
    club.name.toLowerCase().includes(lowerSearch) ||
    club.description.toLowerCase().includes(lowerSearch) ||
    club.president.toLowerCase().includes(lowerSearch) ||
    club.vicePresident.toLowerCase().includes(lowerSearch) ||
    club.adviser.toLowerCase().includes(lowerSearch) ||
    club.domain.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Filter clubs by status
 */
export function filterClubsByStatus(
  clubs: ClubTableRow[],
  status: string
): ClubTableRow[] {
  if (status === 'all') return clubs;

  return clubs.filter(club =>
    club.status.toLowerCase() === status.toLowerCase()
  );
}

/**
 * Sort clubs by field
 */
export function sortClubs(
  clubs: ClubTableRow[],
  sortBy: 'name' | 'members' | 'created' = 'name',
  direction: 'asc' | 'desc' = 'asc'
): ClubTableRow[] {
  const sorted = [...clubs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'members':
        comparison = a.membersCount - b.membersCount;
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Get domain/category badge color
 */
export function getDomainBadgeColor(domainName: string): string {
  const colorMap: Record<string, string> = {
    'Academic': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Science': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Mathematics': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Sports': 'bg-green-500/10 text-green-700 border-green-500/20',
    'Arts': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
    'Music': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
    'Drama': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
    'Technology': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    'Community Service': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Service': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Cultural': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  };

  return colorMap[domainName] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
}
