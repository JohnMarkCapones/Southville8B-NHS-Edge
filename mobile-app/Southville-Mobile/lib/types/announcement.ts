export interface AnnouncementTag {
  id: string;
  name: string;
  color?: string;
}

export interface AnnouncementRole {
  id: string;
  name: string;
}

export interface AnnouncementUser {
  id: string;
  fullName: string;
  email: string;
}

export interface Announcement {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  type?: string;
  visibility: 'public' | 'private';
  user?: AnnouncementUser;
  tags?: AnnouncementTag[];
  targetRoles?: AnnouncementRole[];
}

export interface AnnouncementsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AnnouncementsResponse {
  data: Announcement[];
  pagination: AnnouncementsPagination;
}

export interface AnnouncementsParams {
  page?: number;
  limit?: number;
  visibility?: 'public' | 'private';
  type?: string;
  roleId?: string;
  includeExpired?: boolean;
}
